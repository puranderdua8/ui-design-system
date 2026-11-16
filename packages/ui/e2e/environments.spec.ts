import { expect, test, type Locator, type Page } from "@playwright/test";
import { contrast } from "./colour";

// Environments suite (H19, R37). Every interactive component is rendered in
// the settings the standard layout suite never visits: a right-to-left page
// (`<html dir>` plus `DirectionProvider`, as the README documents),
// forced colours (Windows High Contrast), print media, and as a direct child of
// flex parents that size it to its content. A failure names the environment and
// the component. The fixture case `environments` holds the gallery.

type Rect = { x: number; y: number; width: number; height: number };

const open = async (
  page: Page,
  name: string,
  options: { w?: number; dir?: "rtl" } = {},
) => {
  const query = new URLSearchParams({ case: name });
  if (options.w) query.set("w", String(options.w));
  if (options.dir) query.set("dir", options.dir);
  await page.goto(`/?${query}`);
  await page.locator("#frame").waitFor();
};

const rect = async (locator: Locator): Promise<Rect> => {
  const box = await locator.first().boundingBox();
  if (!box) throw new Error("element has no box");
  return box;
};

const id = (page: Page, testId: string) => page.getByTestId(testId);

const noHorizontalOverflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

const css = (locator: Locator, prop: string, pseudo?: string) =>
  locator.evaluate(
    (el, [p, ps]) =>
      getComputedStyle(el, ps || null)[
        p as keyof CSSStyleDeclaration
      ] as string,
    [prop, pseudo ?? ""] as const,
  );

/** The page background (Canvas under forced colours, white for print). */
const canvas = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

/** Every interactive control in the `environments` gallery. */
const interactive = [
  "button-primary",
  "button-secondary",
  "link",
  "input",
  "checkbox",
  "radio-a",
  "select-trigger",
  "tab-one",
  "tab-two",
] as const;

test.describe("right-to-left page", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "environments", { w: 600, dir: "rtl" });
  });

  test("every control sits inside the frame and nothing scrolls sideways", async ({
    page,
  }) => {
    const frame = await rect(page.locator("#frame"));
    for (const name of interactive) {
      const box = await rect(id(page, name));
      expect(box.x, `${name} left edge`).toBeGreaterThanOrEqual(frame.x - 1);
      expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(
        frame.x + frame.width + 1,
      );
    }
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test("a Cluster runs from the right: the first child is the rightmost", async ({
    page,
  }) => {
    const [primary, secondary, link] = await Promise.all(
      ["button-primary", "button-secondary", "link"].map((name) =>
        rect(id(page, name)),
      ),
    );
    expect(primary!.x).toBeGreaterThan(secondary!.x);
    expect(secondary!.x).toBeGreaterThan(link!.x);
  });

  test("an inline Field puts the control on the right and its label to the left of it", async ({
    page,
  }) => {
    const control = await rect(id(page, "checkbox"));
    const label = await rect(
      id(page, "checkbox-field").getByText("Subscribe", { exact: true }),
    );
    expect(control.x).toBeGreaterThan(label.x);
  });

  test("the Select trigger puts its value on the right and the chevron on the left", async ({
    page,
  }) => {
    const trigger = id(page, "select-trigger");
    const value = await rect(trigger.locator('[data-slot="select-value"]'));
    const chevron = await rect(trigger.locator("svg"));
    expect(chevron.x).toBeLessThan(value.x);
  });

  test("controls inherit the page direction", async ({ page }) => {
    for (const name of ["input", "button-primary", "select-trigger"])
      await expect(id(page, name), name).toHaveCSS("direction", "rtl");
  });

  test("the focus ring is drawn on every control", async ({ page }) => {
    for (const name of interactive) {
      await id(page, name).focus();
      await expect(id(page, name), name).toHaveCSS("outline-style", "solid");
    }
  });
});

