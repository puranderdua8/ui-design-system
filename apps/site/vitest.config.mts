import { defineConfig } from "vitest/config";

// Unit tests for pure TypeScript under src/ (the playground engine). The browser
// tests live in e2e/ and run with Playwright.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
