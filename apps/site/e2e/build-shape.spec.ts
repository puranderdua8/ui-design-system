import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// Shape, Spacing, Depth and motion, and "Try another combination" (S55): each picture
// choice sets the value of the look it is taken from, the fine-tunes work by keyboard,
// Play respects reduced motion, and a shuffle is one undo step that keeps the colours.

const require = createRequire(`${process.cwd()}/package.json`);
const theme = (name: string): Record<string, string> =>
  JSON.parse(
    readFileSync(
      require.resolve(`@puranderdua/ui/themes/${name}.json`),
      "utf8",
    ),
  ).vars;
const corporate = theme("corporate");
const nature = theme("nature");
const quirky = theme("quirky");

const { look: text, buttons, shuffle } = builderContent;
const step = (id: string) => builderContent.steps.find((s) => s.id === id)!;
const shape = step("shape");
const spacing = step("spacing");
const depth = step("depth");

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

const open = async (page: Page, id: string) => {
  await page.goto("/build");
  await ready(page);
  await page.getByRole("button", { name: "New design system" }).click();
  await page.goto(`/build/${id}`);
  await ready(page);
};

const scopeVar = (page: Page, name: string) =>
  page
    .getByTestId("preview")
    .evaluate(
      (el, prop) => getComputedStyle(el).getPropertyValue(prop).trim(),
      name,
    );

const norm = (value: string | number) => String(value).replace(/\s+/g, " ");
const px = (value: string) => Number.parseFloat(value);

