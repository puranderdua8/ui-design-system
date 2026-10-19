import { expect, test, type Page } from "@playwright/test";

// Rendered-layout tests: real Chromium measures boxes. The frame width is set
// by `w`, independent of the 1280px viewport, so these also prove the layouts
// follow their container and not the viewport.

type Rect = { x: number; y: number; width: number; height: number };

const open = async (page: Page, name: string, w?: number) => {
  await page.goto(`/?case=${name}${w ? `&w=${w}` : ""}`);
  await page.locator("#frame").waitFor();
};

const rect = async (page: Page, testId: string): Promise<Rect> => {
  const box = await page.getByTestId(testId).first().boundingBox();
  if (!box) throw new Error(`no box for ${testId}`);
  return box;
};

/** Resolve a CSS length (e.g. `var(--ds-layout-gap-lg)`) to pixels. */
const px = (page: Page, length: string) =>
  page.evaluate((value) => {
    const el = document.createElement("div");
    el.style.width = value;
    el.style.position = "absolute";
    document.body.append(el);
    const width = el.getBoundingClientRect().width;
    el.remove();
    return width;
  }, length);

const noHorizontalOverflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

const sideBySide = (a: Rect, b: Rect) =>
  b.x >= a.x + a.width - 1 && Math.abs(a.y - b.y) <= 1;
const stacked = (a: Rect, b: Rect) => b.y >= a.y + a.height - 1;

test.describe("Split", () => {
  test("1:1 columns are equal while they fit", async ({ page }) => {
    await open(page, "split-1-1", 800);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(sideBySide(a, b)).toBe(true);
    expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1);
  });

  test("1:2 and 2:1 keep their ratio", async ({ page }) => {
    await open(page, "split-1-2", 900);
    let [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(sideBySide(a, b)).toBe(true);
    expect(Math.abs(b.width - 2 * a.width)).toBeLessThanOrEqual(2);

    await open(page, "split-2-1", 900);
    [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(sideBySide(a, b)).toBe(true);
    expect(Math.abs(a.width - 2 * b.width)).toBeLessThanOrEqual(2);
  });

  test("follows the container, not the viewport", async ({ page }) => {
    // The viewport is 1280px wide; only the frame is narrow.
    await open(page, "split-1-1", 420);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(stacked(a, b)).toBe(true);
    expect(a.width).toBeCloseTo(420, 0);
    expect(b.width).toBeCloseTo(420, 0);
  });

  test("switches at twice the item-min width plus the gap", async ({
    page,
  }) => {
    await open(page, "split-1-1", 800);
    const threshold =
      (await px(page, "var(--ds-layout-item-min-md)")) * 2 +
      (await px(page, "var(--ds-layout-gap-lg)"));
    await open(page, "split-1-1", Math.ceil(threshold) + 2);
    expect(sideBySide(await rect(page, "a"), await rect(page, "b"))).toBe(true);
    await open(page, "split-1-1", Math.floor(threshold) - 2);
    expect(stacked(await rect(page, "a"), await rect(page, "b"))).toBe(true);
  });

  test("1:2 stacks before the narrow column drops below its minimum", async ({
    page,
  }) => {
    // The wide column's minimum is twice item-min, so the row needs 3 x item-min + gap.
    await open(page, "split-1-2", 800);
    const need =
      (await px(page, "var(--ds-layout-item-min-md)")) * 3 +
      (await px(page, "var(--ds-layout-gap-lg)"));
    await open(page, "split-1-2", Math.ceil(need) + 2);
    expect(sideBySide(await rect(page, "a"), await rect(page, "b"))).toBe(true);
    await open(page, "split-1-2", Math.floor(need) - 2);
    expect(stacked(await rect(page, "a"), await rect(page, "b"))).toBe(true);
  });

  test("does not overflow a 320px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page, "split-1-2");
    expect(await noHorizontalOverflow(page)).toBe(true);
    expect(stacked(await rect(page, "a"), await rect(page, "b"))).toBe(true);
  });
});

