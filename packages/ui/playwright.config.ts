import { defineConfig, devices } from "@playwright/test";

// Rendered-layout tests: real Chromium against the package source (no jsdom).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A flake fails the run (F22): no retries, and a test that only passed on retry is a failure.
  retries: 0,
  failOnFlakyTests: !!process.env.CI,
  reporter: "list",
  use: { baseURL: "http://localhost:5174" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    command:
      "pnpm exec vite --config e2e/vite.config.ts --port 5174 --strictPort",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
