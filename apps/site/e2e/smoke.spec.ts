import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has exactly one h1 and headings in order", async ({ page }) => {
  await expect(page.locator("h1")).toHaveCount(1);
  const levels = await page
    .locator("h1, h2, h3, h4, h5, h6")
    .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
  expect(levels[0]).toBe(1);
  levels.slice(1).forEach((level, i) => {
    // A heading may go deeper by one level at most; going back up is always fine.
    expect(level - levels[i]).toBeLessThanOrEqual(1);
  });
});

test("primary button works from the keyboard", async ({ page }) => {
  const primary = page.getByRole("button", { name: "Get in touch" });
  await page.keyboard.press("Tab");
  await expect(primary).toBeFocused();

  const ring = await primary.evaluate((el) => {
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: s.outlineWidth };
  });
  expect(ring.style).not.toBe("none");
  expect(parseFloat(ring.width)).toBeGreaterThan(0);

  const dialog = new Promise<string>((resolve) =>
    page.once("dialog", async (d) => {
      const message = d.message();
      await d.accept();
      resolve(message);
    }),
  );
  await page.keyboard.press("Enter");
  expect(await dialog).toBe("Button clicked");
});

test("secondary button navigates to the approach section", async ({ page }) => {
  const secondary = page.getByRole("link", { name: "Read the approach" });
  await secondary.click();
  await expect(page).toHaveURL(/#approach$/);
  await expect(page.locator("#approach")).toBeInViewport();
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

test("200% zoom keeps content readable", async ({ page }) => {
  // Browser zoom at 200% on a 1280px window is a 640 CSS px viewport (WCAG 1.4.4 / 1.4.10).
  await page.setViewportSize({ width: 640, height: 360 });
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  await expect(page.locator("h1")).toBeInViewport();
  const bodyFont = await page
    .locator("article p")
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(bodyFont).toBeGreaterThanOrEqual(16);
  const clipped = await page
    .getByRole("button", { name: "Get in touch" })
    .evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(clipped).toBe(false);
});
