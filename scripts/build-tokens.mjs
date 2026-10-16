// Builds generated token output from the DTCG source in tokens/.
//   packages/ui/src/styles/generated/tokens.css   :root vars, prefix --ds-
//   packages/ui/src/styles/generated/tokens.json  flat name -> value map
// Usage: node scripts/build-tokens.mjs [outDir]
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { fileHeader, formattedVariables } from "style-dictionary/utils";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_OUT = join(root, "packages/ui/src/styles/generated");

const FORMAT = "css/variables-ds";

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

export async function buildTokens(
  outDir = DEFAULT_OUT,
  tokensDir = join(root, "tokens"),
) {
  const buildPath = resolve(outDir) + "/";
  const sd = new StyleDictionary({
    usesDtcg: true,
    source: [
      join(tokensDir, "primitives/**/*.json"),
      join(tokensDir, "semantic/**/*.json"),
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
            format: FORMAT,
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
