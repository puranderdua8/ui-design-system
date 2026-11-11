// Client boundary check (H3, F01, D-070).
//
// A module that starts with "use client" turns every export into a client
// reference when a Server Component imports it. Calling a variants function or
// reading a class string from there fails at build time. So every export of a
// built `"use client"` file must be a component (PascalCase) or a hook
// (`use…`); variants, class strings and other values belong in a plain
// `<name>.styles.ts`.
//
// Usage: node scripts/check-client-exports.mjs [distDir]
// Default distDir: packages/ui/dist. Run after `pnpm build`.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(process.argv[2] ?? join(root, "packages/ui/dist"));

const isComponent = (name) => /^[A-Z][A-Za-z0-9]*$/.test(name);
const isHook = (name) => /^use[A-Z][A-Za-z0-9]*$/.test(name);

/** Names exported by an esbuild ESM output file. */
export const exportedNames = (code) => {
  const names = [];
  for (const m of code.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const part of m[1].split(",")) {
      const item = part.trim();
      if (!item) continue;
      const asMatch = item.match(/\bas\s+(\S+)$/);
      names.push(asMatch ? asMatch[1] : item);
    }
  }
  for (const m of code.matchAll(
    /^export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([A-Za-z_$][\w$]*)/gm,
  )) {
    names.push(m[1]);
  }
  if (/^export\s+default\b/m.test(code)) names.push("default");
  return names;
};

const hasDirective = (code) =>
  /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["']/.test(code);

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(dir, entry.name))
      : entry.name.endsWith(".js")
        ? [join(dir, entry.name)]
        : [],
  );

if (!existsSync(dist)) {
  console.error(`check-client-exports: ${dist} not found. Run pnpm build.`);
  process.exit(1);
}

const problems = [];
let clientFiles = 0;
for (const file of files(dist)) {
  const code = readFileSync(file, "utf8");
  if (!hasDirective(code)) continue;
  clientFiles += 1;
  for (const name of exportedNames(code)) {
    if (!isComponent(name) && !isHook(name)) {
      problems.push(
        `${file.slice(dist.length + 1)} exports "${name}" from a "use client" file; move values into a plain <name>.styles.ts`,
      );
    }
  }
}

if (clientFiles === 0) {
  console.error('check-client-exports: no "use client" files found in dist.');
  process.exit(1);
}
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `check-client-exports: ${clientFiles} client files export only components and hooks.`,
);
