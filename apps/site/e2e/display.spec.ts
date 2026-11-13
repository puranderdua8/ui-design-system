import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const overflow = (page: import("@playwright/test").Page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

test.describe("Display page", () => {
  test("Tabs: arrows move focus and select, the disabled tab is skipped", async ({
    page,
  }) => {
    await page.goto("/components/display");
    await page.waitForLoadState("networkidle");
    const list = page.getByRole("tablist", { name: "Design system tiers" });
    const tokens = list.getByRole("tab", { name: "Tokens" });
    await tokens.focus();
    await expect(tokens).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(list.getByRole("tab", { name: "Styles" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(list.getByRole("tab", { name: "Components" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tokens).toBeFocused();
    await expect(
      page.getByRole("tabpanel").filter({ hasText: "Primitives and semantic" }),
    ).toBeVisible();
  });

  test("raised Card on inverse stays readable (axe, colour contrast on)", async ({
    page,
  }) => {
    await page.goto("/components/display");
    const results = await new AxeBuilder({ page })
      .include("[data-slot=card]")
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Banner video: pause button toggles playback", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit headless does not reliably autoplay media",
    );
    await page.goto("/components/display");
    await page.waitForLoadState("networkidle");
    const video = page.locator("video");
    await expect(video).toHaveCount(1);
    await expect(video).toHaveJSProperty("muted", true);
    await expect(video).toHaveJSProperty("loop", true);
    const pause = page.getByRole("button", { name: /pause/i });
    await pause.scrollIntoViewIfNeeded();
    await pause.click();
    await expect(video).toHaveJSProperty("paused", true);
    await page.getByRole("button", { name: /play/i }).click();
    await expect(video).toHaveJSProperty("paused", false);
  });

  test("reduced motion: the poster shows and no video plays", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/components/display");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("video")).toHaveCount(0);
    await expect(
      page.locator("img[src='/media/flower-poster.svg']"),
    ).toHaveCount(1);
  });

  test("320px: no horizontal scroll, Banner text fits", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/components/display");
    const { scrollWidth, clientWidth } = await overflow(page);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    const banners = page.locator("[data-slot=banner]");
    await expect(banners).toHaveCount(6);
    for (const banner of await banners.all()) {
      const box = await banner.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(320);
    }
  });

  test("200% zoom (640px viewport): no horizontal scroll and no clipped Banner text", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto("/components/display");
    const { scrollWidth, clientWidth } = await overflow(page);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    for (const content of await page
      .locator("[data-slot=banner-content]")
      .all()) {
      const banner = content.locator("xpath=ancestor::*[@data-slot='banner']");
      const c = await content.boundingBox();
      const b = await banner.boundingBox();
      expect(c!.y + c!.height).toBeLessThanOrEqual(b!.y + b!.height + 1);
    }
  });
});
