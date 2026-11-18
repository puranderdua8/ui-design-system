import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// The style guide and print (S58): axe is clean, the print view has no tool chrome and
// clips nothing, and the page works from a shared link (and a tampered one is safe).

const { guide, use, errors } = builderContent;
const brand = "#1762b6";

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

const guideReady = async (page: Page) => {
  await expect(page.getByTestId("guide")).toHaveAttribute(
    "data-state",
    /project|ok/,
  );
};

/** A fresh project with a brand colour, then its share link from the Use it step. */
const linkFor = async (page: Page): Promise<string> => {
  await page.goto("/build");
  await ready(page);
  await page.getByRole("button", { name: "New design system" }).click();
  await page.waitForURL("**/build/start");
  await page.goto("/build/colour");
  await ready(page);
  await page
    .getByTestId("brand-colour")
    .getByLabel(builderContent.colour.brandLabel, { exact: true })
    .fill(brand);
  await page.goto("/build/use");
  await ready(page);
  await page
    .getByRole("button", { name: builderContent.buttons.copyLink })
    .click();
  return page.getByTestId("share-link").inputValue();
};

const brandOf = (page: Page) =>
  page
    .getByTestId("guide-scope")
    .evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--ds-color-brand-600").trim(),
    );

test("the style guide shows every section for the open project", async ({
  page,
}) => {
  await page.goto("/build");
  await ready(page);
  await page.goto("/build/guide");
  await guideReady(page);

  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  for (const title of [
    guide.colourTitle,
    guide.typeTitle,
    guide.shapeTitle,
    guide.spacingTitle,
    guide.depthTitle,
    guide.motionTitle,
    guide.partsTitle,
    guide.readTitle,
  ])
    await expect(
      page.getByRole("heading", { level: 2, name: title }),
    ).toBeVisible();

  const colours = page.getByTestId("guide-colour");
  expect(await colours.count()).toBeGreaterThanOrEqual(8);
  await expect(colours.first()).toContainText(/#[0-9a-f]{6}/i);
  await expect(colours.first()).toContainText(guide.useFor);
  await expect(page.getByTestId("guide-credit")).toContainText(guide.credit);
  await builderAxe(page);
});

test("the Use it step links to the guide", async ({ page }) => {
  await page.goto("/build/use");
  await ready(page);
  await page.getByRole("link", { name: use.openGuide }).click();
  await page.waitForURL("**/build/guide");
  await guideReady(page);
});

test("print shows no tool chrome and clips nothing", async ({ page }) => {
  await page.goto("/build/guide");
  await guideReady(page);
  await page.emulateMedia({ media: "print" });

  for (const hidden of [
    page.locator("body > header"),
    page.locator("body > footer"),
    page.getByTestId("guide-toolbar"),
    page.getByRole("region", { name: builderContent.shell.topBarLabel }),
    page.getByRole("link", { name: "Skip to content" }),
  ])
    await expect(hidden).toBeHidden();

  // The content is still there, as real text.
  await expect(page.getByTestId("guide-name")).toBeVisible();
  await expect(page.getByTestId("guide-credit")).toBeVisible();

  // Nothing is wider than its page and nothing sits in a clipping box.
  const clipped = await page.evaluate(() => {
    const root = document.documentElement;
    const wide = root.scrollWidth > root.clientWidth + 1;
    const hiddenOverflow = [
      ...document.querySelectorAll<HTMLElement>("main, main *"),
    ].filter((el) => {
      const style = getComputedStyle(el);
      return (
        el.scrollWidth > el.clientWidth + 1 &&
        el.clientWidth > 0 &&
        (style.overflowX === "hidden" ||
          style.overflowX === "clip" ||
          style.overflowX === "scroll" ||
          style.overflowX === "auto") &&
        el.tagName !== "PRE"
      );
    });
    return { wide, count: hiddenOverflow.length };
  });
  expect(clipped).toEqual({ wide: false, count: 0 });
});

test("the guide works from a shared link, and a tampered link is safe", async ({
  page,
  browser,
}) => {
  const link = await linkFor(page);
  const guideLink = link.replace("/build/shared#", "/build/guide#");

  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto(guideLink);
  await expect(other.getByTestId("guide")).toHaveAttribute("data-state", "ok");
  expect(await brandOf(other)).toBe("#1762b6");
  await expect(other.getByText(guide.sharedNote)).toBeVisible();
  await expect(other.getByTestId("guide-colour").first()).toBeVisible();
  await builderAxe(other);

  // The shared view hands its own link on to the guide.
  await other.goto(link);
  await other.getByRole("link", { name: use.openGuide }).click();
  await other.waitForURL(/\/build\/guide#d=/);
  await expect(other.getByTestId("guide")).toHaveAttribute("data-state", "ok");
  expect(await brandOf(other)).toBe("#1762b6");

  // A link that is not a design says so and shows nothing of the guide.
  await other.goto("/build/guide#d=not-a-design");
  await expect(other.getByTestId("guide")).toHaveAttribute(
    "data-state",
    "invalid",
  );
  await expect(other.getByTestId("guide-problem")).toContainText(
    errors.linkBroken.message,
  );
  await expect(other.getByTestId("guide-scope")).toHaveCount(0);
  await context.close();
});
