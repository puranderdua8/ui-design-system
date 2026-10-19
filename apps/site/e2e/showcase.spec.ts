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
    const link = page.getByRole("link", { name: "Forms (coming soon)" });
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

test("header nav reaches the showcase", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Components" })
    .click();
  await expect(page).toHaveURL(/\/components$/);
});
