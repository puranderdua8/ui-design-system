import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const preview = (page: Page) => page.getByTestId("preview");
const primaryButton = (page: Page) =>
  preview(page).getByRole("button", { name: "Primary md" });
const background = (page: Page) =>
  primaryButton(page).evaluate((el) => getComputedStyle(el).backgroundColor);
const scopeVar = (page: Page, name: string) =>
  preview(page).evaluate(
    (el, prop) => getComputedStyle(el).getPropertyValue(prop).trim(),
    name,
  );

test.beforeEach(async ({ page }) => {
  await page.goto("/playground");
  // The controls are server-rendered: typing before hydration is lost, and the
  // state only comes from localStorage after it.
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByLabel("Brand colour", { exact: true })).toBeVisible();
});

test("axe finds no violations in the default state", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("axe finds no violations with the advanced groups open", async ({
  page,
}) => {
  for (const summary of await page.locator("details > summary").all())
    await summary.click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("changing the brand colour changes the preview's primary button", async ({
  page,
}) => {
  const before = await background(page);
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");
  expect(before).not.toBe("rgb(23, 98, 182)");
  // The page chrome keeps the site theme: only the preview scope changes.
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ds-color-brand-600")
        .trim(),
    ),
  ).not.toBe("#1762b6");
});

test("a reload keeps the edit, and Reset clears it", async ({ page }) => {
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await page.getByLabel("Radius scale", { exact: true }).fill("2");
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");

  await page.reload();
  await expect(page.getByLabel("Brand colour", { exact: true })).toHaveValue(
    "#1762b6",
  );
  await expect(page.getByLabel("Radius scale", { exact: true })).toHaveValue(
    "2",
  );
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");
  expect(await scopeVar(page, "--ds-radius-md")).toBe("1rem");

  await page.getByRole("button", { name: "Reset to Base" }).click();
  await expect.poll(() => background(page)).not.toBe("rgb(23, 98, 182)");
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await expect(
    page.getByLabel("Brand colour", { exact: true }),
  ).not.toHaveValue("#1762b6");
});

test("the starting theme picker loads a theme's values", async ({ page }) => {
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await page.getByRole("combobox", { name: "Starting theme" }).click();
  await page.getByRole("option", { name: "Nature", exact: true }).click();
  await expect(preview(page)).toHaveAttribute("data-ds-theme", "nature");
  expect(await scopeVar(page, "--ds-color-brand-600")).toBe("#2f7442");
  // Picking a theme clears the earlier knobs.
  await expect(page.getByLabel("Brand colour", { exact: true })).toHaveValue(
    "#2f7442",
  );
});

test("the accent knob drives the accent card and the scope's accent scale", async ({
  page,
}) => {
  const border = () =>
    preview(page)
      .locator('[data-slot="card"]')
      .filter({ hasText: "Accent card" })
      .evaluate((el) => getComputedStyle(el).borderTopColor);
  const before = await border();
  await page.getByLabel("Accent colour", { exact: true }).fill("#e11d48");
  await expect
    .poll(() => scopeVar(page, "--ds-color-accent-600"))
    .toBe("#e11d48");
  await expect.poll(border).not.toBe(before);
});

test("a Select popover opens inside the themed preview", async ({ page }) => {
  await page.getByRole("combobox", { name: "Starting theme" }).click();
  await page.getByRole("option", { name: "Quirky", exact: true }).click();
  await preview(page).getByRole("combobox", { name: "Produce" }).click();
  const list = preview(page).getByRole("listbox");
  await expect(list).toBeVisible();
  expect(
    await list.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--ds-color-brand-600").trim(),
    ),
  ).toBe("#703dc6");
});

test("a failing brand colour shows failing contrast pairs, and recovers", async ({
  page,
}) => {
  const summary = page.getByTestId("contrast-summary");
  await expect(summary).toContainText("pairs pass");
  await page.getByLabel("Brand colour", { exact: true }).fill("#facc15");
  await expect(summary).toContainText("fail");
  await expect(
    page
      .getByRole("list", { name: "Failing pairs" })
      .locator('[data-result="fail"]')
      .first(),
  ).toContainText(/Fail \d/);
  await page.getByRole("button", { name: "Reset to Base" }).click();
  await expect(summary).toContainText("pairs pass");
});

test("the advanced panel overrides one token and resets it", async ({
  page,
}) => {
  await page.getByText(/^action \(/).click();
  const field = page.getByLabel("action-primary-bg value", { exact: true });
  await field.fill("#aa0000");
  await expect.poll(() => background(page)).toBe("rgb(170, 0, 0)");
  await page.getByRole("button", { name: "Reset action-primary-bg" }).click();
  await expect.poll(() => background(page)).not.toBe("rgb(170, 0, 0)");
});

const readDownload = async (page: Page, name: string): Promise<string> => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: `Download ${name}` }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(name);
  const path = await download.path();
  return readFileSync(path, "utf8");
};

test("export downloads DTCG JSON and CSS that carry the edit", async ({
  page,
}) => {
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await page.getByLabel("Theme name", { exact: true }).fill("Acme Brand");

  const colours = JSON.parse(await readDownload(page, "color.json"));
  expect(colours.color.brand["600"].$value).toBe("#1762b6");

  const css = await readDownload(page, "acme-brand.css");
  expect(css).toContain("--ds-color-brand-600: #1762b6;");
  expect(css).toContain(":root {");
});

test("export warns about failing contrast", async ({ page }) => {
  await expect(page.getByTestId("export-contrast-warning")).toHaveCount(0);
  await page.getByLabel("Brand colour", { exact: true }).fill("#facc15");
  await expect(page.getByTestId("export-contrast-warning")).toContainText(
    "tokens:check",
  );
});

test("export notes an advanced override the files cannot hold", async ({
  page,
}) => {
  await page.getByText(/^action \(/).click();
  await page
    .getByLabel("action-primary-bg value", { exact: true })
    .fill("#aa0000");
  await expect(page.getByTestId("export-semantic-warning")).toContainText(
    "action-primary-bg",
  );
});

test("export copies a file to the clipboard", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "clipboard permissions can only be granted in Chromium",
  );
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await page.getByRole("button", { name: "Copy color.json" }).click();
  await expect(page.getByTestId("export-status")).toHaveText(
    "Copied color.json.",
  );
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(JSON.parse(text).color.brand["600"].$value).toBe("#1762b6");
});

test("the Playground link is in the header and marked current", async ({
  page,
}) => {
  await expect(
    page.getByRole("link", { name: "Playground", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.reload();
  await expect(page.getByLabel("Brand colour", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