test.describe("forced colours", () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Playwright's WebKit does not apply forced colours (the canvas stays
    // transparent and no colour is overridden), so there is nothing to measure.
    test.skip(
      browserName === "webkit",
      "forced colours is not emulated in WebKit",
    );
    await page.emulateMedia({ forcedColors: "active" });
    await open(page, "environments", { w: 600 });
  });

  test("the focus ring is drawn on every control, in a colour that differs from the page", async ({
    page,
  }) => {
    const paper = await canvas(page);
    for (const name of interactive) {
      await id(page, name).focus();
      await expect(id(page, name), name).toHaveCSS("outline-style", "solid");
      expect(
        parseFloat(await css(id(page, name), "outlineWidth")),
        `${name} outline width`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        await css(id(page, name), "outlineColor"),
        `${name} outline colour`,
      ).not.toBe(paper);
    }
  });

  test("a control keeps a border that forced colours paint (the fill is dropped)", async ({
    page,
  }) => {
    const paper = await canvas(page);
    for (const name of [
      "button-primary",
      "button-secondary",
      "input",
      "select-trigger",
      "checkbox",
      "radio-a",
    ]) {
      const control = id(page, name);
      expect(
        parseFloat(await css(control, "borderTopWidth")),
        `${name} border width`,
      ).toBeGreaterThan(0);
      expect(await css(control, "borderTopStyle"), `${name} style`).not.toBe(
        "none",
      );
      expect(
        await css(control, "borderTopColor"),
        `${name} border colour`,
      ).not.toBe(paper);
    }
  });

  test("a link is still told apart from text by its underline", async ({
    page,
  }) => {
    await expect(id(page, "link")).toHaveCSS(
      "text-decoration-line",
      /underline/,
    );
  });
});

test.describe("print media", () => {
  test.beforeEach(async ({ page }) => {
    await open(page, "environments", { w: 700 });
    await page.emulateMedia({ media: "print" });
  });

  test("nothing scrolls sideways", async ({ page }) => {
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test("text and links read on white paper", async ({ page }) => {
    // Polled: a colour transition starts when the media changes.
    for (const target of [
      id(page, "link"),
      id(page, "input"),
      id(page, "select-trigger"),
      id(page, "tab-one"),
      id(page, "tab-two"),
      page.getByText("Email", { exact: true }),
      page.getByText("We never share it."),
    ])
      await expect
        .poll(async () =>
          contrast(await css(target, "color"), "rgb(255, 255, 255)"),
        )
        .toBeGreaterThanOrEqual(4.5);
  });

  test("filled buttons keep their fill and their label stays legible", async ({
    page,
  }) => {
    for (const name of ["button-primary", "button-secondary"]) {
      await expect(id(page, name), name).toHaveCSS(
        "print-color-adjust",
        "exact",
      );
      await expect
        .poll(async () =>
          contrast(
            await css(id(page, name), "color"),
            await css(id(page, name), "backgroundColor"),
          ),
        )
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  test("the edges of a field, a checkbox and a select stay visible on paper", async ({
    page,
  }) => {
    for (const name of ["input", "select-trigger", "checkbox", "radio-a"])
      await expect
        .poll(async () =>
          contrast(
            await css(id(page, name), "borderTopColor"),
            "rgb(255, 255, 255)",
          ),
        )
        .toBeGreaterThanOrEqual(3);
  });
});

test.describe("a flex parent that sizes its child to its content", () => {
  // R07: Grid collapsed to zero width in a Cluster and in a centred Stack. Each
  // control below is itself the flex item.
  const controls = [
    "button",
    "link",
    "input",
    "checkbox",
    "radio",
    "select",
    "tab",
  ] as const;
  const minWidth: Record<(typeof controls)[number], number> = {
    button: 40,
    link: 20,
    input: 80,
    checkbox: 14,
    radio: 14,
    select: 60,
    tab: 30,
  };

  for (const parent of ["row", "cluster", "centre"] as const) {
    test(`${parent}: every control has a usable size and none overlaps`, async ({
      page,
    }) => {
      await open(page, "flex-items", { w: 1100 });
      const boxes: Rect[] = [];
      for (const control of controls) {
        const box = await rect(id(page, `${parent}-${control}`));
        expect(
          box.width,
          `${control} width in ${parent}`,
        ).toBeGreaterThanOrEqual(minWidth[control]);
        expect(
          box.height,
          `${control} height in ${parent}`,
        ).toBeGreaterThanOrEqual(14);
        boxes.push(box);
      }
      if (parent !== "centre") {
        // One row: ordered left to right without overlap (a Cluster may wrap).
        const sameRow = boxes.filter(
          (box) => Math.abs(box.y - boxes[0]!.y) < boxes[0]!.height,
        );
        const sorted = [...sameRow].sort((a, b) => a.x - b.x);
        for (let i = 1; i < sorted.length; i++)
          expect(
            sorted[i]!.x,
            `${parent}: item ${i} overlaps the previous one`,
          ).toBeGreaterThanOrEqual(sorted[i - 1]!.x + sorted[i - 1]!.width - 1);
      } else {
        // A column with `align="center"`: the centres line up.
        const frame = await rect(page.locator("#frame"));
        const middle = frame.x + frame.width / 2;
        for (const box of boxes)
          expect(
            Math.abs(box.x + box.width / 2 - middle),
            `${parent}: centred`,
          ).toBeLessThanOrEqual(2);
      }
    });
  }
});
