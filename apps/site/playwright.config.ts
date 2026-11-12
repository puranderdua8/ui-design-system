import { defineConfig, devices } from "@playwright/test";

// SITE_URL points at a deployed preview; without it the tests run against a local `next start`.
const baseURL = process.env.SITE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A flake fails the run (F22): no retries, and a test that only passed on retry is a failure.
  retries: 0,
  failOnFlakyTests: !!process.env.CI,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.SITE_URL
    ? undefined
    : {
        // The CSP header list is fixed at build time, so the local build that leaves out
        // `upgrade-insecure-requests` (WebKit would upgrade http://localhost to https) is
        // made here, not taken from an earlier `next build`. Production builds never set it.
        command: "pnpm build && pnpm start --port 3100",
        env: { SITE_ALLOW_HTTP: "1" },
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
