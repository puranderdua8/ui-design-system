// Builds generated token output per theme from the DTCG source in tokens/,
// following tokens/resolver.json (theme x mode light).
//   <outDir>/themes/<name>.css   :root vars, prefix --ds-, references kept
//   <outDir>/themes/<name>.json  { vars: resolved map, refs: semantic -> primitive }
//   <outDir>/layers.css          shared stacking scale --ds-layer-* (not per theme)
// Other shared primitives (breakpoints) are validated, not emitted.
// Usage: node scripts/build-tokens.mjs [outDir]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { fileHeader, formattedVariables } from "style-dictionary/utils";
import { loadResolver } from "./lib/resolver.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = join(root, "packages/ui/src/styles/generated");

const FORMAT = "css/variables-ds";
const MAP_FORMAT = "json/theme-map";
const ALIAS = /^\{([^{}]+)\}$/;

// css/variables with two tweaks: expanded typography properties carry no
// comment (they would all repeat the composite's description), and space
// tokens are in numeric order (JS puts "1-5" after "6").
StyleDictionary.registerFormat({
  name: FORMAT,
  format: async ({ dictionary, file, options }) => {
    const spaceKey = (t) =>
      parseFloat(t.path[t.path.length - 1].replace("-", "."));
    const stripped = dictionary.allTokens.map((t) =>
      t.path[0] === "type"
        ? {
            ...t,
            comment: undefined,
            $description: undefined,
            description: undefined,
          }
        : t,
    );
    // Sort only the space tokens, writing them back into their own slots.
    const sortedSpace = stripped
      .filter((t) => t.path[0] === "space")
      .sort((x, y) => spaceKey(x) - spaceKey(y));
    let i = 0;
    const allTokens = stripped.map((t) =>
      t.path[0] === "space" ? sortedSpace[i++] : t,
    );
    const variables = formattedVariables({
      format: "css",
      dictionary: { ...dictionary, allTokens },
      outputReferences: options?.outputReferences,
      usesDtcg: true,
    });
    return `${await fileHeader({ file })}${options?.selector ?? ":root"} {\n${variables}\n}\n`;
  },
});

// Fully resolved var map (live switching applies it as inline CSS vars), plus
// the alias graph for tooling: semantic var -> the primitive var it points to.
StyleDictionary.registerFormat({
  name: MAP_FORMAT,
  format: ({ dictionary }) => {
    const vars = {};
    const refs = {};
    for (const t of dictionary.allTokens) {
      vars[`--${t.name}`] = t.$value;
      const m =
        typeof t.original.$value === "string" && ALIAS.exec(t.original.$value);
      if (m) refs[`--${t.name}`] = `--ds-${m[1].replaceAll(".", "-")}`;
    }
    return `${JSON.stringify({ vars, refs }, null, 2)}\n`;
  },
});

// Builds every theme in the manifest; returns the output dir and theme names.
export async function buildTokens(
  outDir = DEFAULT_OUT,
  tokensDir = join(root, "tokens"),
) {
  const buildPath = resolve(outDir) + "/";
  const { themes, semantic, shared } = loadResolver(tokensDir);
  for (const [name, sources] of Object.entries(themes)) {
    const sd = new StyleDictionary({
      usesDtcg: true,
      source: [...sources, ...semantic],
      // Typography composites become per-property tokens, e.g.
      // --ds-type-body-font-size.
      expand: { include: ["typography"] },
      log: { verbosity: "silent", warnings: "error" },
      platforms: {
        css: {
          prefix: "ds",
          transformGroup: "css",
          buildPath: buildPath + "themes/",
          files: [
            {
              destination: `${name}.css`,
              format: FORMAT,
              options: { outputReferences: true, selector: ":root" },
            },
            { destination: `${name}.json`, format: MAP_FORMAT },
          ],
        },
      },
    });
    await sd.buildAllPlatforms();
  }
  writeLayers(shared, buildPath);
  return buildPath;
}

// Shared (non-themeable) stacking scale: one `layers.css` with --ds-layer-*.
// foundations.css includes it; themes never carry it (D-075).
function writeLayers(shared, buildPath) {
  const file = shared.find((p) => p.endsWith("layers.json"));
  if (!file) return;
  const { layer } = JSON.parse(readFileSync(file, "utf8"));
  const lines = Object.entries(layer)
    .filter(([key]) => !key.startsWith("$"))
    .map(([key, token]) => `  --ds-layer-${key}: ${token.$value};`);
  mkdirSync(buildPath, { recursive: true });
  writeFileSync(
    join(buildPath, "layers.css"),
    `/**\n * Do not edit directly, this file was auto-generated.\n */\n\n:root {\n${lines.join("\n")}\n}\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = await buildTokens(process.argv[2]);
  console.log(`tokens:build wrote ${out}`);
}
