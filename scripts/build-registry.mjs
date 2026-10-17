// registry.json (template) -> shadcn build -> apps/registry/public/r/v<version>
// and a copy in public/r/latest. {{VERSION}} comes from packages/ui/package.json,
// {{REGISTRY_URL}} from the REGISTRY_URL env var (default below).
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const { version } = JSON.parse(
  readFileSync(resolve(root, "packages/ui/package.json"), "utf8"),
);
const registryUrl = (
  process.env.REGISTRY_URL ?? "https://puranderdua-registry.vercel.app"
).replace(/\/+$/, "");

run("pnpm", ["--filter", "@puranderdua/ui", "build"]);

const resolved = readFileSync(resolve(root, "registry.json"), "utf8")
  .replaceAll("{{VERSION}}", version)
  .replaceAll("{{REGISTRY_URL}}", registryUrl);
const tmp = resolve(root, "apps/registry/.build/registry.json");
mkdirSync(dirname(tmp), { recursive: true });
writeFileSync(tmp, resolved);

const outDir = resolve(root, `apps/registry/public/r/v${version}`);
const latest = resolve(root, "apps/registry/public/r/latest");
rmSync(outDir, { recursive: true, force: true });
rmSync(latest, { recursive: true, force: true });
run("pnpm", ["exec", "shadcn", "build", tmp, "--output", outDir]);
cpSync(outDir, latest, { recursive: true });
rmSync(resolve(root, "apps/registry/.build"), { recursive: true });
console.log(`registry v${version} -> ${registryUrl}/r/v${version}/{name}.json`);
