import { deflateSync, crc32 } from "node:zlib";
import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// Start and Colour (S53): each way of starting makes a project, a brand change restyles
// the preview's main button, an invalid colour gets a sentence with a suggestion.

const { shell, start, colour, questions, errors } = builderContent;
const looks = builderContent.steps[0]!.groups[0]!.choices;

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

/** From the chooser: a new design system, landing on Start. Returns how many exist. */
const startNew = async (page: Page): Promise<number> => {
  await page.goto("/build");
  await ready(page);
  const list = page.getByRole("list", { name: shell.chooser.list });
  const before = await list.getByRole("listitem").count();
  await page.getByRole("button", { name: shell.chooser.newProject }).click();
  await expect(page).toHaveURL(/\/build\/start$/);
  await ready(page);
  return before + 1;
};

const projectCount = async (page: Page): Promise<number> => {
  await page.goto("/build");
  await ready(page);
  return page
    .getByRole("list", { name: shell.chooser.list })
    .getByRole("listitem")
    .count();
};

const mainButton = (page: Page) =>
  page
    .getByTestId("preview")
    .getByRole("button", { name: "Get started" })
    .first();

const background = (page: Page) =>
  mainButton(page).evaluate((el) => getComputedStyle(el).backgroundColor);

/** A solid-colour PNG, built here so no file and no network is needed. */
const png = (r: number, g: number, b: number): Buffer => {
  const size = 8;
  const row = Buffer.concat([
    Buffer.from([0]),
    ...Array.from({ length: size }, () => Buffer.from([r, g, b, 255])),
  ]);
  const chunk = (type: string, data: Buffer): Buffer => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, "ascii");
    const tail = Buffer.alloc(4);
    tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
    return Buffer.concat([head, data, tail]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(Array(size).fill(row)))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

test("choosing a look creates a project that wears it, drawn in the thumbnails", async ({
  page,
}) => {
  const expected = await startNew(page);
  for (const look of ["base", "corporate", "nature", "quirky"])
    await expect(page.getByTestId(`thumbnail-${look}`)).toBeVisible();
  await page.getByRole("radio", { name: looks[2]!.name }).click();
  await expect(page.getByTestId("choice-start")).toHaveText(
    `Starting look: ${looks[2]!.name}`,
  );
  expect(await projectCount(page)).toBe(expected);
});

test("a typed colour restyles the preview's main button and the thumbnails", async ({
  page,
}) => {
  await startNew(page);
  const before = await background(page);
  await page.getByLabel(start.brandLabel, { exact: true }).fill("#c0392b");
  await expect.poll(() => background(page)).toBe("rgb(192, 57, 43)");
  expect(before).not.toBe("rgb(192, 57, 43)");
  // Every thumbnail redraws in the colour.
  for (const look of ["base", "corporate", "nature", "quirky"])
    await expect(page.getByTestId(`thumbnail-${look}-button`)).toHaveCSS(
      "background-color",
      "rgb(192, 57, 43)",
    );
  // It survives a reload (the project is saved).
  await page.reload();
  await ready(page);
  await expect.poll(() => background(page)).toBe("rgb(192, 57, 43)");
});

test("the picker sets the colour too", async ({ page }) => {
  await startNew(page);
  await page
    .getByLabel(`${start.brandLabel}: ${start.pickerLabel}`)
    .fill("#2980b9");
  await expect.poll(() => background(page)).toBe("rgb(41, 128, 185)");
  await page.getByRole("button", { name: start.clearBrand }).click();
  await expect.poll(() => background(page)).not.toBe("rgb(41, 128, 185)");
});

test("a colour from a picture is read in the browser and never sent", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") requests.push(request.url());
  });
  await startNew(page);
  await page.getByLabel(start.fromImage).setInputFiles({
    name: "logo.png",
    mimeType: "image/png",
    buffer: png(200, 40, 40),
  });
  await expect.poll(() => background(page)).toBe("rgb(200, 40, 40)");
  expect(requests).toEqual([]);
});

test("a file that is not a picture says so and changes nothing", async ({
  page,
}) => {
  await startNew(page);
  await page.getByLabel(start.fromImage).setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello"),
  });
  await expect(page.getByText(start.imageFailed.message)).toBeVisible();
  await expect(page.getByText(start.imageFailed.fix)).toBeVisible();
});

