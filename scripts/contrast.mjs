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
const { pairs } = JSON.parse(
  readFileSync(join(root, "tokens/contrast-pairs.json"), "utf8"),
);
const PAIRS = pairs.map(({ fg, bg, min }) => {
  if (!(min in MINIMUMS))
    throw new Error(`contrast-pairs.json: unknown min "${min}" for ${fg}`);
  return [fg.replaceAll(".", "-"), bg.replaceAll(".", "-"), MINIMUMS[min]];
});

function rgb(hex) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
  if (!m)
    throw new Error(`unsupported color "${hex}" (expected #rgb or #rrggbb)`);
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
  for (const [fg, bg, min] of PAIRS) {
    const f = vars[`--ds-${fg}`];
    const b = vars[`--ds-${bg}`];
    if (!f || !b) {
      console.error(`FAIL [${theme}] ${fg} on ${bg}: token missing`);
      themeFailed++;
      continue;
    }
    let r;
    try {
      r = ratio(f, b);
    } catch (e) {
      console.error(`FAIL [${theme}] ${fg} on ${bg}: ${e.message}`);
      themeFailed++;
      continue;
    }
    const ok = r >= min;
    if (!ok) themeFailed++;
    console.log(
      `${ok ? "ok  " : "FAIL"} [${theme}] ${fg} (${f}) on ${bg} (${b}) = ${r.toFixed(2)}:1 (min ${min}:1)`,
    );
  }
  if (themeFailed)
    console.error(
      `contrast [${theme}]: ${themeFailed} pair(s) below their minimum`,
    );
  else
    console.log(
      `contrast [${theme}]: all ${PAIRS.length} pairs meet their minimum`,
    );
  failed += themeFailed;
}
if (failed) process.exit(1);
