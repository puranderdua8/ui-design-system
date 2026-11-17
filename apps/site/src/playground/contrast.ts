// WCAG contrast on a resolved var map (S33). A port of `scripts/contrast.mjs`: same
// pairs file (`@puranderdua/ui/contrast-pairs.json`), same minimums, same maths, so the
// playground badges agree with `pnpm tokens:check`. A test runs the script and compares.
import type {
  ContrastPairsSpec,
  ContrastReport,
  ContrastResult,
  VarMap,
} from "./types";

const MINIMUMS: Record<string, number> = {
  text: 4.5, // WCAG 1.4.3, normal text
  ui: 3, // WCAG 1.4.11, non-text (focus ring, control boundaries)
};

const varName = (token: string): string => token.replaceAll(".", "-");

const minimum = (min: string, what: string): number => {
  if (!(min in MINIMUMS))
    throw new Error(`contrast-pairs.json: unknown min "${min}" for ${what}`);
  return MINIMUMS[min];
};

const rgb = (hex: string): [number, number, number] => {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!match)
    throw new Error(
      `unsupported color "${hex}" (expected #rgb or #rrggbb; colours with alpha cannot be contrast-checked)`,
    );
  const h =
    match[1].length === 3 ? [...match[1]].map((c) => c + c).join("") : match[1];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = (hex: string): number => {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

type Check = { fg: string; bg: string; min: number; tone: string };

/** Evaluates every pair, tone x role check and scrim strength on `vars`. */
export const evaluateContrast = (
  vars: VarMap,
  spec: ContrastPairsSpec,
): ContrastReport => {
  const checks: Check[] = spec.pairs.map(({ fg, bg, min }) => ({
    fg: varName(fg),
    bg: varName(bg),
    min: minimum(min, fg),
    tone: "",
  }));

  const excluded = new Set(
    (spec.exclusions ?? []).map(({ context, fg }) => `${context}|${fg}`),
  );
  let skipped = 0;
  for (const [name, { surface, surfaceEnd, map }] of Object.entries(
    spec.contexts ?? {},
  )) {
    for (const { fg, bg, min } of spec.roles ?? []) {
      if (excluded.has(`${name}|${fg}`) && !bg) {
        skipped++;
        continue;
      }
      // A role with its own bg (an action fill) does not touch the surface.
      const stops = bg ? [surface] : [surface, surfaceEnd].filter(Boolean);
      stops.forEach((stop, i) =>
        checks.push({
          fg: varName(map[fg] ?? fg),
          bg: varName(bg ? (map[bg] ?? bg) : (stop as string)),
          min: minimum(min, fg),
          tone: i === 0 ? ` in ${name}` : ` in ${name} (end)`,
        }),
      );
    }
  }

  const results: ContrastResult[] = checks.map(({ fg, bg, min, tone }) => {
    const fgValue = String(vars[`--ds-${fg}`] ?? "");
    const bgValue = String(vars[`--ds-${bg}`] ?? "");
    const base = { kind: "pair" as const, fg, bg, fgValue, bgValue, tone, min };
    if (!fgValue || !bgValue)
      return { ...base, ratio: null, ok: false, error: "token missing" };
    try {
      const ratio = contrastRatio(fgValue, bgValue);
      return { ...base, ratio, ok: ratio >= min };
    } catch (error) {
      return {
        ...base,
        ratio: null,
        ok: false,
        error: (error as Error).message,
      };
    }
  });

  // Scrim over media: text on the scrim composited over pure white.
  const { scrim } = spec;
  if (scrim) {
    const text = String(vars[`--ds-${varName(scrim.fg)}`] ?? "");
    const layer = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(
      String(vars["--ds-overlay-scrim"] ?? ""),
    );
    const min = minimum(scrim.min, scrim.fg);
    for (const [strength, opacity] of Object.entries(scrim.strengths)) {
      const base = {
        kind: "scrim" as const,
        fg: varName(scrim.fg),
        bg: `scrim ${strength}`,
        fgValue: text,
        tone: "",
        strength: opacity,
        min,
      };
      if (!text || !layer) {
        results.push({
          ...base,
          bgValue: "",
          ratio: null,
          ok: false,
          error: `needs ${scrim.fg} and an rgba() overlay.scrim`,
        });
        continue;
      }
      const alpha = Number(layer[4]) * opacity;
      const flat = layer
        .slice(1, 4)
        .map((c) => Math.round(Number(c) * alpha + 255 * (1 - alpha)));
      const bgValue = `#${flat.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
      const ratio = contrastRatio(text, bgValue);
      results.push({ ...base, bgValue, ratio, ok: ratio >= min });
    }
  }

  return {
    results,
    failing: results.filter((result) => !result.ok).length,
    skipped,
  };
};