test("corners and outline set the preview's radius and border width", async ({
  page,
}) => {
  await open(page, "shape");
  const corners = shape.groups[0]!.choices;

  await page.getByRole("radio", { name: corners[0]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-radius-lg"))
    .toBe(corporate["--ds-radius-lg"]);
  await page.getByRole("radio", { name: corners[3]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-radius-lg"))
    .toBe(quirky["--ds-radius-lg"]);
  await expect(page.getByTestId("choice-shape")).toContainText(
    corners[3]!.name,
  );

  const outline = shape.groups[1]!.choices;
  await page
    .getByRole("radio", { name: outline[1]!.name, exact: true })
    .click();
  await expect.poll(() => scopeVar(page, "--ds-border-width-1")).toBe("2px");
  await page
    .getByRole("radio", { name: outline[0]!.name, exact: true })
    .click();
  await expect.poll(() => scopeVar(page, "--ds-border-width-1")).toBe("1px");
});

test("the corners fine-tune works by keyboard and is said in words", async ({
  page,
}) => {
  await open(page, "shape");
  const slider = page.getByRole("slider", { name: text.cornersFineTune });
  const before = px(await scopeVar(page, "--ds-radius-lg"));
  await slider.focus();
  await expect(slider).toHaveAttribute("aria-valuetext", text.cornersWord.same);
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    text.cornersWord.rounder,
  );
  await expect
    .poll(async () => px(await scopeVar(page, "--ds-radius-lg")))
    .toBeGreaterThan(before);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    text.cornersWord.squarer,
  );
  await expect
    .poll(async () => px(await scopeVar(page, "--ds-radius-lg")))
    .toBeLessThan(before);

  const outline = page.getByRole("slider", { name: text.outlineFineTune });
  await outline.focus();
  await page.keyboard.press("ArrowRight");
  await expect(outline).toHaveAttribute(
    "aria-valuetext",
    text.outlineWord.replace("{count}", "2"),
  );
  await expect.poll(() => scopeVar(page, "--ds-border-width-1")).toBe("2px");
});

test("spacing cards set the spacing and the tap note is shown", async ({
  page,
}) => {
  await open(page, "spacing");
  const names = spacing.groups[0]!.choices;
  await expect(page.getByText(text.tapNote)).toBeVisible();

  await page.getByRole("radio", { name: names[0]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-space-4"))
    .toBe(corporate["--ds-space-4"]);
  await page.getByRole("radio", { name: names[2]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-space-4"))
    .toBe(nature["--ds-space-4"]);

  const slider = page.getByRole("slider", { name: text.spacingFineTune });
  const before = px(await scopeVar(page, "--ds-space-4"));
  await slider.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    text.spacingWord.tighter,
  );
  await expect
    .poll(async () => px(await scopeVar(page, "--ds-space-4")))
    .toBeLessThan(before);
  // A control never gets smaller than 24px, however tight (WCAG 2.5.8).
  await page.keyboard.press("Home");
  const control = px(await scopeVar(page, "--ds-size-control-sm"));
  expect(control).toBeGreaterThanOrEqual(1.5);
});

test("shadows and motion cards set the values and Play uses them", async ({
  page,
}) => {
  await open(page, "depth");
  const shadows = depth.groups[0]!.choices;
  const motion = depth.groups[1]!.choices;

  await page.getByRole("radio", { name: shadows[0]!.name }).click();
  await expect
    .poll(async () => norm(await scopeVar(page, "--ds-shadow-lg")))
    .toContain("0px 0px 0px 0px");
  await page.getByRole("radio", { name: shadows[3]!.name }).click();
  await expect
    .poll(async () => norm(await scopeVar(page, "--ds-shadow-lg")))
    .toBe(norm(quirky["--ds-shadow-lg"]!));

  await page.getByRole("radio", { name: motion[0]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-duration-200"))
    .toBe(corporate["--ds-duration-200"]);
  await page.getByRole("radio", { name: motion[3]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-duration-200"))
    .toBe(quirky["--ds-duration-200"]);

  const sample = page.getByTestId("motion-sample");
  await page.getByRole("button", { name: buttons.play }).click();
  await expect
    .poll(() => sample.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe("none");
  expect(
    await sample.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe(`${Number.parseFloat(quirky["--ds-duration-200"]!) / 1000}s`);

  // Speed fine-tune by keyboard.
  const slider = page.getByRole("slider", { name: text.motionFineTune });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    text.motionWord.faster,
  );
  const shadow = page.getByRole("slider", { name: text.shadowFineTune });
  await shadow.focus();
  await page.keyboard.press("ArrowRight");
  await expect(shadow).toHaveAttribute(
    "aria-valuetext",
    text.shadowWord.darker,
  );
});

test("Play does not move the sample when the device asks for less movement", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "depth");
  await expect(page.getByText(text.reducedMotion)).toBeVisible();
  await page.getByRole("button", { name: buttons.play }).click();
  const sample = page.getByTestId("motion-sample");
  await expect
    .poll(() => sample.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe("none");
  expect(
    await sample.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});

test("Try another combination is one undo step and keeps the colours", async ({
  page,
}) => {
  await open(page, "colour");
  await page
    .getByTestId("brand-colour")
    .getByLabel(builderContent.colour.brandLabel, { exact: true })
    .fill("#1d3f8f");
  const watched = [
    "--ds-radius-lg",
    "--ds-space-4",
    "--ds-shadow-lg",
    "--ds-duration-200",
  ];
  const snapshot = async () =>
    Promise.all(
      [...watched, "--ds-color-brand-600"].map((name) => scopeVar(page, name)),
    );
  await expect.poll(() => scopeVar(page, "--ds-color-brand-600")).not.toBe("");
  const before = await snapshot();

  await expect(
    page.getByRole("checkbox", { name: shuffle.keepColours }),
  ).toBeChecked();
  await page.getByRole("button", { name: buttons.tryAnother }).click();
  await expect.poll(snapshot).not.toEqual(before);
  const after = await snapshot();
  // The brand colour is kept (it is the last value in the snapshot).
  expect(after.at(-1)).toBe(before.at(-1));

  // One undo puts every dimension back.
  await page.getByRole("button", { name: buttons.undo, exact: true }).click();
  await expect.poll(snapshot).toEqual(before);
  // The next undo is the brand colour, not a half-shuffled state.
  await page.getByRole("button", { name: buttons.redo, exact: true }).click();
  await expect.poll(snapshot).toEqual(after);
});

test("unticking Keep my colours lets a shuffle change them", async ({
  page,
}) => {
  await open(page, "shape");
  await page.getByRole("checkbox", { name: shuffle.keepColours }).click();
  const brand = () => scopeVar(page, "--ds-color-brand-600");
  const before = await brand();
  for (let i = 0; i < 6 && (await brand()) === before; i += 1)
    await page.getByRole("button", { name: buttons.tryAnother }).click();
  expect(await brand()).not.toBe(before);
});

test("axe finds nothing on the three steps", async ({ page }) => {
  for (const id of ["shape", "spacing", "depth"]) {
    await open(page, id);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, id).toEqual([]);
  }
});
