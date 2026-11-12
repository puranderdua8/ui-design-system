// WCAG AA contrast check on resolved semantic colors (4.5:1 text, 3:1 non-text).
// Runs once per theme on the resolved var map (`vars` in themes/<name>.json).
// Usage: node scripts/contrast.mjs [themes/<name>.json ...]
// Default: every theme in packages/ui/src/styles/generated/themes
// (run tokens:build first).
import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themesDir = join(root, "packages/ui/src/styles/generated/themes");
const themePaths =
  process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(themesDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .map((f) => join(themesDir, f));
const MINIMUMS = {
  text: 4.5, // WCAG 1.4.3, normal text
  ui: 3, // WCAG 1.4.11, non-text (focus ring, control boundaries)
};

// [foreground, background, minimum] as var names without --ds-
// (text.on-brand -> text-on-brand). The pairs, and what is left out on
// purpose, live in tokens/contrast-pairs.json.
const { pairs, contexts, roles, exclusions, scrim } = JSON.parse(
  readFileSync(join(root, "tokens/contrast-pairs.json"), "utf8"),
);
const varName = (token) => token.replaceAll(".", "-");
const minimum = (min, what) => {
  if (!(min in MINIMUMS))
    throw new Error(`contrast-pairs.json: unknown min "${min}" for ${what}`);
  return MINIMUMS[min];
};
const PAIRS = pairs.map(({ fg, bg, min }) => [
  varName(fg),
  varName(bg),
  minimum(min, fg),
  "",
]);

// Tone matrix: every context (a surface plus the role replacements inside it)
// x every role. A role's fg, and its bg when it has one, go through the
// context's map first; without a bg the role sits on the tone surface.
const excluded = new Set(
  (exclusions ?? []).map(({ context, fg }) => `${context}|${fg}`),
);
let skipped = 0;
// A context with `surfaceEnd` paints a gradient (surface -> surfaceEnd): the
// roles that sit on the surface are checked against both stops.
for (const [name, { surface, surfaceEnd, map }] of Object.entries(
  contexts ?? {},
))
  for (const { fg, bg, min } of roles ?? []) {
    if (excluded.has(`${name}|${fg}`) && !bg) {
      skipped++;
      continue;
    }
    // A role with its own bg (an action fill) does not touch the surface.
    const stops = bg ? [surface] : [surface, surfaceEnd].filter(Boolean);
    stops.forEach((stop, i) =>
      PAIRS.push([
        varName(map[fg] ?? fg),
        varName(bg ? (map[bg] ?? bg) : stop),
        minimum(min, fg),
        i === 0 ? ` in ${name}` : ` in ${name} (end)`,
      ]),
    );
  }

function rgb(hex) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!m)
    throw new Error(
      `unsupported color "${hex}" (expected #rgb or #rrggbb; colours with alpha cannot be contrast-checked)`,
    );
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join("") : m[1];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = 0;
for (const path of themePaths) {
  const theme = basename(path, ".json");
  const { vars } = JSON.parse(readFileSync(path, "utf8"));
  let themeFailed = 0;
  for (const [fg, bg, min, tone] of PAIRS) {
    const f = vars[`--ds-${fg}`];
    const b = vars[`--ds-${bg}`];
    if (!f || !b) {
      console.error(`FAIL [${theme}] ${fg} on ${bg}${tone}: token missing`);
      themeFailed++;
      continue;
    }
    let r;
    try {
      r = ratio(f, b);
    } catch (e) {
      console.error(`FAIL [${theme}] ${fg} on ${bg}${tone}: ${e.message}`);
      themeFailed++;
      continue;
    }
    const ok = r >= min;
    if (!ok) themeFailed++;
    console.log(
      `${ok ? "ok  " : "FAIL"} [${theme}] ${fg} (${f}) on ${bg} (${b})${tone} = ${r.toFixed(2)}:1 (min ${min}:1)`,
    );
  }
  // Scrim over media: text on the scrim composited over pure white.
  if (scrim) {
    const text = vars[`--ds-${varName(scrim.fg)}`];
    // The build resolves alpha colours to rgba(r, g, b, a).
    const layer = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(
      vars["--ds-overlay-scrim"] ?? "",
    );
    for (const [strength, opacity] of Object.entries(scrim.strengths)) {
      if (!text || !layer) {
        console.error(
          `FAIL [${theme}] scrim ${strength}: needs ${scrim.fg} and an rgba() overlay.scrim`,
        );
        themeFailed++;
        continue;
      }
      const alpha = Number(layer[4]) * opacity;
      const flat = layer
        .slice(1, 4)
        .map((c) => Math.round(Number(c) * alpha + 255 * (1 - alpha)));
      const r = ratio(
        text,
        `#${flat.map((c) => c.toString(16).padStart(2, "0")).join("")}`,
      );
      const ok = r >= minimum(scrim.min, scrim.fg);
      if (!ok) themeFailed++;
      console.log(
        `${ok ? "ok  " : "FAIL"} [${theme}] ${scrim.fg} on scrim ${strength} (strength ${opacity}) over white = ${r.toFixed(2)}:1 (min ${minimum(scrim.min, scrim.fg)}:1)`,
      );
    }
  }
  if (themeFailed)
    console.error(
      `contrast [${theme}]: ${themeFailed} pair(s) below their minimum`,
    );
  else
    console.log(
      `contrast [${theme}]: all ${PAIRS.length} pairs meet their minimum (${skipped} tone x role checks excluded on purpose, see contrast-pairs.json)`,
    );
  failed += themeFailed;
}
if (failed) process.exit(1);
