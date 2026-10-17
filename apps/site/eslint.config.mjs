import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  { settings: { next: { rootDir: import.meta.dirname } } },
  {
    // Button comes from the shadcn registry (src/components/ui/button.tsx), never the package.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@puranderdua/ui",
              importNames: ["Button", "buttonVariants"],
              message:
                "Import Button from '@/components/ui/button' (registry copy), not from @puranderdua/ui.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
