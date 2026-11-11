import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";
import type { Plugin } from "esbuild";

const componentsDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "src/components",
);

// Keeps "use client" working (D-065). A single bundle strips the directive, so
// every component file is its own entry and keeps its own top-level directive.
// This plugin makes every import of a component file external, pointing at
// that component's output file. Without it, `index` (and components that
// import each other, like Input -> Field) would pull the code from a shared
// chunk, skipping the directive, and could even bundle two copies of Field's
// context. Shared code (cn, layout maps) still goes into plain chunks.
const componentsAsExternals: Plugin = {
  name: "components-as-externals",
  setup(build) {
    build.onResolve({ filter: /^(\.\.?\/)|^@\// }, (args) => {
      if (args.kind === "entry-point" || !args.importer) return;
      const target = args.path.startsWith("@/")
        ? resolve(componentsDir, "..", args.path.slice(2))
        : resolve(args.resolveDir, args.path);
      if (dirname(target) !== componentsDir) return;
      const name = basename(target);
      const fromIndex = dirname(args.importer) !== componentsDir;
      return {
        path: `${fromIndex ? "./components/" : "./"}${name}.js`,
        external: true,
      };
    });
  },
};

export default defineConfig({
  // `*.styles.ts` are entries too (H3): plain files, no directive, so the
  // components and `index` import the same server-safe output file.
  entry: [
    "src/index.ts",
    "src/components/*.tsx",
    "src/components/*.styles.ts",
    "!src/components/*.test.tsx",
  ],
  format: ["esm"],
  dts: { entry: ["src/index.ts"] },
  splitting: true,
  clean: true,
  sourcemap: true,
  esbuildPlugins: [componentsAsExternals],
  external: ["react", "react-dom", "react/jsx-runtime", "radix-ui"],
});
