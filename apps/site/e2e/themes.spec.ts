import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const themes = [
  { name: "base", label: "Base", brand600: "#595959", font: /Inter/i },
  { name: "corporate", label: "Corporate", brand600: "#1762b6", font: /Plex/i },
  { name: "nature", label: "Nature", brand600: "#2f7442", font: /Fraunces/i },
  { name: "quirky", label: "Quirky", brand600: "#703dc6", font: /Bricolage/i },
] as const;

const paths = [
  "/components",
  "/components/typography",
  "/components/layout",
  "/components/forms",
  "/components/actions",
  "/components/display",
];

const token = (page: Page, name: string) =>
  page.evaluate(
    (prop) =>
      getComputedStyle(document.documentElement)
        .getPropertyValue(prop)
        .trim()
        .toLowerCase(),
    name,
  );

const chooseTheme = async (page: Page, label: string) => {
  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: label, exact: true }).click();
};

test.describe("axe on every showcase page in every theme", () => {
  for (const theme of themes) {
    for (const path of paths) {
      test(`${theme.name} ${path}`, async ({ page }) => {
        // Seed only the choice: the switcher imports the theme map on mount.
        await page.addInitScript((name) => {
          window.localStorage.setItem("ds-theme", JSON.stringify({ name }));
        }, theme.name);
        await page.goto(path);
        await expect(page.locator("html")).toHaveAttribute(
          "data-ds-theme",
          theme.name,
        );
        await expect
          .poll(() => token(page, "--ds-color-brand-600"))
          .toBe(theme.brand600);
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe("theme switcher", () => {
  test("switching updates a known token and the heading font", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-ds-theme", "base");
    expect(await token(page, "--ds-color-brand-600")).toBe("#595959");

    for (const theme of themes.slice(1)) {
      await chooseTheme(page, theme.label);
      await expect(page.locator("html")).toHaveAttribute(
        "data-ds-theme",
        theme.name,
      );
      await expect
        .poll(() => token(page, "--ds-color-brand-600"))
        .toBe(theme.brand600);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
        "font-family",
        theme.font,
      );
    }

    // Back to Base clears every inline var.
    await chooseTheme(page, "Base");
    await expect
      .poll(() => token(page, "--ds-color-brand-600"))
      .toBe("#595959");
    expect(
      await page.evaluate(() => document.documentElement.style.length),
    ).toBe(0);
  });

  test("the primary button follows the theme", async ({ page }) => {
    await page.goto("/");
    // The primary Button (rendered as the "Get in touch" link) uses the primary role.
    const primary = page.getByRole("link", { name: /^Get in touch/ });
    await expect(primary).toHaveCSS("background-color", "rgb(89, 89, 89)");
    await chooseTheme(page, "Nature");
    await expect(primary).toHaveCSS("background-color", "rgb(47, 116, 66)");
  });

  test("the choice survives a reload and is applied before first paint", async ({
    page,
  }) => {
    // Record <html>'s theme at the moment <body> is created. The inline head script
    // runs before that, and nothing else sets the attribute before hydration.
    await page.addInitScript(() => {
      const w = window as unknown as { __themeAtBody?: string | null };
      const observer = new MutationObserver(() => {
        if (document.body && w.__themeAtBody === undefined) {
          w.__themeAtBody =
            document.documentElement.getAttribute("data-ds-theme");
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    await page.goto("/components/forms");
    await chooseTheme(page, "Quirky");
    await expect
      .poll(() => token(page, "--ds-color-brand-600"))
      .toBe("#703dc6");

    const cached = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("ds-theme") ?? "null"),
    );
    expect(cached.name).toBe("quirky");
    expect(cached.vars["--ds-color-brand-600"]).toBe("#703dc6");

    await page.reload();
    expect(
      await page.evaluate(
        () => (window as unknown as { __themeAtBody?: string }).__themeAtBody,
      ),
    ).toBe("quirky");
    expect(await token(page, "--ds-color-brand-600")).toBe("#703dc6");
    await expect(page.getByRole("combobox", { name: "Theme" })).toContainText(
      "Quirky",
    );

    // A second page keeps it too.
    await page.goto("/components/display");
    await expect(page.locator("html")).toHaveAttribute(
      "data-ds-theme",
      "quirky",
    );
  });

  test("a non-default theme's font file is requested only once it is chosen", async ({
    page,
  }) => {
    const fonts: string[] = [];
    page.on("response", (res) => {
      if (/\.woff2?(\?|$)/.test(res.url())) fonts.push(res.url());
    });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const before = fonts.length;
    await chooseTheme(page, "Nature");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "font-family",
      /Fraunces/i,
    );
    await expect.poll(() => fonts.length).toBeGreaterThan(before);
  });
});
