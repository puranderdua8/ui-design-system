// CI: the registry's foundations content must equal packages/ui/dist/foundations.css.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(
  readFileSync(resolve(root, "packages/ui/package.json"), "utf8"),
);
const source = readFileSync(
  resolve(root, "packages/ui/dist/foundations.css"),
  "utf8",
);
let failed = false;
for (const dir of [`v${version}`, "latest"]) {
  const item = JSON.parse(
    readFileSync(
      resolve(root, `apps/registry/public/r/${dir}/ds-foundations.json`),
      "utf8",
    ),
  );
  const content = item.files?.[0]?.content;
  if (content !== source) {
    console.error(
      `parity: r/${dir}/ds-foundations.json differs from dist/foundations.css`,
    );
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(
  `parity ok: registry foundations == dist/foundations.css (v${version})`,
);
