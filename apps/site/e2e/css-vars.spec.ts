// The "Any site" CSS (S49) parsed and applied by a real browser on a plain HTML page: no
// package, no framework, no site. The CSS is built by the format function from a theme
// the person changed.
import { expect, test } from "@playwright/test";
import { themeMaps } from "../src/playground/data";
import { resolveState } from "../src/playground/engine";
import { toCssVars } from "../src/playground/formats/css-vars";

const theme = resolveState(
  {
    start: "nature",
    mode: "light",
    dims: {},
    fonts: {},
    knobs: { brand: "#7a1fa2", radiusScale: 1.5 },
    overrides: {},
  },
  themeMaps,
);

test("the exported CSS applies to a plain HTML page", async ({ page }) => {
  const css = toCssVars(theme);
  await page.setContent(
    `<!doctype html><html><head><style>${css}
      button { background: var(--ds-action-primary-bg); color: var(--ds-action-primary-fg);
        border-radius: var(--ds-radius-control); border: 0; }
    </style></head><body><button id="go">Go</button></body></html>`,
  );
  const result = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const button = getComputedStyle(document.getElementById("go")!);
    return {
      brand: root.getPropertyValue("--ds-color-brand-600").trim(),
      background: button.backgroundColor,
      radius: button.borderTopLeftRadius,
    };
  });
  // Every var in the file was read back by the browser.
  const count = await page.evaluate(
    (names) =>
      names.filter((n) =>
        getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      ).length,
    Object.keys(theme.vars),
  );
  expect(count).toBe(Object.keys(theme.vars).length);
  expect(result.brand).toBe("#7a1fa2");
  // The button took the role colour, which resolves to the brand shade.
  expect(result.background).toBe(
    `rgb(${[1, 3, 5].map((i) => parseInt(String(theme.vars["--ds-action-primary-bg"]).slice(i, i + 2), 16)).join(", ")})`,
  );
  expect(result.radius).not.toBe("0px");
});
