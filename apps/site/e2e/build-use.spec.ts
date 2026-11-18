import { readFile } from "node:fs/promises";
import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// Use it and the shared view (S57): a copied link reopens the same system in a clean
// browser context, each file downloads, a tampered link falls back safely with a message,
// and "Save a copy" only adds a project.

const { use, shared, buttons, errors, status } = builderContent;
const brand = "#1762b6";

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

const fresh = async (page: Page) => {
  await page.goto("/build");
  await ready(page);
  await page.getByRole("button", { name: "New design system" }).click();
  await page.waitForURL("**/build/start");
};

const setBrand = async (page: Page, value: string) => {
  await page.goto("/build/colour");
  await ready(page);
  await page
    .getByTestId("brand-colour")
    .getByLabel(builderContent.colour.brandLabel, { exact: true })
    .fill(value);
};

const brand600 = (page: Page) =>
  page
    .getByTestId("preview")
    .evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--ds-color-brand-600").trim(),
    );

const openUse = async (page: Page) => {
  await page.goto("/build/use");
  await ready(page);
};

/** Clicks a Download button and returns the file's name and text. */
const downloaded = async (page: Page, label: string | RegExp) => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: label }).click(),
  ]);
  const path = await download.path();
  return {
    name: download.suggestedFilename(),
    text: await readFile(path, "utf8"),
  };
};

