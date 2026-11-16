import { defineConfig, devices } from "@playwright/test";

// Visual regression for the story set (H19, R37): every story in the built
// Storybook, Chromium only, against committed baselines. The baselines are made
// on the Linux CI runner (`.github/workflows/update-screenshots.yml`), because
// font rendering differs per platform; on any other platform the suite skips.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  // One folder, no platform suffix: Linux is the only platform that has baselines.
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      // Anti-aliasing noise only; a changed colour, size or position is far above this.
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: "http://localhost:6007",
    // Banner video stops and shows its poster: the frame is deterministic.
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  webServer: {
    // Serves the output of `pnpm build-storybook` (run first, as `pnpm check` does).
    command:
      "pnpm exec vite preview --outDir storybook-static --port 6007 --strictPort",
    url: "http://localhost:6007/iframe.html",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
