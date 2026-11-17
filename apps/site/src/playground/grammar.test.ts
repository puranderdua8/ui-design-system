import { describe, expect, it } from "vitest";
import { themeMaps } from "./data";
import { resolveTheme } from "./engine";
import { exportTheme } from "./export";
import {
  UnsafeValueError,
  parseOverride,
  parseValue,
  safeValue,
  tokenType,
} from "./grammar";
import { toCss, toDtcg } from "./output";
import { parseState, serialiseState, startFrom } from "./state";

const injection = "red; } body { display: none } :root {";
const hostile = [
  injection,
  "#fff;}",
  "url(https://example.com/x.png)",
  "#fff url(x)",
  "@import 'x.css'",
  "</style><script>alert(1)</script>",
  "red /* c */",
  "#12345",
  "expression(alert(1))",
  "var(--ds-color-red-600)",
  "\\72 ed",
  "1rem\n}",
  "",
];

describe("value grammar", () => {
  it("accepts the forms the themes hold and canonicalises them", () => {
    expect(parseValue("colour", "#ABC")).toBe("#aabbcc");
    expect(parseValue("colour", "#0D0F121A")).toBe("#0d0f121a");
    expect(parseValue("colour", "rgba(13, 15, 18, 0.7)")).toBe(
      "rgba(13, 15, 18, 0.7)",
    );
    expect(parseValue("dimension", "0.25rem")).toBe("0.25rem");
    expect(parseValue("dimension", "-0.02em")).toBe("-0.02em");
    expect(parseValue("duration", "200ms")).toBe("200ms");
    expect(parseValue("easing", "cubic-bezier(0.4, 0, 0.2, 1)")).toBe(
      "cubic-bezier(0.4, 0, 0.2, 1)",
    );
    expect(parseValue("shadow", "0px 1px 3px 0px #0D0F121A")).toBe(
      "0px 1px 3px 0px #0d0f121a",
    );
    expect(
      parseValue("fontFamily", "'IBM Plex Sans', system-ui, sans-serif"),
    ).toBe("'IBM Plex Sans', system-ui, sans-serif");
    expect(parseValue("number", "1.50")).toBe("1.5");
    expect(parseValue("number", 400)).toBe("400");
    expect(parseValue("alias", "--ds-color-brand-600")).toBe(
      "--ds-color-brand-600",
    );
  });

  it("refuses values outside each type", () => {
    expect(parseValue("colour", "rgba(300, 0, 0, 1)")).toBeNull();
    expect(parseValue("colour", "red")).toBeNull();
    expect(parseValue("dimension", "1vw")).toBeNull();
    expect(parseValue("dimension", "1")).toBeNull();
    expect(parseValue("duration", "-5ms")).toBeNull();
    expect(parseValue("easing", "cubic-bezier(2, 0, 0.2, 1)")).toBeNull();
    expect(parseValue("shadow", "0px 1px 3px 0px red")).toBeNull();
    expect(parseValue("shadow", "0px 1px -3px 0px #000000")).toBeNull();
    expect(parseValue("fontFamily", "Inter; color: red")).toBeNull();
    expect(parseValue("fontFamily", "a,b,c,d,e,f,g,h,i")).toBeNull();
    expect(parseValue("number", "1e3")).toBeNull();
    expect(parseValue("alias", "--ds-a;b")).toBeNull();
    expect(parseValue("colour", { toString: () => "#fff" })).toBeNull();
  });

  it.each(hostile)("refuses %j for every type", (value) => {
    for (const type of [
      "colour",
      "dimension",
      "duration",
      "easing",
      "shadow",
      "fontFamily",
      "number",
      "alias",
    ] as const)
      expect(parseValue(type, value)).toBeNull();
  });

  it("refuses oversized input", () => {
    expect(parseValue("fontFamily", "a".repeat(5000))).toBeNull();
    expect(parseValue("colour", `#fff${" ".repeat(500)}`)).toBeNull();
  });

  it("types every token of the Base theme", () => {
    for (const key of Object.keys(themeMaps.base.vars))
      expect(tokenType(key), key).not.toBeNull();
    expect(tokenType("--ds-action-primary-bg")).toBe("colour");
    expect(tokenType("--ds-radius-card")).toBe("dimension");
    expect(tokenType("--ds-motion-duration-fast")).toBe("duration");
    expect(tokenType("--ds-font-weight-medium")).toBe("number");
    expect(tokenType("--ds-not-a-token")).toBeNull();
  });
});

