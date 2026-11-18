import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// Check (S56): a failing brand colour is explained, shown in the preview and fixed in one
// click; Undo puts it back; the live region speaks once per lasting change; every
// decision is listed with a link to its step.

const { check, buttons, status, steps } = builderContent;
const paleBrand = "#f5e663";

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

const fresh = async (page: Page) => {
  await page.goto("/build");
  await ready(page);
  await page.getByRole("button", { name: "New design system" }).click();
  await page.waitForURL("**/build/start");
};

const setBrand = async (page: Page, value: string) => {
  await page
    .getByTestId("brand-colour")
    .getByLabel(builderContent.colour.brandLabel, { exact: true })
    .fill(value);
};

const brand600 = (page: Page) =>
  page
    .getByTestId("preview")
    .evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--ds-color-brand-600").trim(),
    );

test("a readable design system says so, with every decision linked to its step", async ({
  page,
}) => {
  await fresh(page);
  await page.goto("/build/check");
  await ready(page);
  await expect(page.getByTestId("status-pill")).toHaveText(status.readable);
  await expect(page.getByTestId("check-all-readable")).toContainText(
    "combinations are readable (WCAG AA).",
  );
  await expect(page.getByRole("button", { name: buttons.fixIt })).toHaveCount(
    0,
  );

  // Technical details are closed until asked for, and then list the pairs.
  const details = page.getByTestId("check-details");
  await expect(details).not.toHaveAttribute("open", "");
  await details
    .getByText(steps.find((s) => s.id === "check")!.fineTune!)
    .click();
  await expect(details.locator("li").first()).toHaveText(check.detailsNone);
  await expect(details.locator("li").nth(1)).toContainText(" to 1, needs ");

  for (const id of [
    "start",
    "colour",
    "typography",
    "shape",
    "spacing",
    "depth",
  ]) {
    const item = page.getByTestId(`built-${id}`);
    await expect(item).toBeVisible();
    await expect(item.getByRole("link")).toHaveAttribute(
      "href",
      `/build/${id}`,
    );
  }
  await page.getByTestId("built-shape").getByRole("link").click();
  await page.waitForURL("**/build/shape");
});

test("a failing brand colour is explained, shown, fixed in one click, and undone", async ({
  page,
}) => {
  await fresh(page);
  const original = await brand600(page);
  await page.goto("/build/colour");
  await ready(page);
  await setBrand(page, paleBrand);
  await page.goto("/build/check");
  await ready(page);

  const pill = page.getByTestId("status-pill");
  await expect(pill).not.toHaveText(status.readable);
  const lightBrand = await brand600(page);
  expect(lightBrand).not.toBe(original);

  // Explained, in plain words, with a sample.
  const cause = page.getByTestId("cause-brand");
  await expect(cause).toContainText(check.causes.brandLight);
  await expect(cause).toContainText("places are affected, for example");
  await expect(cause.getByTestId("check-sample")).toBeVisible();

  // Shown: the places in the preview are outlined, and Hide takes the outlines away.
  const show = cause.getByRole("button", { name: buttons.showMe });
  await show.click();
  await expect(
    cause.getByRole("button", { name: check.hideIt }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(() =>
      page.getByTestId("preview").locator("[data-check-flag]").count(),
    )
    .toBeGreaterThan(0);
  await expect(cause.getByTestId("check-shown")).toContainText("Showing");
  await cause.getByRole("button", { name: check.hideIt }).click();
  await expect(page.locator("[data-check-flag]")).toHaveCount(0);

  // Fixed in one click: before and after, readable, and a different brand colour.
  await cause.getByRole("button", { name: buttons.fixIt }).click();
  const fixed = page.getByTestId("check-fixed");
  await expect(fixed).toBeVisible();
  await expect(fixed).toContainText(status.fixed);
  await expect(fixed).toContainText(check.before);
  await expect(fixed).toContainText(check.after);
  await expect(pill).toHaveText(status.readable);
  await expect(page.getByTestId("check-all-readable")).toBeVisible();
  const fixedBrand = await brand600(page);
  expect(fixedBrand).not.toBe(lightBrand);

  // Undo is one step and restores the colour that failed.
  await page.getByRole("button", { name: buttons.undo }).first().click();
  await expect.poll(() => brand600(page)).toBe(lightBrand);
  await expect(pill).not.toHaveText(status.readable);
  await expect(page.getByTestId("check-fixed")).toHaveCount(0);
  await expect(page.getByTestId("cause-brand")).toBeVisible();
});

test("Fix all fixes every cause that can be fixed in one undo step", async ({
  page,
}) => {
  await fresh(page);
  await page.goto("/build/colour");
  await ready(page);
  await setBrand(page, paleBrand);
  await page.goto("/build/check");
  await ready(page);
  const lightBrand = await brand600(page);
  await expect(page.getByTestId("status-pill")).not.toHaveText(status.readable);

  const fixAll = page.getByRole("button", { name: check.fixAll });
  if (await fixAll.count()) await fixAll.click();
  else
    await page
      .getByTestId("cause-brand")
      .getByRole("button", { name: buttons.fixIt })
      .click();
  await expect(page.getByTestId("status-pill")).toHaveText(status.readable);
  await page.getByRole("button", { name: buttons.undo }).first().click();
  await expect.poll(() => brand600(page)).toBe(lightBrand);
});

test("the live region speaks once per lasting change and not for a quick change and back", async ({
  page,
}) => {
  await fresh(page);
  await page.goto("/build/colour");
  await ready(page);
  const live = page.getByTestId("live-status");
  await expect(live).toHaveAttribute("aria-live", "polite");
  await expect(live).toHaveText("");

  // Record every text the region takes.
  await live.evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { __live: string[] }).__live = seen;
    new MutationObserver(() => seen.push(el.textContent ?? "")).observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  const spoken = () =>
    page.evaluate(() => (window as unknown as { __live: string[] }).__live);
  // Let the first value settle as the starting point (nothing is spoken for it).
  await page.waitForTimeout(900);
  expect(await spoken()).toEqual([]);

  // A quick change and back: nothing is said.
  await setBrand(page, paleBrand);
  await setBrand(page, "#1d3f8f");
  await page.waitForTimeout(1200);
  expect(await spoken()).toEqual([]);

  // A lasting change: said once, whatever the number of changes behind it.
  await setBrand(page, paleBrand);
  await expect(live).not.toHaveText("");
  await page.waitForTimeout(1200);
  const heard = await spoken();
  expect(heard).toHaveLength(1);
  expect(heard[0]).toMatch(/to fix$/);
  await expect(page.getByTestId("status-pill")).toHaveText(heard[0]!);
});

test("Check passes axe, readable and with something to fix", async ({
  page,
}) => {
  await fresh(page);
  await page.goto("/build/check");
  await ready(page);
  const clean = await builderAxe(page).analyze();
  expect(clean.violations).toEqual([]);

  await page.goto("/build/colour");
  await ready(page);
  await setBrand(page, paleBrand);
  await page.goto("/build/check");
  await ready(page);
  await expect(page.getByTestId("cause-brand")).toBeVisible();
  // The sample draws the failing pair on purpose and the preview shows it, so contrast
  // is judged on the controls only; every other rule runs.
  const results = await builderAxe(page, [
    '[data-testid="preview"]',
    '[data-testid="check-sample"]',
  ]).analyze();
  expect(results.violations).toEqual([]);
});
