// Fails if the playground's production CSS is missing any class it uses.
import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const assets = resolve(dirname(fileURLToPath(import.meta.url)), "dist/assets");
const file = readdirSync(assets).find((f) => f.endsWith(".css"));
if (!file) {
  console.error("No built CSS found in playground/dist/assets.");
  process.exit(1);
}
const css = readFileSync(resolve(assets, file), "utf8");

const roles = ["display", "h1", "h2", "h3", "body", "lead", "caption", "label"];
const classes = [
  ...roles.flatMap((r) => [`.ds-type-${r}`, `.text-ds-${r}`]),
  ".font-ds-heading",
  ".font-ds-body",
  ".text-ds-control-sm",
  ".text-ds-control-md",
  ".ds-focus-ring:focus-visible",
  ".h-ds-control-sm",
  ".h-ds-control-md",
  ".px-ds-control-px-sm",
  ".px-ds-control-px-md",
  ".rounded-ds-control",
  ".bg-ds-canvas",
  ".text-ds-text",
  ".text-ds-text-muted",
  ".text-ds-text-inverse",
  ".border-ds-border",
  ".bg-ds-primary",
  ".text-ds-primary-fg",
  ".bg-ds-primary-hover",
  ".bg-ds-primary-active",
  ".bg-ds-secondary",
  ".text-ds-secondary-fg",
  ".border-ds-secondary-border",
  ".bg-ds-secondary-hover",
  ".bg-ds-secondary-active",
  ".bg-ds-disabled",
  ".text-ds-disabled-fg",
  ".border-ds-disabled-border",
  // S15: colour roles
  ".bg-ds-surface-subtle",
  ".bg-ds-surface-raised",
  ".bg-ds-surface-inverse",
  ".bg-ds-surface-brand",
  ".text-ds-link",
  ".hover:text-ds-link-hover",
  ".text-ds-on-brand",
  ".border-ds-border-strong",
  ".border-ds-border-control",
  ".bg-ds-input",
  ".border-ds-input-border",
  ".hover:border-ds-input-border-hover",
  ".placeholder:text-ds-placeholder",
  ".text-ds-danger-fg",
  ".border-ds-danger-border",
  ".bg-ds-danger-bg",
  ".bg-ds-scrim",
  // S15: shape, elevation, motion
  ".rounded-ds-card",
  ".rounded-ds-pill",
  ".ds-border",
  ".ds-border-strong",
  ".shadow-ds-raised",
  ".hover:shadow-ds-overlay",
  ".ds-transition",
  ".ds-transition-fast",
  ".ease-ds-standard",
  // S15: layout
  ".gap-ds-gap-xs",
  ".gap-ds-gap-sm",
  ".gap-ds-gap-md",
  ".gap-ds-gap-lg",
  ".gap-ds-gap-xl",
  ".py-ds-section-sm",
  ".py-ds-section-md",
  ".py-ds-section-lg",
  ".px-ds-gutter",
  ".w-ds-sidebar",
  ".max-w-ds-sm",
  ".max-w-ds-md",
  ".max-w-ds-lg",
  ".max-w-ds-xl",
];
// Hover/active variants are emitted with an escaped prefix, e.g. .hover\:bg-ds-primary-hover
const missing = classes.filter((c) => {
  const name = c.slice(1).replace(/:focus-visible$/, "");
  return !css.includes(c) && !css.includes(name.replace(":", "\\:"));
});
const raw = ["--ds-action-primary-bg", "--ds-type-h1-font-size"].filter(
  (v) => !css.includes(v),
);
if (missing.length || raw.length) {
  console.error("Missing from built CSS:", [...missing, ...raw].join(", "));
  process.exit(1);
}
console.log(`playground CSS ok: ${classes.length} classes present in ${file}`);