test("a copied link reopens the same system in a clean browser context", async ({
  page,
  browser,
}) => {
  await fresh(page);
  await setBrand(page, brand);
  const mine = await brand600(page);
  await openUse(page);

  await expect(page.getByText(status.snapshot)).toBeVisible();
  await page.getByRole("button", { name: buttons.copyLink }).click();
  const field = page.getByTestId("share-link");
  await expect(field).toBeVisible();
  // The browser may refuse the clipboard; either way the person is told and has the link.
  await expect(page.getByTestId("link-note")).not.toHaveText("");
  const link = await field.inputValue();
  expect(link).toMatch(/\/build\/shared#d=[A-Za-z0-9_-]+$/);

  // A clean context has no storage, cookies or history: only the link.
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(link);
  await expect(other.getByTestId("shared-view")).toHaveAttribute(
    "data-state",
    "ok",
  );
  await expect(other.getByTestId("shared-label")).toContainText(
    status.sharedView,
  );
  await expect(other.getByTestId("shared-label")).toContainText(
    shared.readOnly,
  );
  expect(await brand600(other)).toBe(mine);
  // Read-only: no editing controls come with it.
  await expect(other.getByRole("button", { name: buttons.undo })).toHaveCount(
    0,
  );
  await context.close();
});

test("Save a copy adds a project and never changes the ones that exist", async ({
  page,
  browser,
}) => {
  await fresh(page);
  await setBrand(page, brand);
  const mineBrand = await brand600(page);
  await openUse(page);
  await page.getByRole("button", { name: buttons.copyLink }).click();
  const link = await page.getByTestId("share-link").inputValue();

  const context = await browser.newContext();
  const other = await context.newPage();
  // This person already has a project of their own, with its own brand colour.
  await other.goto("/build");
  await ready(other);
  await other.getByRole("button", { name: "New design system" }).click();
  await other.waitForURL("**/build/start");
  await setBrand(other, "#aa3322");
  const theirs = await brand600(other);

  await other.goto(link);
  await expect(other.getByTestId("shared-view")).toHaveAttribute(
    "data-state",
    "ok",
  );
  await other.getByRole("button", { name: buttons.saveCopy }).click();
  await expect(other.getByTestId("shared-saved")).toContainText(shared.saved);

  // Their own project is still there, with its own colour; the copy sits beside it.
  await other.goto("/build");
  await ready(other);
  const list = other.getByRole("list", { name: "Your projects" });
  await expect(list).toContainText(shared.copyName);
  await expect(list.getByRole("listitem")).toHaveCount(3);
  const stored = await other.evaluate(() =>
    JSON.parse(window.localStorage.getItem("ds-projects") ?? "{}"),
  );
  const projects = stored.projects as {
    name: string;
    state: { knobs: { brand?: string } };
  }[];
  expect(projects.map((p) => p.name)).toEqual([
    "My design system",
    "My design system",
    shared.copyName,
  ]);
  // Their own coloured project is untouched; the copy carries the shared colour.
  expect(projects[1]!.state.knobs.brand).toBe("#aa3322");
  expect(projects[2]!.state.knobs.brand).toBe(brand);
  expect(theirs).not.toBe(mineBrand);
  await context.close();
});

test("each file downloads, with the design in it", async ({ page }) => {
  await fresh(page);
  await setBrand(page, brand);
  await openUse(page);

  const css = await downloaded(page, `${buttons.download} design-system.css`);
  expect(css.name).toBe("design-system.css");
  expect(css.text).toContain(":root {");
  expect(css.text).toContain(`--ds-color-brand-600: ${brand};`);
  expect(css.text).not.toMatch(/var\(/);

  const design = await downloaded(
    page,
    new RegExp(`^${buttons.download} .*tokens\\.json$`),
  );
  expect(design.name).toMatch(/\.tokens\.json$/);
  const parsed = JSON.parse(design.text) as Record<string, unknown>;
  expect(Object.keys(parsed).length).toBeGreaterThan(3);
  expect(design.text).toContain(brand);

  await page.getByRole("tab", { name: use.tabPackage }).click();
  const pkg = await downloaded(
    page,
    new RegExp(`^${buttons.download} (?!design-system).*\\.css$`),
  );
  expect(pkg.name).toMatch(/^[a-z0-9-]+\.css$/);
  expect(pkg.text).toContain("--ds-color-brand-600");
  expect(pkg.text).toMatch(/var\(--ds-/);

  // At most three lines of instructions, the font snippet and the credit line.
  await expect(
    page.getByTestId("file-package").locator("..").getByRole("listitem"),
  ).toHaveCount(use.packageSteps.length);
  expect(use.packageSteps.length).toBeLessThanOrEqual(3);
  expect(use.cssSteps.length).toBeLessThanOrEqual(3);
  await expect(page.getByTestId("font-snippet")).toContainText(
    "fonts.googleapis.com",
  );
  expect(pkg.text.startsWith("/* Made with")).toBe(true);
});

test("the CSS tab says what it holds, and has Copy", async ({ page }) => {
  await fresh(page);
  await openUse(page);
  await expect(page.getByText(use.cssNote)).toBeVisible();
  await expect(
    page.getByRole("button", { name: `${buttons.copy} design-system.css` }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: use.tabCss })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("a tampered link falls back safely with a message", async ({
  page,
  browser,
}) => {
  await fresh(page);
  await setBrand(page, brand);
  await openUse(page);
  await page.getByRole("button", { name: buttons.copyLink }).click();
  const link = await page.getByTestId("share-link").inputValue();
  const at = link.indexOf("#d=") + 3;

  const tampered = [
    `${link.slice(0, at)}!!not-a-design!!`,
    `${link.slice(0, at)}${link.slice(at).replace(/^(.{12}).{6}/, "$1AAAAAA")}`,
    `${link.slice(0, at)}`,
    link.slice(0, at - 3),
  ];
  for (const url of tampered) {
    const context = await browser.newContext();
    const other = await context.newPage();
    await other.goto(url);
    await expect(other.getByTestId("shared-problem")).toContainText(
      errors.linkBroken.message,
    );
    await expect(other.getByTestId("shared-problem")).toContainText(
      errors.linkBroken.fix,
    );
    // Nothing is shown as a design, and nothing was saved.
    await expect(other.getByTestId("shared-label")).toHaveCount(0);
    await expect(other.getByTestId("preview")).toHaveCount(0);
    expect(
      await other.evaluate(() => window.localStorage.getItem("ds-projects")),
    ).toBeNull();
    await context.close();
  }
});

test("a banner links to Check when something is hard to read", async ({
  page,
}) => {
  await fresh(page);
  await openUse(page);
  await expect(page.getByTestId("use-banner")).toHaveCount(0);

  await setBrand(page, "#f5e663");
  await openUse(page);
  const banner = page.getByTestId("use-banner");
  await expect(banner).toContainText(use.banner);
  await expect(banner).toContainText(use.bannerKeep);
  // The files are still there.
  await expect(
    page.getByRole("button", { name: `${buttons.download} design-system.css` }),
  ).toBeVisible();
  await banner.getByRole("link", { name: use.bannerFix }).click();
  await expect(page).toHaveURL(/\/build\/check$/);
});

test("axe is clean on Use it and on the shared view", async ({
  page,
  browser,
}) => {
  await fresh(page);
  await setBrand(page, brand);
  await openUse(page);
  await page.getByRole("button", { name: buttons.copyLink }).click();
  const link = await page.getByTestId("share-link").inputValue();
  const results = await builderAxe(page, ['[data-testid="preview"]']).analyze();
  expect(results.violations).toEqual([]);

  await page.getByRole("tab", { name: use.tabPackage }).click();
  const second = await builderAxe(page, ['[data-testid="preview"]']).analyze();
  expect(second.violations).toEqual([]);

  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(link);
  await expect(other.getByTestId("shared-label")).toBeVisible();
  const view = await builderAxe(other).analyze();
  expect(view.violations).toEqual([]);

  const broken = await context.newPage();
  await broken.goto("/build/shared#d=nope");
  await expect(broken.getByTestId("shared-problem")).toBeVisible();
  const problem = await builderAxe(broken).analyze();
  expect(problem.violations).toEqual([]);
  await context.close();
});
