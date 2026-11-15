// The one build entry for packages/ui (R14). The steps are order-dependent:
// build-classes writes src/lib/generated/ds-classes.ts, which tsup bundles;
// tsup cleans dist, so build-foundations (CSS, themes) must run after it.
// Run from packages/ui (`pnpm build`).
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scripts = dirname(fileURLToPath(import.meta.url));
const steps = [
  ["node", [resolve(scripts, "build-classes.mjs")]],
  ["pnpm", ["exec", "tsup"]],
  ["node", [resolve(scripts, "build-foundations.mjs")]],
];

for (const [cmd, args] of steps) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`build-ui: "${cmd} ${args.join(" ")}" failed.`);
    process.exit(result.status ?? 1);
  }
}
