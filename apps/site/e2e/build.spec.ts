import { builderAxe } from "./axe";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";
import { tabKey } from "./keys";

// The Builder shell (S51): the step list, one URL per step, the top bar, the project
// chooser and Studio. The picture choices arrive in S53–S55; here each step shows its
// current choice.

const { steps, shell, buttons } = builderContent;
const stepTitle = (name: string) => shell.stepTitle.replace("{step}", name);

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

const focusedText = (page: Page) =>
  page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");

/** Tabs forward until the focused element's text starts with `text`. */
const tabTo = async (page: Page, key: string, text: string) => {
  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press(key);
    if ((await focusedText(page)).startsWith(text)) return;
  }
  throw new Error(`Never reached "${text}" by keyboard`);
};

test("every step has its own URL, title, current mark and no violation", async ({
  page,
}) => {
  for (const [index, step] of steps.entries()) {
    await page.goto(`/build/${step.id}`);
    await ready(page);
    await expect(page).toHaveTitle(new RegExp(`^${stepTitle(step.name)}`));
    // `noindex` until launch, and one open step in the list.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    const list = page.getByRole("navigation", { name: shell.stepListLabel });
    await expect(list.getByRole("listitem")).toHaveCount(steps.length);
    await expect(list.locator('[aria-current="step"]')).toHaveCount(1);
    await expect(list.locator('[aria-current="step"]')).toContainText(
      `${index + 1}. ${step.name}`,
    );
    await expect(
      page.getByRole("heading", { level: 2, name: step.question }),
    ).toBeVisible();
    const results = await builderAxe(page).analyze();
    expect(results.violations, step.id).toEqual([]);
  }
});

test("an unknown step is a 404", async ({ page }) => {
  const response = await page.goto("/build/nonsense");
  expect(response?.status()).toBe(404);
});

