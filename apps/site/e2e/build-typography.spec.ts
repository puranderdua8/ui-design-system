import { readFileSync } from "node:fs";
import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// Typography (S54): a pairing changes both fonts and every font request stays on our
// origin; a typed font is a labelled stand-in in the preview and is written to the files.

const { typography: text, errors } = builderContent;
const step = builderContent.steps.find((s) => s.id === "typography")!;
const pairings = step.groups[0]!.choices;
const sizes = step.groups[1]!.choices;

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

const open = async (page: Page) => {
  await page.goto("/build");
  await ready(page);
  await page.getByRole("button", { name: "New design system" }).click();
  await page.goto("/build/typography");
  await ready(page);
};

const previewScope = (page: Page) => page.getByTestId("preview");

/** The font the preview's first heading and its body text are really drawn in. */
const fonts = async (page: Page) =>
  previewScope(page).evaluate((el) => {
    const heading = el.querySelector("h1, h2, h3");
    const body = el.querySelector("p");
    return {
      heading: getComputedStyle(heading!).fontFamily,
      body: getComputedStyle(body!).fontFamily,
    };
  });

const scopeVar = (page: Page, name: string) =>
  previewScope(page).evaluate(
    (el, prop) => getComputedStyle(el).getPropertyValue(prop).trim(),
    name,
  );

test("a pairing changes both fonts and no font request leaves our origin", async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await open(page);

  await page.getByRole("radio", { name: pairings[1]!.name }).click();
  await expect
    .poll(async () => (await fonts(page)).heading)
    .toMatch(/Fraunces/);
  await expect.poll(async () => (await fonts(page)).body).toMatch(/Nunito/);
  await expect(page.getByTestId("choice-typography")).toContainText(
    pairings[1]!.name,
  );

  await page.getByRole("radio", { name: pairings[2]!.name }).click();
  await expect
    .poll(async () => (await fonts(page)).heading)
    .toMatch(/Bricolage/);

  await page.getByRole("radio", { name: pairings[0]!.name }).click();
  await expect.poll(async () => (await fonts(page)).heading).toMatch(/Inter/);
  await expect.poll(async () => (await fonts(page)).body).toMatch(/Inter/);

  // It is saved with the project.
  await page.reload();
  await ready(page);
  await expect(
    page.getByRole("radio", { name: pairings[0]!.name }),
  ).toBeChecked();

  const foreign = requests.filter(
    (url) =>
      !url.startsWith(origin) &&
      !url.startsWith("data:") &&
      !url.startsWith("blob:"),
  );
  expect(foreign).toEqual([]);
});

test("a typed font is a stand-in in the preview and is written to the CSS", async ({
  page,
  baseURL,
}) => {
  const origin = new URL(baseURL!).origin;
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await open(page);

  await page
    .getByLabel(text.headingFont, { exact: true })
    .fill("Space Grotesk");
  await expect(page.getByTestId("own-heading-font-standin")).toContainText(
    "Space Grotesk",
  );
  await expect
    .poll(async () => (await fonts(page)).heading)
    .not.toMatch(/Space Grotesk/);
  await expect(page.getByTestId("choice-typography")).toContainText(
    "Space Grotesk",
  );

  // The same project, exported: the name is in the CSS.
  await page.goto("/playground");
  await ready(page);
  await page
    .locator('[data-slot="tabs"]')
    .first()
    .getByRole("tab", { name: "Export", exact: true })
    .click();
  await page.getByLabel("Theme name", { exact: true }).fill("Acme Brand");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download acme-brand.css" }).click(),
  ]);
  const css = readFileSync((await download.path())!, "utf8");
  expect(css).toMatch(/--ds-font-family-heading: 'Space Grotesk', /);

  expect(
    requests.filter(
      (url) =>
        !url.startsWith(origin) &&
        !url.startsWith("data:") &&
        !url.startsWith("blob:"),
    ),
  ).toEqual([]);
});

test("a font name that cannot be used says so and keeps the last good one", async ({
  page,
}) => {
  await open(page);
  const field = page.getByLabel(text.bodyFont, { exact: true });
  await field.fill("Acme Sans");
  await expect(page.getByTestId("own-body-font-standin")).toBeVisible();
  await field.fill("Acme';}");
  await field.blur();
  await expect(page.getByText(errors.fontInvalid.message)).toBeVisible();
  await expect(page.getByText(errors.fontInvalid.fix)).toBeVisible();
  await expect(page.getByTestId("choice-typography")).toContainText(
    "Acme Sans",
  );
  // Clearing the field goes back to the pairing.
  await field.fill("");
  await expect(page.getByTestId("own-body-font-standin")).toHaveCount(0);
});

test("text size: the cards and the fine-tune slider (by keyboard) set the size", async ({
  page,
}) => {
  await open(page);
  const standard = await scopeVar(page, "--ds-font-size-base");

  await page.getByRole("radio", { name: sizes[2]!.name }).click();
  await expect
    .poll(() => scopeVar(page, "--ds-font-size-base"))
    .not.toBe(standard);
  const large = await scopeVar(page, "--ds-font-size-base");
  await page.getByRole("radio", { name: sizes[1]!.name }).click();
  await expect.poll(() => scopeVar(page, "--ds-font-size-base")).toBe(standard);

  const slider = page.getByRole("slider", { name: text.sizeFineTune });
  await slider.focus();
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    text.sizeWord.standard,
  );
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute("aria-valuetext", text.sizeWord.larger);
  await expect
    .poll(() => scopeVar(page, "--ds-font-size-base"))
    .not.toBe(standard);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveAttribute("aria-valuetext", text.sizeWord.smaller);
  await page.keyboard.press("End");
  expect(large).not.toBe(standard);
});

test("axe finds nothing on the Typography step", async ({ page }) => {
  await open(page);
  const results = await builderAxe(page).analyze();
  expect(results.violations).toEqual([]);
});

test("axe finds nothing with a typed font and its stand-in line", async ({
  page,
}) => {
  await open(page);
  await page
    .getByLabel(text.headingFont, { exact: true })
    .fill("Space Grotesk");
  await expect(page.getByTestId("own-heading-font-standin")).toBeVisible();
  const results = await builderAxe(page).analyze();
  expect(results.violations).toEqual([]);
});
