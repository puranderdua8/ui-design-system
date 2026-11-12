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

  test("stacked, the aside is above the content for start and below it for end", async ({
    page,
  }) => {
    await open(page, "sidebar-start", 420);
    let [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(stacked(a, b)).toBe(true);
    await open(page, "sidebar-end", 420);
    [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(stacked(b, a)).toBe(true);
  });

  test("tab order matches the visual order on both sides (F10)", async ({
    page,
    browserName,
  }) => {
    // Safari on macOS only Tabs to buttons with Option+Tab (same as apps/site/e2e/keys.ts).
    const tabKey =
      browserName === "webkit" && process.platform === "darwin"
        ? "Alt+Tab"
        : "Tab";
    const order = async (name: string, w: number) => {
      await open(page, name, w);
      // Some browsers spend the first Tab on their own chrome, so press Tab
      // until both buttons have had focus and keep the order they got it in.
      const seen: string[] = [];
      for (let i = 0; i < 6 && seen.length < 2; i++) {
        await page.keyboard.press(tabKey);
        const id = await page.evaluate(() => document.activeElement?.id ?? "");
        if (id && !seen.includes(id)) seen.push(id);
      }
      return seen;
    };
    // Wide: start is aside then content, end is content then aside (left to right).
    expect(await order("sidebar-start-focus", 900)).toEqual(["a", "b"]);
    expect(await order("sidebar-end-focus", 900)).toEqual(["b", "a"]);
    // Narrow: start is aside above content, end is content above aside (top to bottom).
    expect(await order("sidebar-start-focus", 420)).toEqual(["a", "b"]);
    expect(await order("sidebar-end-focus", 420)).toEqual(["b", "a"]);
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
  test("cols=3 follows the container width, not the viewport (F17)", async ({
    page,
  }) => {
    // The viewport stays 1280px wide; only the frame changes.
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, "grid-cols-3", 300);
    expect(stacked(await rect(page, "a"), await rect(page, "b"))).toBe(true);

    await open(page, "grid-cols-3", 500);
    let [a, b, c] = [
      await rect(page, "a"),
      await rect(page, "b"),
      await rect(page, "c"),
    ];
    expect(sideBySide(a, b)).toBe(true); // two columns: c wraps
    expect(stacked(a, c)).toBe(true);

    await open(page, "grid-cols-3", 900);
    [a, b, c] = [
      await rect(page, "a"),
      await rect(page, "b"),
      await rect(page, "c"),
    ];
    expect(sideBySide(a, b) && sideBySide(b, c)).toBe(true);
  });

  test("a small phone viewport with a wide frame still gets the wide layout", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await open(page, "grid-cols-3", 900);
    const [a, b] = [await rect(page, "a"), await rect(page, "b")];
    expect(sideBySide(a, b)).toBe(true);
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

// WCAG relative luminance and contrast from computed `rgb()` strings.
const channels = (css: string): [number, number, number] => {
  const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(css);
  if (!m) throw new Error(`unexpected computed colour: ${css}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};
const luminance = (css: string) => {
  const [r, g, b] = channels(css).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
};

test.describe("surface tones (F02)", () => {
  for (const tone of ["canvas", "subtle", "inverse", "brand"]) {
    test(`inside ${tone}, text, link, focus ring and actions meet their minimums`, async ({
      page,
    }) => {
      await open(page, "tones", 600);
      const style = (id: string, prop: string) =>
        page
          .getByTestId(`${id}-${tone}`)
          .evaluate(
            (el, p) =>
              getComputedStyle(el)[p as keyof CSSStyleDeclaration] as string,
            prop,
          );
      const surface = await style("tone", "backgroundColor");
      const min = { text: 4.5, ui: 3 };

      // Text roles on the surface (4.5:1).
      for (const id of ["text", "muted", "link"])
        expect(
          contrast(await style(id, "color"), surface),
          `${id} on ${tone}`,
        ).toBeGreaterThanOrEqual(min.text);

      // The keyboard focus ring (3:1) on the surface, for a link and a button.
      for (const id of ["link", "primary", "secondary"]) {
        await page.getByTestId(`${id}-${tone}`).focus();
        expect(await style(id, "outlineStyle"), `${id} outline`).toBe("solid");
        expect(
          contrast(await style(id, "outlineColor"), surface),
          `focus ring on ${id} in ${tone}`,
        ).toBeGreaterThanOrEqual(min.ui);
      }

      // Primary action: its fill is visible on the surface and its label is legible.
      const primaryBg = await style("primary", "backgroundColor");
      expect(contrast(primaryBg, surface)).toBeGreaterThanOrEqual(min.ui);
      expect(
        contrast(await style("primary", "color"), primaryBg),
      ).toBeGreaterThanOrEqual(min.text);

      // Secondary action: outline visible on the surface, label legible on its fill.
      expect(
        contrast(await style("secondary", "borderTopColor"), surface),
      ).toBeGreaterThanOrEqual(min.ui);
      expect(
        contrast(
          await style("secondary", "color"),
          await style("secondary", "backgroundColor"),
        ),
      ).toBeGreaterThanOrEqual(min.text);

      // Control boundary (Checkbox) on the surface.
      expect(
        contrast(await style("check", "borderTopColor"), surface),
      ).toBeGreaterThanOrEqual(min.ui);
    });
  }

  test("a tone changes the roles, not only the surface", async ({ page }) => {
    await open(page, "tones", 600);
    const linkColour = (tone: string) =>
      page
        .getByTestId(`link-${tone}`)
        .evaluate((el) => getComputedStyle(el).color);
    const canvas = await linkColour("canvas");
    expect(await linkColour("subtle")).toBe(canvas);
    expect(await linkColour("inverse")).not.toBe(canvas);
    expect(await linkColour("brand")).not.toBe(canvas);
  });
});

test.describe("Card (S26)", () => {
  const style = (page: Page, id: string, prop: string) =>
    page
      .getByTestId(id)
      .evaluate(
        (el, p) =>
          getComputedStyle(el)[p as keyof CSSStyleDeclaration] as string,
        prop,
      );

  for (const tone of ["canvas", "subtle", "inverse", "brand"]) {
    test(`a raised Card inside ${tone} keeps the base roles: text, link, actions and focus ring read on its surface`, async ({
      page,
    }) => {
      await open(page, "card-tones", 900);
      const id = (name: string) => `${name}-raised-${tone}`;
      const surface = await style(page, id("card"), "backgroundColor");
      const section = await style(page, `ctone-${tone}`, "backgroundColor");
      // The card paints surface.raised (white in Base), whatever the Section is.
      expect(surface).toBe(
        await style(page, "card-raised-canvas", "backgroundColor"),
      );
      if (tone === "inverse" || tone === "brand")
        expect(surface).not.toBe(section);

      for (const name of ["ctitle", "ctext", "cmuted", "clink"])
        expect(
          contrast(await style(page, id(name), "color"), surface),
          `${name} on a raised card in ${tone}`,
        ).toBeGreaterThanOrEqual(4.5);

      for (const name of ["clink", "cprimary", "csecondary"]) {
        await page.getByTestId(id(name)).focus();
        expect(await style(page, id(name), "outlineStyle")).toBe("solid");
        expect(
          contrast(await style(page, id(name), "outlineColor"), surface),
          `focus ring on ${name} in a raised card in ${tone}`,
        ).toBeGreaterThanOrEqual(3);
      }

      const primary = await style(page, id("cprimary"), "backgroundColor");
      expect(contrast(primary, surface)).toBeGreaterThanOrEqual(3);
      expect(
        contrast(await style(page, id("cprimary"), "color"), primary),
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(
          await style(page, id("csecondary"), "borderTopColor"),
          surface,
        ),
      ).toBeGreaterThanOrEqual(3);
    });
  }

  test("a raised Card gives the same link colour in every tone; an outline Card follows its tone", async ({
    page,
  }) => {
    await open(page, "card-tones", 900);
    const link = (v: string, t: string) =>
      style(page, `clink-${v}-${t}`, "color");
    const base = await link("raised", "canvas");
    for (const t of ["subtle", "inverse", "brand"])
      expect(await link("raised", t), `raised in ${t}`).toBe(base);
    expect(await link("outline", "inverse")).not.toBe(base);
    expect(await link("outline", "brand")).not.toBe(base);
    // The outline card on a dark tone still reads on that tone's surface.
    for (const t of ["inverse", "brand"])
      expect(
        contrast(
          await style(page, `ctext-outline-${t}`, "color"),
          await style(page, `ctone-${t}`, "backgroundColor"),
        ),
        `outline card text on ${t}`,
      ).toBeGreaterThanOrEqual(4.5);
  });

  test("raised has an elevation and the card radius; outline has a border", async ({
    page,
  }) => {
    await open(page, "card-tones", 900);
    expect(await style(page, "card-raised-canvas", "boxShadow")).not.toBe(
      "none",
    );
    expect(await style(page, "card-outline-canvas", "boxShadow")).toBe("none");
    expect(
      parseFloat(await style(page, "card-raised-canvas", "borderTopWidth")),
    ).toBeGreaterThan(0);
    expect(
      parseFloat(
        await style(page, "card-raised-canvas", "borderTopLeftRadius"),
      ),
    ).toBeGreaterThan(0);
  });

  test("a Card follows its container: no horizontal overflow at 320px", async ({
    page,
  }) => {
    await open(page, "card-tones", 320);
    expect(await noHorizontalOverflow(page)).toBe(true);
  });
});

test.describe("Tabs (S26)", () => {
  const style = (page: Page, id: string, prop: string) =>
    page
      .getByTestId(id)
      .evaluate(
        (el, p) =>
          getComputedStyle(el)[p as keyof CSSStyleDeclaration] as string,
        prop,
      );

  test("triggers are at least 24px high and the list has no overflow at 320px", async ({
    page,
  }) => {
    await open(page, "tabs", 320);
    for (const t of ["canvas", "inverse"])
      for (const n of ["one", "two", "three"])
        expect(
          (await rect(page, `tab-${n}-${t}`)).height,
          `tab ${n} on ${t}`,
        ).toBeGreaterThanOrEqual(24);
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  for (const tone of ["canvas", "inverse"]) {
    test(`on ${tone}: labels, active marker and focus ring meet their minimums`, async ({
      page,
    }) => {
      await open(page, "tabs", 600);
      const surface = await style(page, `ttone-${tone}`, "backgroundColor");
      // Inactive label (text.muted) and active label (text.primary): 4.5:1.
      for (const n of ["one", "two"])
        expect(
          contrast(await style(page, `tab-${n}-${tone}`, "color"), surface),
          `label ${n} on ${tone}`,
        ).toBeGreaterThanOrEqual(4.5);
      // Active marker (border.control, the ::after bar): 3:1 and visible.
      const marker = await page
        .getByTestId(`tab-one-${tone}`)
        .evaluate((el) => {
          const s = getComputedStyle(el, "::after");
          return { bg: s.backgroundColor, opacity: s.opacity };
        });
      expect(Number(marker.opacity)).toBe(1);
      expect(contrast(marker.bg, surface)).toBeGreaterThanOrEqual(3);
      const inactive = await page
        .getByTestId(`tab-two-${tone}`)
        .evaluate((el) => getComputedStyle(el, "::after").opacity);
      expect(Number(inactive)).toBe(0);
      // Keyboard focus ring: 3:1.
      await page.getByTestId(`tab-one-${tone}`).focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await page.getByTestId(`tab-one-${tone}`).focus();
      expect(await style(page, `tab-one-${tone}`, "outlineStyle")).toBe(
        "solid",
      );
      expect(
        contrast(await style(page, `tab-one-${tone}`, "outlineColor"), surface),
      ).toBeGreaterThanOrEqual(3);
    });
  }

  test("arrow keys, Home and End move focus and selection in a real browser", async ({
    page,
  }) => {
    await open(page, "tabs", 600);
    // Radix moves focus on a timer after the key, so wait for it (auto-retry).
    const focused = (n: string) =>
      expect(page.getByTestId(`tab-${n}-canvas`)).toBeFocused();
    await page.getByTestId("tab-one-canvas").focus();
    await page.keyboard.press("ArrowRight");
    await focused("two");
    await expect(page.getByText("Second panel")).toBeVisible();
    await page.keyboard.press("End");
    await focused("three");
    await page.keyboard.press("ArrowRight");
    await focused("one");
    await page.keyboard.press("ArrowLeft");
    await focused("three");
    await page.keyboard.press("Home");
    await focused("one");
    await expect(page.getByText("First panel").first()).toBeVisible();
  });

  test("a vertical list stacks its triggers and uses Up and Down", async ({
    page,
  }) => {
    await open(page, "tabs-vertical", 600);
    const one = await rect(page, "vtab-one");
    const two = await rect(page, "vtab-two");
    expect(stacked(one, two)).toBe(true);
    await page.getByTestId("vtab-one").focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("vtab-two")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("vtab-two")).toBeFocused();
  });
});

test.describe("Banner (S27)", () => {
  const style = (page: Page, id: string, prop: string) =>
    page
      .getByTestId(id)
      .evaluate(
        (el, p) =>
          getComputedStyle(el)[p as keyof CSSStyleDeclaration] as string,
        prop,
      );

  test("screen is at least the viewport tall and tall is 75% of it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, "banner-heights");
    expect((await rect(page, "banner-screen")).height).toBeCloseTo(800, 0);
    expect((await rect(page, "banner-tall")).height).toBeCloseTo(600, 0);
  });

  test("grows with its content instead of clipping it at 200% text size", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 200 });
    await open(page, "banner-tones");
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    for (const t of ["canvas", "gradient"]) {
      const banner = await rect(page, `banner-${t}`);
      const last = await rect(page, `bsecondary-${t}`);
      expect(last.y + last.height).toBeLessThanOrEqual(
        banner.y + banner.height + 1,
      );
    }
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  const hexToRgb = (hex: string) => {
    const h = hex.trim().replace("#", "");
    const n = parseInt(h, 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  };

  for (const tone of ["canvas", "brand", "inverse", "gradient"]) {
    test(`on ${tone}: text, link, focus ring and actions meet their minimums`, async ({
      page,
    }) => {
      await open(page, "banner-tones", 900);
      const get = (id: string, prop: string) =>
        style(page, `${id}-${tone}`, prop);
      const surface = await style(page, `banner-${tone}`, "backgroundColor");
      // A gradient has two stops; every role is checked on both.
      const surfaces = [surface];
      if (tone === "gradient") {
        const image = await style(page, `banner-${tone}`, "backgroundImage");
        expect(image).toContain("linear-gradient");
        surfaces.push(
          hexToRgb(
            await page
              .getByTestId(`banner-${tone}`)
              .evaluate((el) =>
                getComputedStyle(el).getPropertyValue(
                  "--ds-surface-gradient-end",
                ),
              ),
          ),
        );
      }
      for (const bg of surfaces) {
        for (const id of ["btext", "bmuted", "blink"])
          expect(
            contrast(await get(id, "color"), bg),
            `${id} on ${tone}`,
          ).toBeGreaterThanOrEqual(4.5);
        for (const id of ["blink", "bprimary", "bsecondary"]) {
          await page.getByTestId(`${id}-${tone}`).focus();
          expect(await get(id, "outlineStyle")).toBe("solid");
          expect(
            contrast(await get(id, "outlineColor"), bg),
            `focus ring on ${id} in ${tone}`,
          ).toBeGreaterThanOrEqual(3);
        }
        expect(
          contrast(await get("bprimary", "backgroundColor"), bg),
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrast(await get("bsecondary", "borderTopColor"), bg),
        ).toBeGreaterThanOrEqual(3);
      }
    });
  }

  for (const [strength, min] of [
    ["strong", 7],
    ["medium", 4.5],
  ] as const) {
    test(`a ${strength} scrim keeps text at ${min}:1 over a white image`, async ({
      page,
    }) => {
      await open(page, "banner-media", 900);
      const scrim = page
        .getByTestId(`banner-${strength}`)
        .locator('[data-slot="banner-scrim"]');
      const { rgba, opacity } = await scrim.evaluate((el) => {
        const s = getComputedStyle(el);
        return { rgba: s.backgroundColor, opacity: Number(s.opacity) };
      });
      const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(
        rgba,
      );
      if (!m) throw new Error(`unexpected scrim colour: ${rgba}`);
      const alpha = Number(m[4] ?? 1) * opacity;
      const over = [m[1], m[2], m[3]]
        .map((c) => Math.round(Number(c) * alpha + 255 * (1 - alpha)))
        .join(", ");
      expect(
        contrast(
          await style(page, `mtext-${strength}`, "color"),
          `rgb(${over})`,
        ),
      ).toBeGreaterThanOrEqual(min);
    });
  }

  test("media covers the band", async ({ page }) => {
    await open(page, "banner-media", 900);
    const band = await rect(page, "banner-strong");
    const img = await page
      .getByTestId("banner-strong")
      .locator("img")
      .boundingBox();
    expect(img?.width).toBeCloseTo(band.width, 0);
    expect(img?.height).toBeCloseTo(band.height, 0);
    expect(
      await page
        .getByTestId("banner-strong")
        .locator("img")
        .evaluate((el) => getComputedStyle(el).objectFit),
    ).toBe("cover");
  });

  test("video: a pause button shows normally, and only the poster under reduced motion", async ({
    page,
  }) => {
    await open(page, "banner-video", 900);
    const button = page.getByRole("button", { name: /(pause|play) video/i });
    await expect(button).toBeVisible();
    expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(24);
    await expect(page.locator("video")).toHaveCount(1);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("video")).toHaveCount(0);
    await expect(button).toHaveCount(0);
    await expect(page.locator('[data-slot="banner-video"] img')).toBeVisible();
  });
});

test.describe("target size (F12)", () => {
  test("Checkbox and RadioGroupItem have a pointer target of at least control.target-min", async ({
    page,
  }) => {
    await open(page, "targets");
    const min = await px(page, "var(--ds-control-target-min)");
    expect(min).toBeGreaterThanOrEqual(24);
    for (const id of ["check", "radio"]) {
      const el = page.getByTestId(id);
      const visual = await rect(page, id);
      expect(visual.width).toBeLessThan(min); // the visual stays small
      const after = await el.evaluate((node) => {
        const s = getComputedStyle(node, "::after");
        return { w: parseFloat(s.width), h: parseFloat(s.height) };
      });
      expect(after.w, `${id} hit width`).toBeGreaterThanOrEqual(min - 0.5);
      expect(after.h, `${id} hit height`).toBeGreaterThanOrEqual(min - 0.5);

      // A point just outside the 16px box but inside the 24px target reaches the control.
      const cx = visual.x + visual.width / 2;
      const cy = visual.y + visual.height / 2;
      const inset = (min - visual.width) / 2 - 1;
      for (const [dx, dy] of [
        [visual.width / 2 + inset, 0],
        [-(visual.width / 2 + inset), 0],
        [0, visual.height / 2 + inset],
        [0, -(visual.height / 2 + inset)],
      ] as const) {
        const hit = await page.evaluate(
          ([x, y]) =>
            document.elementFromPoint(x!, y!)?.getAttribute("data-testid"),
          [cx + dx, cy + dy] as const,
        );
        expect(hit, `${id} at ${dx},${dy}`).toBe(id);
      }
    }
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
