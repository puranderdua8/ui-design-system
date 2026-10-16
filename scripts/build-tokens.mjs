// Builds generated token output from the DTCG source in tokens/.
//   packages/ui/src/styles/generated/tokens.css   :root vars, prefix --ds-
//   packages/ui/src/styles/generated/tokens.json  flat name -> value map
// Usage: node scripts/build-tokens.mjs [outDir]
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = join(root, "packages/ui/src/styles/generated");

export async function buildTokens(outDir = DEFAULT_OUT) {
  const buildPath = resolve(outDir) + "/";
  const sd = new StyleDictionary({
    usesDtcg: true,
    source: [
      join(root, "tokens/primitives/**/*.json"),
      join(root, "tokens/semantic/**/*.json"),
    ],
    // Typography composites become per-property tokens, e.g.
    // --ds-type-body-font-size.
    expand: { include: ["typography"] },
    log: { verbosity: "silent", warnings: "error" },
    platforms: {
      css: {
        prefix: "ds",
        transformGroup: "css",
        buildPath,
        files: [
          {
            destination: "tokens.css",
            format: "css/variables",
            options: { outputReferences: true, selector: ":root" },
          },
        ],
      },
      json: {
        prefix: "ds",
        transformGroup: "css",
        buildPath,
        files: [{ destination: "tokens.json", format: "json/flat" }],
      },
    },
  });
  await sd.buildAllPlatforms();
  return buildPath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = await buildTokens(process.argv[2]);
  console.log(`tokens:build wrote ${out}`);
}
