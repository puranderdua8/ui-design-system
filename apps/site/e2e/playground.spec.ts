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

// The preview has tabs of its own: the controls' tabs are the first in the page.
const controls = (page: Page) => page.locator('[data-slot="tabs"]').first();

const openTab = async (page: Page, name: string) => {
  await controls(page).getByRole("tab", { name, exact: true }).click();
  await expect(controls(page).getByRole("tabpanel")).toBeVisible();
};

test("axe finds no violations in every tab, with the groups open", async ({
  page,
}) => {
  for (const tab of ["Design", "Check", "Advanced", "Export"]) {
    await openTab(page, tab);
    for (const summary of await controls(page)
      .getByRole("tabpanel")
      .locator("details > summary")
      .all())
      await summary.click();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, tab).toEqual([]);
  }
});

test("the controls are in four tabs and Design is the first", async ({
  page,
}) => {
  await expect(controls(page).getByRole("tab")).toHaveText([
    "Design",
    "Check",
    "Advanced",
    "Export",
  ]);
  await expect(
    controls(page).getByRole("tab", { name: "Design" }),
  ).toHaveAttribute("aria-selected", "true");
  // Another tab's controls are not in the page until it is open.
  await expect(page.getByLabel("Theme name", { exact: true })).toHaveCount(0);
  await openTab(page, "Export");
  await expect(page.getByLabel("Theme name", { exact: true })).toBeVisible();
});

test("the preview stays in view at every scroll position (1024x768)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  const pin = page.getByTestId("preview-pin");
  await expect(pin).toHaveCSS("position", "sticky");
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  for (const fraction of [0, 0.25, 0.5, 1]) {
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      Math.max(0, height - 768) * fraction,
    );
    const box = await pin.boundingBox();
    // Wherever the page is scrolled, most of the preview is in the window. At the very
    // end the footer scrolls in and pushes the pinned box up by the footer's height.
    expect(box!.y).toBeLessThan(384);
    expect(box!.y + box!.height).toBeGreaterThan(384);
  }
});

test("the Design tab needs no more than a short scroll (1024x768)", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  expect(height).toBeLessThanOrEqual(768 * 2);
});

test("the preview is not pinned when the columns stack", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("preview-pin")).toHaveCSS("position", "static");
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
  await page.getByLabel("Corners", { exact: true }).fill("2");
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");

  await page.reload();
  await expect(page.getByLabel("Brand colour", { exact: true })).toHaveValue(
    "#1762b6",
  );
  await expect(page.getByLabel("Corners", { exact: true })).toHaveValue("2");
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");
  await expect.poll(() => scopeVar(page, "--ds-radius-md")).toBe("1rem");

  await page.getByRole("button", { name: "Reset to Base" }).click();
  await expect.poll(() => background(page)).not.toBe("rgb(23, 98, 182)");
  await page.reload();
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await expect(
    page.getByLabel("Brand colour", { exact: true }),
  ).not.toHaveValue("#1762b6");
});

test("a new starting look asks before it replaces edits, and Keep changes nothing", async ({
  page,
}) => {
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");
  await page.getByRole("combobox", { name: "Starting look" }).click();
  await page.getByRole("option", { name: "Nature", exact: true }).click();
  const confirm = page.getByTestId("look-confirm");
  await expect(confirm).toContainText("Switch to Nature?");
  // Nothing has changed yet.
  await expect(preview(page)).not.toHaveAttribute("data-ds-theme", "nature");
  await confirm.getByRole("button", { name: "Keep my changes" }).click();
  await expect(confirm).toHaveCount(0);
  await expect(page.getByLabel("Brand colour", { exact: true })).toHaveValue(
    "#1762b6",
  );
  await expect.poll(() => background(page)).toBe("rgb(23, 98, 182)");
});

test("a new starting look needs no question when nothing was edited", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Starting look" }).click();
  await page.getByRole("option", { name: "Nature", exact: true }).click();
  await expect(page.getByTestId("look-confirm")).toHaveCount(0);
  await expect(preview(page)).toHaveAttribute("data-ds-theme", "nature");
});

test("the starting look picker loads a look's values once confirmed", async ({
  page,
}) => {
  await page.getByLabel("Brand colour", { exact: true }).fill("#1762b6");
  await page.getByRole("combobox", { name: "Starting look" }).click();
  await page.getByRole("option", { name: "Nature", exact: true }).click();
  await page
    .getByTestId("look-confirm")
    .getByRole("button", { name: "Replace my changes" })
    .click();
  await expect(preview(page)).toHaveAttribute("data-ds-theme", "nature");
  await expect
    .poll(() => scopeVar(page, "--ds-color-brand-600"))
    .toBe("#2f7442");
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
  await page.getByLabel("Highlight colour", { exact: true }).fill("#e11d48");
  await expect
    .poll(() => scopeVar(page, "--ds-color-accent-600"))
    .toBe("#e11d48");
  await expect.poll(border).not.toBe(before);
});

