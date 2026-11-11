import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Runs every story in Chromium. With `a11y.test: "error"` (preview.ts) an axe
// violation fails the story's test, so `pnpm check` and CI fail with it (H7, F21).
export default defineConfig({
  plugins: [tailwindcss(), storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
