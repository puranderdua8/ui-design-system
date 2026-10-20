import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const paths = [
  "/components",
  "/components/typography",
  "/components/layout",
  "/components/forms",
  "/components/actions",
  "/components/display",
];

for (const path of paths) {
  test.describe(path, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(path);
    });

    test("has one h1 and headings in order", async ({ page }) => {
      await expect(page.locator("h1")).toHaveCount(1);
      const levels = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
      expect(levels[0]).toBe(1);
      levels.slice(1).forEach((level, i) => {
        expect(level - levels[i]).toBeLessThanOrEqual(1);
      });
    });

    test("has no axe violations", async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test("320px viewport has no horizontal scroll", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  });
}

test.describe("Link examples", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/actions");
  });

  test("external link is announced and opens safely", async ({ page }) => {
    const link = page.getByRole("link", {
      name: "@puranderdua/ui on npm (opens in a new tab)",
    });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  });

  test("next/link example activates by keyboard", async ({ page }) => {
    const link = page.getByRole("link", { name: "Forms" });
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/components\/forms$/);
  });

  test("inline link is reachable with Tab and underlined", async ({ page }) => {
    const link = page.getByRole("link", { name: "component overview" });
    await expect(link).toHaveCSS("text-decoration-line", "underline");
    for (
      let i = 0;
      i < 20 && !(await link.evaluate((el) => el === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await expect(link).toBeFocused();
  });
});

test.describe("index and navigation", () => {
  test("only unreleased categories say 'Coming in'", async ({ page }) => {
    await page.goto("/components");
    const cards = page
      .getByRole("listitem")
      .filter({ has: page.getByRole("heading", { level: 2 }) });
    await expect(cards).toHaveCount(5);
    for (const name of ["Typography", "Layout", "Forms", "Actions"]) {
      const card = cards.filter({ has: page.getByRole("heading", { name }) });
      await expect(card).not.toContainText("Coming in");
    }
    const display = cards.filter({
      has: page.getByRole("heading", { name: "Display" }),
    });
    await expect(display).toContainText("Coming in");
  });

  test("the current page is marked in the header", async ({ page }) => {
    await page.goto("/components/layout");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Components" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("the skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/components");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
    await expect(page.locator("main")).toBeFocused();
  });

  test("page titles use the site template", async ({ page }) => {
    await page.goto("/components/layout");
    await expect(page).toHaveTitle("Layout — Purander Dua");
  });
});

test.describe("demo source", () => {
  test("the code shown is the code that rendered", async ({ page }) => {
    await page.goto("/components/layout");
    const code = page.getByRole("region", { name: "Grid code" });
    await expect(code).toContainText(
      'import { Grid, Stack } from "@puranderdua/ui"',
    );
    await expect(code).toContainText('<Grid cols={3} gap="sm">');
  });
});

for (const width of [768, 1024, 1280]) {
  test(`layout page has no horizontal scroll at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/components/layout");
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}

test("header nav reaches the showcase", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Components" })
    .click();
  await expect(page).toHaveURL(/\/components$/);
});
