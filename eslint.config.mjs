import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Library and Storybook sources get React, hooks and a11y rules. `apps/site`
// gets its own set through `eslint-config-next`.
const reactFiles = [
  "packages/ui/src/**/*.{ts,tsx}",
  "apps/docs/src/**/*.{ts,tsx}",
];
const typedFiles = ["packages/ui/src/**/*.{ts,tsx}"];

/** Scope every config in `configs` to `files`. */
const scoped = (files, configs) =>
  [configs].flat().map((config) => ({ ...config, files }));

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/storybook-static/**",
      "**/generated/**",
      ".claude/**",
      "pnpm-lock.yaml",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**/*.mjs", "packages/ui/playground/*.mjs"],
    languageOptions: {
      globals: { console: "readonly", process: "readonly" },
    },
  },

  // React, hooks and a11y (packages/ui/src and apps/docs/src).
  ...scoped(reactFiles, reactHooks.configs.flat.recommended),
  ...scoped(reactFiles, jsxA11y.flatConfigs.strict),
  // Typed linting for the library: type-aware TypeScript and React rules.
  ...scoped(typedFiles, tseslint.configs.recommendedTypeChecked),
  ...scoped(typedFiles, eslintReact.configs["recommended-type-checked"]),
  // Storybook sources: React rules without type information.
  ...scoped(
    ["apps/docs/src/**/*.{ts,tsx}"],
    eslintReact.configs["recommended-typescript"],
  ),
  {
    files: typedFiles,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