test("the three questions choose a look and say why", async ({ page }) => {
  const expected = await startNew(page);
  await page.getByRole("button", { name: questions.link }).click();
  const apply = page.getByRole("button", { name: start.applyAnswers });
  await expect(apply).toBeDisabled();
  await page
    .getByRole("radio", { name: questions.mood.options.warm.name })
    .click();
  await page
    .getByRole("radio", { name: questions.room.options.airy.name })
    .click();
  await page
    .getByRole("radio", { name: questions.corners.options.rounded.name })
    .click();
  await apply.click();
  await expect(page.getByTestId("start-reason")).toContainText(
    questions.mood.options.warm.reason,
  );
  await expect(page.getByTestId("start-reason")).toContainText(
    questions.corners.options.rounded.reason,
  );
  await expect(page.getByTestId("choice-start")).toHaveText(
    `Starting look: ${looks[2]!.name}`,
  );
  await expect(page.getByTestId("choice-spacing")).toHaveText(
    "Spacing: Spacious",
  );
  expect(await projectCount(page)).toBe(expected);
});

test("an invalid colour shows a sentence with a suggestion and keeps the colour", async ({
  page,
}) => {
  await startNew(page);
  const field = page.getByLabel(start.brandLabel, { exact: true });
  await field.fill("#c0392b");
  await expect.poll(() => background(page)).toBe("rgb(192, 57, 43)");
  await field.fill("blue");
  await field.blur();
  await expect(page.getByText(errors.colourInvalid.message)).toBeVisible();
  await expect(page.getByText(errors.colourInvalid.fix)).toBeVisible();
  expect(await background(page)).toBe("rgb(192, 57, 43)");
  // Typing a good one clears the message.
  await field.fill("#2980b9");
  await expect(page.getByText(errors.colourInvalid.message)).toHaveCount(0);
});

test("Colour: shades, highlight suggestions, your own highlight, background feel and readability", async ({
  page,
}) => {
  await page.goto("/build/colour");
  await ready(page);
  await page
    .getByTestId("brand-colour")
    .getByLabel(colour.brandLabel, { exact: true })
    .fill("#1d3f8f");
  await expect(page.getByTestId("shade-strip")).toHaveAccessibleName(
    colour.shadesLabel,
  );
  await expect(page.getByTestId("shade-strip").locator("span")).toHaveCount(10);
  await expect(page.getByTestId("brand-colour-line")).toHaveText(
    colour.readableBrand,
  );

  // A pale colour cannot carry white text, and the line says so.
  await page
    .getByTestId("brand-colour")
    .getByLabel(colour.brandLabel, { exact: true })
    .fill("#f5e663");
  await expect(page.getByTestId("brand-colour-line")).toHaveText(
    colour.hardBrand,
  );
  await page
    .getByTestId("brand-colour")
    .getByLabel(colour.brandLabel, { exact: true })
    .fill("#1d3f8f");

  // A suggested highlight is chosen, and your own can follow.
  const suggestions = page
    .getByTestId("highlight-suggestions")
    .getByRole("button");
  await expect(suggestions).toHaveCount(4);
  await suggestions.first().click();
  await expect(suggestions.first()).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel(colour.ownHighlight, { exact: true }).fill("#b5651d");
  await expect(suggestions.first()).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("highlight-colour-line")).toBeVisible();

  // Background feel: the card is chosen and the readability line stays.
  await page.getByRole("radio", { name: "Warm", exact: true }).click();
  await expect(
    page.getByRole("radio", { name: "Warm", exact: true }),
  ).toBeChecked();
  await expect(page.getByTestId("feel-line")).toBeVisible();
  await page.getByRole("radio", { name: "Tinted to brand" }).click();
  await expect(
    page.getByRole("radio", { name: "Tinted to brand" }),
  ).toBeChecked();
});

test("axe is clean on Start (questions open) and on Colour", async ({
  page,
}) => {
  await page.goto("/build/start");
  await ready(page);
  await page.getByRole("button", { name: questions.link }).click();
  let results = await builderAxe(page).analyze();
  expect(results.violations, "start").toEqual([]);

  await page.goto("/build/colour");
  await ready(page);
  results = await builderAxe(page).analyze();
  expect(results.violations, "colour").toEqual([]);
});

test("axe is clean with the invalid-colour message showing", async ({
  page,
}) => {
  await page.goto("/build/start");
  await ready(page);
  const field = page.getByLabel(start.brandLabel, { exact: true });
  await field.fill("blue");
  await field.blur();
  await expect(page.getByText(errors.colourInvalid.message)).toBeVisible();
  const results = await builderAxe(page).analyze();
  expect(results.violations).toEqual([]);
});
