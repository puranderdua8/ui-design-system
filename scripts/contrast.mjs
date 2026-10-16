// WCAG AA (4.5:1 normal text) contrast check on resolved semantic colors.
// Reads packages/ui/src/styles/generated/tokens.json (run tokens:build first).
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const flatPath =
  process.argv[2] ?? join(root, "packages/ui/src/styles/generated/tokens.json");
const MIN = 4.5;

// [foreground, background] semantic token names (without the --ds- prefix).
const PAIRS = [
  ["text-primary", "surface-canvas"],
  ["text-muted", "surface-canvas"],
  ["action-primary-fg", "action-primary-bg"],
  ["action-primary-fg", "action-primary-bg-hover"],
  ["action-primary-fg", "action-primary-bg-active"],
  ["action-secondary-fg", "action-secondary-bg"],
  ["action-secondary-fg", "action-secondary-bg-hover"],
  ["action-secondary-fg", "action-secondary-bg-active"],
];

const flat = JSON.parse(readFileSync(flatPath, "utf8"));

function rgb(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`unsupported color "${hex}" (expected #rrggbb)`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex) {
  const [r, g, b] = rgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = 0;
for (const [fg, bg] of PAIRS) {
  const f = flat[`ds-${fg}`];
  const b = flat[`ds-${bg}`];
  if (!f || !b) {
    console.error(`FAIL ${fg} on ${bg}: token missing`);
    failed++;
    continue;
  }
  const r = ratio(f, b);
  const ok = r >= MIN;
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${fg} (${f}) on ${bg} (${b}) = ${r.toFixed(2)}:1`,
  );
}
if (failed) {
  console.error(`contrast: ${failed} pair(s) below ${MIN}:1`);
  process.exit(1);
}
console.log(`contrast: all ${PAIRS.length} pairs >= ${MIN}:1`);
