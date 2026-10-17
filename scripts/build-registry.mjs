// registry.json (template) -> shadcn build -> apps/registry/public/r/v<version>
// and a copy in public/r/latest.
//   {{VERSION}}      packages/ui/package.json
//   {{REGISTRY_URL}} REGISTRY_URL env var, else registry.config.json
// Flags:
//   --no-package-build  skip building @puranderdua/ui (pnpm check already did)
//   --force             overwrite an existing version whose content differs
//                       (versions are served as immutable, so this is deliberate)
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const readJson = (path) =>
  JSON.parse(readFileSync(resolve(root, path), "utf8"));

const { version } = readJson("packages/ui/package.json");
const registryUrl = (
  process.env.REGISTRY_URL ??
  readJson("registry.config.json").url ??
  ""
).replace(/\/+$/, "");
if (!/^https:\/\/[^/]+$/.test(registryUrl)) {
  console.error(
    `registry url must look like https://host (got "${registryUrl}"). Set REGISTRY_URL or registry.config.json.`,
  );
  process.exit(1);
}

if (!args.has("--no-package-build")) {
  run("pnpm", ["--filter", "@puranderdua/ui", "build"]);
}

const work = mkdtempSync(join(tmpdir(), "ds-registry-"));
try {
  const manifest = join(work, "registry.json");
  writeFileSync(
    manifest,
    readFileSync(resolve(root, "registry.json"), "utf8")
      .replaceAll("{{VERSION}}", version)
      .replaceAll("{{REGISTRY_URL}}", registryUrl),
  );
  const built = join(work, "out");
  // shadcn resolves file paths relative to the manifest's folder, so run it
  // from the repo root with absolute output.
  run("pnpm", [
    "exec",
    "shadcn",
    "build",
    manifest,
    "--cwd",
    root,
    "--output",
    built,
  ]);

  const outDir = resolve(root, `apps/registry/public/r/v${version}`);
  if (existsSync(outDir) && !args.has("--force")) {
    const changed = readdirSync(built).filter((f) => {
      const old = join(outDir, f);
      return (
        !existsSync(old) ||
        readFileSync(old, "utf8") !== readFileSync(join(built, f), "utf8")
      );
    });
    if (changed.length) {
      console.error(
        `v${version} is already built and would change (${changed.join(", ")}). Versions are served as immutable: bump the version, or pass --force before it is deployed.`,
      );
      process.exit(1);
    }
  }

  const latest = resolve(root, "apps/registry/public/r/latest");
  mkdirSync(dirname(outDir), { recursive: true });
  rmSync(outDir, { recursive: true, force: true });
  rmSync(latest, { recursive: true, force: true });
  cpSync(built, outDir, { recursive: true });
  cpSync(built, latest, { recursive: true });
  console.log(
    `registry v${version} -> ${registryUrl}/r/v${version}/{name}.json`,
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