describe("parseState with untrusted overrides", () => {
  const withOverrides = (overrides: Record<string, unknown>) =>
    parseState({ ...serialiseState(startFrom("base")), overrides });

  it("keeps good overrides, and drops the rest", () => {
    const state = withOverrides({
      "--ds-action-primary-bg": "#112233",
      "--ds-surface-canvas": "--ds-color-neutral-50",
      "--ds-text-primary": injection,
      "--ds-radius-card": "url(x)",
      "--ds-surface-raised": "--ds-not-a-token",
      "--ds-unknown-token": "#fff",
      "not-a-var": "#fff",
    });
    expect(state?.overrides).toEqual({
      "--ds-action-primary-bg": "#112233",
      "--ds-surface-canvas": "--ds-color-neutral-50",
    });
  });

  it.each(hostile)("drops %j as a value", (value) => {
    expect(
      withOverrides({ "--ds-action-primary-bg": value })?.overrides,
    ).toEqual({});
  });

  it("still loads states stored before the grammar (version 0, 1 and 2)", () => {
    const old = {
      start: "corporate",
      knobs: { brand: "#1762b6", radiusScale: 1.5 },
      overrides: { "--ds-action-primary-bg": "#112233" },
    };
    for (const version of [undefined, 1, 2]) {
      const state = parseState({ ...old, version });
      expect(state?.start).toBe("corporate");
      expect(state?.knobs).toEqual(old.knobs);
      expect(state?.overrides).toEqual(old.overrides);
    }
  });
});

describe("exports refuse a value that does not parse", () => {
  const poisoned = (key: string) =>
    resolveTheme(themeMaps.base, {}, { [key]: injection });

  it("never writes the planted injection", () => {
    // A state read from outside never gets here: the grammar drops the override.
    const state = parseState({
      ...serialiseState(startFrom("base")),
      overrides: { "--ds-action-primary-bg": injection },
    })!;
    const clean = exportTheme(
      resolveTheme(themeMaps.base, {}, state.overrides),
    );
    for (const file of clean.files) {
      expect(file.content).not.toContain("display: none");
      expect(file.content).not.toContain(injection);
    }
  });

  it("toCss throws when a value reaches it that bypassed the grammar", () => {
    for (const key of [
      "--ds-action-primary-bg", // a semantic literal
      "--ds-color-brand-600", // a primitive
      "--ds-radius-card",
      "--ds-shadow-sm",
    ]) {
      const theme = poisoned(key);
      expect(() => toCss(theme), key).toThrow(UnsafeValueError);
      expect(() => exportTheme(theme), key).toThrow(UnsafeValueError);
    }
  });

  it("toDtcg throws for a primitive that does not parse", () => {
    expect(() => toDtcg(poisoned("--ds-space-4"))).toThrow(UnsafeValueError);
  });

  it("toCss refuses a tampered alias target", () => {
    const theme = resolveTheme(themeMaps.base);
    const key = Object.keys(theme.refs)[0]!;
    expect(() =>
      toCss({ ...theme, refs: { ...theme.refs, [key]: "x; } a {" } }),
    ).toThrow(UnsafeValueError);
  });

  it("safeValue refuses an unknown key", () => {
    expect(() => safeValue("--ds-nope", "#fff")).toThrow(UnsafeValueError);
    expect(parseOverride("--ds-nope", "#fff")).toBeNull();
  });

  it("every shipped look still exports", () => {
    for (const name of ["base", "corporate", "nature", "quirky"] as const)
      expect(() => exportTheme(resolveTheme(themeMaps[name]))).not.toThrow();
  });
});
