import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// The five preview pages (S52, spec 4.8): axe on every tab in every look, no landmark
// inside, headings below the tool's, nothing navigates or submits, each tab reflows at
// the Phone width. Studio hosts the same preview and lets a test pick the look.

const { preview: text, shell } = builderContent;
const pages = Object.values(text.pages);
const looks = ["Base", "Corporate", "Nature", "Quirky"];

const region = (page: Page) => page.getByTestId("preview");

const ready = async (page: Page) => {
  await page.goto("/build/studio");
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByLabel("Brand colour", { exact: true })).toBeVisible();
};

const chooseLook = async (page: Page, look: string) => {
  await page.getByRole("combobox", { name: "Starting look" }).click();
  await page.getByRole("option", { name: look, exact: true }).click();
  await expect(region(page)).toHaveAttribute(
    "data-ds-theme",
    look.toLowerCase(),
  );
};

const openPage = async (page: Page, name: string) => {
  await region(page).getByRole("tab", { name, exact: true }).click();
  // The All components page has tabs of its own, so wait for the frame, not a tabpanel.
  await expect(region(page).getByTestId("preview-frame")).toBeVisible();
};

const setWidth = async (page: Page, name: string) => {
  await region(page).getByRole("radio", { name, exact: true }).click();
};

test.describe("axe on every tab in every look", () => {
  for (const look of looks) {
    test(look, async ({ page }) => {
      await ready(page);
      if (look !== "Base") await chooseLook(page, look);
      for (const name of pages) {
        await openPage(page, name);
        const results = await builderAxe(page).analyze();
        expect(results.violations, `${look} / ${name}`).toEqual([]);
      }
    });
  }
});

test("the preview is one labelled region after the panel, with a skip link", async ({
  page,
}) => {
  await ready(page);
  const section = page.locator("section#preview");
  await expect(section).toHaveAttribute("aria-label", shell.previewLabel);
  const after = await page.evaluate(() => {
    const controls = document.querySelector('[data-slot="tabs"]')!;
    const preview = document.getElementById("preview")!;
    return controls.compareDocumentPosition(preview);
  });
  // DOCUMENT_POSITION_FOLLOWING (4): the preview comes after the controls.
  expect(after & 4).toBe(4);
  await page.getByRole("link", { name: shell.skipToPreview }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#preview$/);
});

test("no page has a landmark of its own and its headings sit below the tool's", async ({
  page,
}) => {
  await ready(page);
  for (const name of pages) {
    await openPage(page, name);
    await expect(
      region(page).locator(
        'main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
      ),
    ).toHaveCount(0);
    const levels = await region(page)
      .locator("h1, h2, h3, h4, h5, h6, [role=heading]")
      .evaluateAll((all) => all.map((h) => Number(h.tagName.slice(1)) || 0));
    // The preview's own title is the only h2; everything else is below it.
    expect(
      levels.filter((level) => level <= 2),
      name,
    ).toEqual([2]);
  }
});

test("links do not navigate and forms do not submit", async ({ page }) => {
  await ready(page);
  const url = page.url();
  await openPage(page, text.pages.landing);
  await region(page).getByRole("link").first().click();
  await expect(page).toHaveURL(url);

  await openPage(page, text.pages.signup);
  let requests = 0;
  page.on("request", (request) => {
    if (request.method() === "POST") requests += 1;
  });
  await region(page).getByRole("button", { name: "Sign up" }).click();
  await expect(page).toHaveURL(url);
  expect(requests).toBe(0);
});

test("the width switch sets the frame's width", async ({ page }) => {
  await ready(page);
  const frame = region(page).getByTestId("preview-frame");
  const widthOf = async () => (await frame.boundingBox())!.width;
  await setWidth(page, text.widths.phone);
  await expect.poll(widthOf).toBeLessThanOrEqual(384);
  await setWidth(page, text.widths.tablet);
  await expect.poll(widthOf).toBeGreaterThan(384);
  await setWidth(page, text.widths.desktop);
  await expect(frame).toHaveAttribute("data-width", "desktop");
});

test.describe("each tab reflows at the Phone width", () => {
  for (const name of pages) {
    test(name, async ({ page }) => {
      await ready(page);
      await setWidth(page, text.widths.phone);
      await openPage(page, name);
      const frame = region(page).getByTestId("preview-frame");
      const { scroll, client } = await frame.evaluate((el) => ({
        scroll: el.scrollWidth,
        client: el.clientWidth,
      }));
      expect(scroll, name).toBeLessThanOrEqual(client);
    });
  }
});

test("a dialog opens in the preview's look and the page stays put", async ({
  page,
}) => {
  await ready(page);
  await chooseLook(page, "Quirky");
  await openPage(page, text.pages.settings);
  await region(page).getByRole("button", { name: "Delete account" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveCSS("--ds-color-brand-600", "#703dc6");
  const results = await builderAxe(page).analyze();
  expect(results.violations).toEqual([]);
});