test.describe("Sidebar", () => {
  test("aside has the sidebar width, content takes the rest", async ({
    page,
  }) => {
    await open(page, "sidebar-start", 900);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    const aside = await px(page, "var(--ds-layout-sidebar-width)");
    const gap = await px(page, "var(--ds-layout-gap-lg)");
    expect(sideBySide(a, b)).toBe(true);
    expect(Math.abs(a.width - aside)).toBeLessThanOrEqual(2);
    expect(Math.abs(b.width - (900 - aside - gap))).toBeLessThanOrEqual(2);
  });

  test("side=end puts the aside on the right", async ({ page }) => {
    await open(page, "sidebar-end", 900);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(b.x + b.width).toBeLessThanOrEqual(a.x + 1);
    expect(a.y).toBeCloseTo(b.y, 0);
  });

  test("content is never narrower than half the row", async ({ page }) => {
    await open(page, "sidebar-start", 900);
    const aside = await px(page, "var(--ds-layout-sidebar-width)");
    const gap = await px(page, "var(--ds-layout-gap-lg)");
    const w = Math.ceil((aside + gap) * 2) + 2; // just wide enough for a row
    await open(page, "sidebar-start", w);
    let [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(sideBySide(a, b)).toBe(true);
    expect(b.width).toBeGreaterThanOrEqual(w / 2 - 1);

    await open(page, "sidebar-start", w - 8);
    [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(stacked(a, b)).toBe(true);
  });

  test("follows the container, not the viewport", async ({ page }) => {
    await open(page, "sidebar-start", 420);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(stacked(a, b)).toBe(true);
    expect(a.width).toBeCloseTo(420, 0);
  });

  test("the aside stays first when stacked on either side", async ({
    page,
  }) => {
    await open(page, "sidebar-end", 420);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(a.y).toBeLessThan(b.y);
  });

  test("a long word in the content does not overflow", async ({ page }) => {
    for (const w of [320, 420, 900]) {
      await open(page, "sidebar-start", w);
      const frame = await rect(page, "a");
      expect(frame.x + frame.width).toBeLessThanOrEqual(w + 1);
      const b = await rect(page, "b");
      expect(b.x + b.width).toBeLessThanOrEqual(w + 1);
    }
  });
});

test.describe("Grid", () => {
  test("cols=3 is one column on a phone and three on a desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await open(page, "grid-cols-3");
    expect(stacked(await rect(page, "a"), await rect(page, "b"))).toBe(true);

    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, "grid-cols-3");
    const [a, b, c] = [
      await rect(page, "a"),
      await rect(page, "b"),
      await rect(page, "c"),
    ];
    expect(sideBySide(a, b) && sideBySide(b, c)).toBe(true);
  });

  test("minItemWidth fits as many columns as the container allows", async ({
    page,
  }) => {
    await open(page, "grid-fit-md", 800);
    const min = await px(page, "var(--ds-layout-item-min-md)");
    const columns = async (w: number) => {
      await open(page, "grid-fit-md", w);
      const xs = await page
        .locator("[data-testid]")
        .evaluateAll((els) =>
          els.map((el) => Math.round(el.getBoundingClientRect().x)),
        );
      return new Set(xs).size;
    };
    expect(await columns(Math.floor(min * 2) + 40)).toBe(2);
    expect(await columns(Math.floor(min * 3) + 60)).toBe(3);
    expect(await columns(Math.floor(min) - 20)).toBe(1);
  });
});

test.describe("Container, Stack, Cluster, Section", () => {
  test("Container caps at its token width and is centred", async ({ page }) => {
    await open(page, "container-sm", 1200);
    const el = await rect(page, "container");
    const max = await px(page, "var(--ds-layout-container-sm)");
    expect(el.width).toBeCloseTo(max, 0);
    expect(el.x).toBeCloseTo((1200 - max) / 2, 0);
  });

  test("Container fills a narrower parent and keeps the gutter", async ({
    page,
  }) => {
    await open(page, "container-sm", 300);
    const el = await rect(page, "container");
    const a = await rect(page, "a");
    const gutter = await px(page, "var(--ds-layout-gutter)");
    expect(el.width).toBeCloseTo(300, 0);
    expect(a.x - el.x).toBeCloseTo(gutter, 0);
  });

  test("Stack separates children by the gap token", async ({ page }) => {
    await open(page, "stack", 400);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    const gap = await px(page, "var(--ds-layout-gap-lg)");
    expect(b.y - (a.y + a.height)).toBeCloseTo(gap, 0);
  });

  test("Cluster wraps instead of overflowing", async ({ page }) => {
    await open(page, "cluster", 110);
    const rects = [
      await rect(page, "a"),
      await rect(page, "b"),
      await rect(page, "c"),
    ];
    expect(new Set(rects.map((r) => Math.round(r.y))).size).toBeGreaterThan(1);
    await open(page, "cluster", 600);
    const row = [
      await rect(page, "a"),
      await rect(page, "b"),
      await rect(page, "c"),
    ];
    expect(new Set(row.map((r) => Math.round(r.y))).size).toBe(1);
  });

  test("Section applies its tone and padding tokens", async ({ page }) => {
    await open(page, "section", 600);
    const inverse = page.getByTestId("inverse");
    const style = await inverse.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        bg: s.backgroundColor,
        paddingTop: s.paddingTop,
        color: s.color,
      };
    });
    const token = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = "var(--ds-surface-inverse)";
      probe.style.color = "var(--ds-text-inverse)";
      document.body.append(probe);
      const s = getComputedStyle(probe);
      const out = { bg: s.backgroundColor, color: s.color };
      probe.remove();
      return out;
    });
    expect(style.bg).toBe(token.bg);
    expect(style.color).toBe(token.color);
    expect(parseFloat(style.paddingTop)).toBeCloseTo(
      await px(page, "var(--ds-layout-section-padding-lg)"),
      0,
    );
    const canvas = await page
      .getByTestId("canvas")
      .evaluate((el) => getComputedStyle(el).paddingTop);
    expect(parseFloat(canvas)).toBeCloseTo(
      await px(page, "var(--ds-layout-section-padding-sm)"),
      0,
    );
  });
});

test.describe("motion", () => {
  test("Button and Link transition, and stop under reduced motion", async ({
    page,
  }) => {
    await open(page, "controls");
    const duration = (id: string) =>
      page
        .getByTestId(id)
        .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(await duration("button")).not.toBe("0s");
    expect(await duration("link")).not.toBe("0s");

    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await duration("button")).toBe("0s");
    expect(await duration("link")).toBe("0s");
  });
});
