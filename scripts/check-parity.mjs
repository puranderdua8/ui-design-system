// CI: every file in the built registry (v<version> and latest) must be
// byte-identical to its source in the repo, including
// packages/ui/dist/foundations.css, and every file must have a flat,
// predictable install target.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));
const { version } = readJson("packages/ui/package.json");
const { items } = readJson("registry.json");

const errors = [];
for (const item of items) {
  for (const file of item.files) {
    const target = file.target ?? "";
    if (
      file.type === "registry:ui" &&
      !/^components\/ui\/[^/]+$/.test(target)
    ) {
      errors.push(
        `${item.name}: ${file.path} needs a flat target components/ui/<file>, got "${target}"`,
      );
    }
    if (
      file.type === "registry:lib" &&
      !/^lib\/(generated\/)?[^/]+$/.test(target)
    ) {
      errors.push(
        `${item.name}: ${file.path} has unexpected lib target "${target}"`,
      );
    }
    if (file.type === "registry:file" && !target) {
      errors.push(`${item.name}: ${file.path} needs a target`);
    }
    const source = readFileSync(resolve(root, file.path), "utf8");
    for (const dir of [`v${version}`, "latest"]) {
      const built = readJson(`apps/registry/public/r/${dir}/${item.name}.json`);
      const out = built.files.find(
        (f) => f.target === file.target || f.path === file.path,
      );
      if (!out) {
        errors.push(`r/${dir}/${item.name}.json is missing ${file.path}`);
      } else if (out.content !== source) {
        errors.push(
          `r/${dir}/${item.name}.json: ${file.path} differs from source`,
        );
      }
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `parity ok: ${items.length} items match their sources (v${version}, latest)`,
);
