import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// D-128: the chrome always wears Base; only examples wear the chosen look.
const themes = [
  { name: "base", label: "Base", brand600: "#595959", font: /Inter/i },
  { name: "corporate", label: "Corporate", brand600: "#1762b6", font: /Plex/i },
  { name: "nature", label: "Nature", brand600: "#2f7442", font: /Fraunces/i },
  { name: "quirky", label: "Quirky", brand600: "#703dc6", font: /Bricolage/i },
] as const;

const switcher = "Showing examples in";

// Pages with examples; /components (the index) has none, so it only proves the chrome.
const paths = [
  "/components/typography",
  "/components/layout",
  "/components/forms",
  "/components/actions",
  "/components/display",
];

const examples = (page: Page) => page.locator("[data-examples-scope]").first();

const tokenOf = (page: Page, selector: string, name: string) =>
  page.evaluate(
    ([sel, prop]) => {
      const el = document.querySelector(sel as string);
      return el
        ? getComputedStyle(el)
            .getPropertyValue(prop as string)
            .trim()
            .toLowerCase()
        : null;
    },
    [selector, name],
  );

const chrome = (page: Page, name: string) => tokenOf(page, "html", name);
const inExamples = (page: Page, name: string) =>
  tokenOf(page, "[data-examples-scope]", name);

const chooseTheme = async (page: Page, label: string) => {
  await page.getByRole("combobox", { name: switcher }).selectOption({ label });
};

test.describe("axe on every showcase page in every look", () => {
  for (const theme of themes) {
    for (const path of ["/components", ...paths]) {
      test(`${theme.name} ${path}`, async ({ page }) => {
        // Seed only the choice: the switcher imports the map on mount.
        await page.addInitScript((name) => {
          window.localStorage.setItem("ds-theme", JSON.stringify({ name }));
        }, theme.name);
        await page.goto(path);
        await expect(
          page.getByRole("combobox", { name: switcher }),
        ).toHaveValue(theme.name);
        if (path !== "/components") {
          await expect(examples(page)).toHaveAttribute(
            "data-ds-theme",
            theme.name,
          );
          await expect
            .poll(() => inExamples(page, "--ds-color-brand-600"))
            .toBe(theme.brand600);
        }
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("showing examples in", () => {
  test("a look changes the examples and never the chrome", async ({ page }) => {
    await page.goto("/components/typography");
    await expect(page.locator("html")).not.toHaveAttribute("data-ds-theme");
    expect(await inExamples(page, "--ds-color-brand-600")).toBe("#595959");

    for (const theme of themes.slice(1)) {
      await chooseTheme(page, theme.label);
      await expect
        .poll(() => inExamples(page, "--ds-color-brand-600"))
        .toBe(theme.brand600);
      // The chrome keeps Base: the page heading and <html> are untouched.
      expect(await chrome(page, "--ds-color-brand-600")).toBe("#595959");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
        "font-family",
        /Inter/i,
      );
      await expect
        .poll(() => page.evaluate(() => document.documentElement.style.length))
        .toBe(0);
      await expect(examples(page).getByRole("heading").first()).toHaveCSS(
        "font-family",
        theme.font,
      );
    }

    // Back to Base clears the scope's inline vars.
    await chooseTheme(page, "Base");
    await expect
      .poll(() => inExamples(page, "--ds-color-brand-600"))
      .toBe("#595959");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.querySelector<HTMLElement>("[data-examples-scope]")!.style
              .length,
        ),
      )
      .toBeLessThanOrEqual(1); // colorScheme only
  });

  test("the home page chrome stays Base while a look is chosen", async ({
    page,
  }) => {
    await page.goto("/");
    const primary = page.getByRole("link", { name: /^Get in touch/ });
    await expect(primary).toHaveCSS("background-color", "rgb(89, 89, 89)");
    await chooseTheme(page, "Nature");
    await expect(page.getByRole("combobox", { name: switcher })).toHaveValue(
      "nature",
    );
    await expect(primary).toHaveCSS("background-color", "rgb(89, 89, 89)");
  });

  test("a button in an example follows the look", async ({ page }) => {
    await page.goto("/components/actions");
    const primary = examples(page).getByRole("button").first();
    await expect(primary).toHaveCSS("background-color", "rgb(89, 89, 89)");
    await chooseTheme(page, "Nature");
    await expect(primary).toHaveCSS("background-color", "rgb(47, 116, 66)");
  });

  test("the choice survives a reload and is applied before first paint", async ({
    page,
  }) => {
    // Record the look on the first examples scope the moment it enters the document,
    // before React hydrates: only the head script's style rule can supply it then.
    await page.addInitScript(() => {
      const w = window as unknown as { __brandAtScope?: string };
      const observer = new MutationObserver(() => {
        const scope = document.querySelector("[data-examples-scope]");
        if (scope && w.__brandAtScope === undefined) {
          w.__brandAtScope = getComputedStyle(scope)
            .getPropertyValue("--ds-color-brand-600")
            .trim()
            .toLowerCase();
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    await page.goto("/components/forms");
    await chooseTheme(page, "Quirky");
    await expect
      .poll(() => inExamples(page, "--ds-color-brand-600"))
      .toBe("#703dc6");

    const cached = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("ds-theme") ?? "null"),
    );
    expect(cached.name).toBe("quirky");
    expect(cached.vars["--ds-color-brand-600"]).toBe("#703dc6");

    await page.reload();
    expect(
      await page.evaluate(
        () => (window as unknown as { __brandAtScope?: string }).__brandAtScope,
      ),
    ).toBe("#703dc6");
    await expect
      .poll(() => inExamples(page, "--ds-color-brand-600"))
      .toBe("#703dc6");
    await expect(page.getByRole("combobox", { name: switcher })).toHaveValue(
      "quirky",
    );
    expect(await chrome(page, "--ds-color-brand-600")).toBe("#595959");

    // A second page keeps it too.
    await page.goto("/components/display");
    await expect(examples(page)).toHaveAttribute("data-ds-theme", "quirky");
  });

  test("a stored value that tries to break out of the style rule is ignored", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "ds-theme",
        JSON.stringify({
          name: "nature",
          vars: {
            "--ds-color-brand-600": "red; } body { display: none } :root {",
            "--ds-color-brand-700": "#123456",
          },
        }),
      );
    });
    await page.goto("/components/actions");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("display", "none");
  });

  test("a non-default look's font file is requested only once it is chosen", async ({
    page,
  }) => {
    const fonts: string[] = [];
    page.on("response", (res) => {
      if (/\.woff2?(\?|$)/.test(res.url())) fonts.push(res.url());
    });
    await page.goto("/components/typography");
    await page.evaluate(() => document.fonts.ready);
    const before = fonts.length;
    await chooseTheme(page, "Nature");
    await expect(examples(page).getByRole("heading").first()).toHaveCSS(
      "font-family",
      /Fraunces/i,
    );
    await expect.poll(() => fonts.length).toBeGreaterThan(before);
  });
});
