import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // Reported, not enforced (H19): `pnpm test:coverage` and a CI summary. A
    // threshold would turn a number into a target; the tests are chosen for the
    // defects they catch (docs/audits R37), not for lines they touch.
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/index.ts",
        "src/**/generated/**",
      ],
      reporter: ["text-summary", "json-summary"],
    },
  },
});