test("a keyboard-only walk through every step lands on the step's heading", async ({
  page,
  browserName,
}) => {
  const key = tabKey(browserName);
  await page.goto("/build/start");
  await ready(page);
  for (let i = 1; i < steps.length; i += 1) {
    const here = steps[i - 1]!;
    const there = steps[i]!;
    await tabTo(page, key, buttons.next.replace("{step}", there.name));
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/build/${there.id}$`));
    // Focus is on the open step's heading, and it is the step's question.
    await expect(
      page.getByRole("heading", { level: 2, name: there.question }),
    ).toBeFocused();
    expect(here.id).not.toBe(there.id);
  }
  // The last step has no Next button.
  await expect(page.getByRole("link", { name: /^Next:/ })).toHaveCount(0);
});

test("Back and Forward move between steps", async ({ page }) => {
  await page.goto("/build/start");
  await ready(page);
  await page
    .getByRole("link", { name: buttons.next.replace("{step}", "Colour") })
    .click();
  await expect(page).toHaveURL(/\/build\/colour$/);
  await page
    .getByRole("link", { name: buttons.next.replace("{step}", "Typography") })
    .click();
  await expect(page).toHaveURL(/\/build\/typography$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/build\/colour$/);
  await expect(
    page.getByRole("heading", { level: 2, name: steps[1]!.question }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/build\/typography$/);
  await expect(
    page.getByRole("heading", { level: 2, name: steps[2]!.question }),
  ).toBeVisible();
});

test("each step shows its current choice from the content file", async ({
  page,
}) => {
  await page.goto("/build/shape");
  await ready(page);
  await expect(page.getByTestId("choice-start")).toHaveText(
    "Starting look: Quiet and neutral",
  );
  await expect(page.getByTestId("choice-shape")).toHaveText(
    "Corners: Soft, Outline: Thin",
  );
  await expect(page.getByTestId("choice-spacing")).toHaveText(
    "Spacing: Comfortable",
  );
  await expect(page.getByTestId("choice-depth")).toHaveText(
    "Shadows: As in your starting look, Motion: Standard",
  );
});

test("the preview follows the panel in the page and a skip link passes the steps", async ({
  page,
  browserName,
}) => {
  await page.goto("/build/start");
  await ready(page);
  const skip = page.getByRole("link", { name: shell.skipToPreview });
  await expect(skip).toHaveCount(1);
  const order = await page.evaluate(() => {
    const steps = document.querySelector("nav[aria-label='Steps']")!;
    const preview = document.getElementById("preview")!;
    return steps.compareDocumentPosition(preview);
  });
  // DOCUMENT_POSITION_FOLLOWING (4): the preview comes after the steps.
  expect(order & 4).toBe(4);
  await tabTo(page, tabKey(browserName), shell.skipToPreview);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#preview$/);
});

test("the top bar renames the project in place, and Undo and Redo start off", async ({
  page,
}) => {
  await page.goto("/build/start");
  await ready(page);
  await expect(page.getByRole("button", { name: buttons.undo })).toBeDisabled();
  await expect(page.getByRole("button", { name: buttons.redo })).toBeDisabled();
  await expect(page.getByTestId("status-pill")).toHaveText("Readable");
  const name = page.getByRole("textbox", { name: shell.projectName });
  await expect(name).toHaveValue("My design system");
  await name.fill("Harbour");
  await page.keyboard.press("Enter");
  await page.reload();
  await ready(page);
  await expect(
    page.getByRole("textbox", { name: shell.projectName }),
  ).toHaveValue("Harbour");
});

test("Guided and Studio are one click apart", async ({ page }) => {
  await page.goto("/build/start");
  await ready(page);
  const view = page.getByRole("navigation", { name: shell.viewLabel });
  await expect(view.getByRole("link", { name: shell.guided })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await view.getByRole("link", { name: shell.studio }).click();
  await expect(page).toHaveURL(/\/build\/studio$/);
  await expect(view.getByRole("link", { name: shell.studio })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Studio hosts today's four panels", async ({ page }) => {
  await page.goto("/build/studio");
  await ready(page);
  await expect(page).toHaveTitle(/^Studio/);
  await expect(
    page.locator('[data-slot="tabs"]').first().getByRole("tab"),
  ).toHaveText(["Design", "Check", "Advanced", "Export"]);
  const results = await builderAxe(page).analyze();
  expect(results.violations).toEqual([]);
});

test("the project chooser renames, duplicates and deletes with a confirmation", async ({
  page,
}) => {
  await page.goto("/build");
  await ready(page);
  await expect(page).toHaveTitle(/^Your design systems/);
  const names = page.getByTestId("project-name");
  await expect(names).toHaveText(["My design system"]);
  expect((await builderAxe(page).analyze()).violations).toEqual([]);

  // Rename
  await page.getByRole("button", { name: /^Rename/ }).click();
  await page.getByLabel(shell.chooser.renameLabel).fill("Harbour");
  await page.getByRole("button", { name: buttons.rename, exact: true }).click();
  await expect(names).toHaveText(["Harbour"]);

  // Duplicate: the copy follows the original
  await page.getByRole("button", { name: /^Duplicate/ }).click();
  await expect(names).toHaveText(["Harbour", "Harbour copy"]);

  // Delete asks first; Cancel keeps the project
  await page.getByRole("button", { name: /^Delete Harbour copy/ }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    builderContent.errors.deleteProject.message,
  );
  expect((await builderAxe(page).analyze()).violations).toEqual([]);
  await dialog.getByRole("button", { name: buttons.cancel }).click();
  await expect(names).toHaveCount(2);

  // Deleting for real
  await page.getByRole("button", { name: /^Delete Harbour copy/ }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: shell.chooser.deleteConfirm })
    .click();
  await expect(names).toHaveText(["Harbour"]);

  // A new project opens at the first step
  await page.getByRole("button", { name: shell.chooser.newProject }).click();
  await expect(page).toHaveURL(/\/build\/start$/);
});

test("the header lists your projects, and the examples wear the one you pick", async ({
  page,
}) => {
  // Make a project with its own brand colour in Studio.
  await page.goto("/build/studio");
  await ready(page);
  const brand = page.getByLabel("Brand colour", { exact: true });
  await brand.fill("#c2410c");
  await brand.blur();

  await page.goto("/components/actions");
  const switcher = page.getByLabel("Showing examples in", { exact: true });
  await expect(
    switcher.locator(`optgroup[label="${shell.examplesGroup}"] option`),
  ).toHaveText(["My design system"]);
  await switcher.selectOption({ label: "My design system" });
  const scope = page.locator("[data-examples-scope]").first();
  await expect
    .poll(() =>
      scope.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--ds-color-brand-600").trim(),
      ),
    )
    .toBe("#c2410c");
  // The chrome stays Base.
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--ds-color-brand-600")
        .trim(),
    ),
  ).not.toBe("#c2410c");
  // A reload keeps the choice without a flash.
  await page.reload();
  await expect(
    page.getByLabel("Showing examples in", { exact: true }),
  ).toHaveValue(/^project:/);
});