test("a Select popover opens in the body and carries the preview's theme", async ({
  page,
}) => {
  await page.getByRole("combobox", { name: "Starting look" }).click();
  await page.getByRole("option", { name: "Quirky", exact: true }).click();
  await preview(page).getByRole("combobox", { name: "Produce" }).click();
  // ScopedPortal (D-091, D-098) portals to document.body and re-applies the scope's theme.
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  await expect(list).toHaveCSS("--ds-color-brand-600", "#703dc6");
});

test("a failing brand colour shows failing contrast pairs, and recovers", async ({
  page,
}) => {
  const summary = page.getByTestId("contrast-summary");
  // The summary sits above the tabs, so it shows on every tab.
  await expect(summary).toContainText(/All \d+ combinations are readable\./);
  await page.getByLabel("Brand colour", { exact: true }).fill("#facc15");
  await expect(summary).toContainText(/\d+ things? to fix\./);
  await page.getByRole("button", { name: "See what to fix" }).click();
  await expect(
    controls(page).getByRole("tab", { name: "Check" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page
      .getByRole("list", { name: "Combinations to fix" })
      .locator('[data-result="fail"]')
      .first(),
  ).toContainText(/Fail \d/);
  await openTab(page, "Design");
  await page.getByRole("button", { name: "Reset to Base" }).click();
  await expect(summary).toContainText(/All \d+ combinations are readable\./);
});

test("the advanced panel overrides one token and resets it", async ({
  page,
}) => {
  await openTab(page, "Advanced");
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
  await openTab(page, "Export");
  await page.getByLabel("Theme name", { exact: true }).fill("Acme Brand");

  // The lead file is the CSS; the JSON files sit in a closed disclosure (S39).
  const advanced = page.locator("details", {
    has: page.getByText("Advanced: theme folder for this repository"),
  });
  await expect(advanced).not.toHaveAttribute("open", "");
  await expect(
    page.getByRole("heading", { name: "Use in your app" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copy color.json" }),
  ).toBeHidden();

  const css = await readDownload(page, "acme-brand.css");
  expect(css).toContain("--ds-color-brand-600: #1762b6;");
  expect(css).toContain(':root,\n[data-ds-mode="light"] {');
  expect(css).toContain("color-scheme: light;");

  await advanced.getByText("Advanced: theme folder").click();
  await expect(advanced).toHaveAttribute("open", "");
  const colours = JSON.parse(await readDownload(page, "color.json"));
  // DTCG 2025.10 colour object (D-090).
  expect(colours.color.brand["600"].$value).toMatchObject({
    colorSpace: "srgb",
    hex: "#1762b6",
  });
});

test("export warns about failing contrast", async ({ page }) => {
  await openTab(page, "Export");
  await expect(page.getByTestId("export-contrast-warning")).toHaveCount(0);
  // The Design tab's controls are not mounted on the Export tab: edit, then come back.
  await openTab(page, "Design");
  await page.getByLabel("Brand colour", { exact: true }).fill("#facc15");
  await openTab(page, "Export");
  await expect(page.getByTestId("export-contrast-warning")).toContainText(
    "tokens:check",
  );
});

test("export notes an advanced override the files cannot hold", async ({
  page,
}) => {
  await openTab(page, "Advanced");
  // Open the group through its summary, then wait for it to be open and the field visible
  // before typing (R36: WebKit filled before the details had opened).
  const group = page.locator("details", {
    has: page.getByText(/^action \(/),
  });
  await group.getByText(/^action \(/).click();
  await expect(group).toHaveAttribute("open", "");
  const field = page.getByLabel("action-primary-bg value", { exact: true });
  await expect(field).toBeVisible();
  await field.fill("#aa0000");
  await openTab(page, "Export");
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
  await openTab(page, "Export");
  await page.getByText("Advanced: theme folder").click();
  await page.getByRole("button", { name: "Copy color.json" }).click();
  await expect(page.getByTestId("export-status")).toHaveText(
    "Copied color.json.",
  );
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(JSON.parse(text).color.brand["600"].$value.hex).toBe("#1762b6");
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
