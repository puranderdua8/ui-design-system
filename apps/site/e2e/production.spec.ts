import { expect, test } from "@playwright/test";

for (const path of ["/", "/components/forms"]) {
  test(`security headers are present on ${path}`, async ({
    request,
    baseURL,
  }) => {
    const response = await request.get(path);
    expect(response.ok()).toBe(true);
    const h = response.headers();

    expect(h["x-powered-by"]).toBeUndefined();
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toMatch(/max-age=\d{7,}/);
    expect(h["permissions-policy"]).toContain("camera=()");
    expect(h["permissions-policy"]).toContain("microphone=()");
    expect(h["permissions-policy"]).toContain("geolocation=()");

    const csp = h["content-security-policy"] ?? "";
    for (const directive of [
      "default-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      // Google Fonts only, for the theme fonts.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
    ]) {
      expect(csp).toContain(directive);
    }
    // The local test server runs over http without this directive (next.config.ts explains why).
    if (baseURL?.startsWith("https://")) {
      expect(csp).toContain("upgrade-insecure-requests");
    }
  });
}

test("an unknown path shows the not-found page with status 404", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to the home page" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("robots.txt points at the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("User-Agent: *");
  expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
});

test("sitemap.xml lists home, the index and every category", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  for (const path of [
    "/components",
    "/components/typography",
    "/components/layout",
    "/components/forms",
    "/components/actions",
    "/components/display",
  ]) {
    expect(body).toContain(`${path}</loc>`);
  }
  expect(body).toMatch(/<loc>https?:\/\/[^/<]+<\/loc>/);
});

test("the Open Graph image is served", async ({ request, page }) => {
  await page.goto("/");
  const url = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(url).toBeTruthy();
  const response = await request.get(new URL(url ?? "").pathname);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/png");
});

test("the current page is shown visually, not only programmatically", async ({
  page,
}) => {
  await page.goto("/components/layout");
  const nav = page.getByRole("navigation", { name: "Main" });
  const current = nav.getByRole("link", { name: "Components" });
  const other = nav.getByRole("link", { name: "Home" });
  await expect(current).toHaveCSS("text-decoration-line", "underline");
  await expect(other).not.toHaveCSS("text-decoration-line", "underline");
});

test.describe("signup form focus and live region", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/forms");
    await page.waitForLoadState("networkidle");
  });

  test("a failed submit moves focus to the first invalid control", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByRole("textbox", { name: /^Email/ })).toBeFocused();

    // Fix the email: the next failed submit lands on the next invalid control.
    await page.getByRole("textbox", { name: /^Email/ }).fill("a@b.co");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(
      page.getByRole("combobox", { name: /^Country/ }),
    ).toBeFocused();
  });

  test("an error clears when its field changes", async ({ page }) => {
    await page.getByRole("button", { name: "Sign up" }).click();
    const error = page
      .getByRole("alert")
      .filter({ hasText: "Enter your email address." });
    await expect(error).toBeVisible();
    await page.getByRole("textbox", { name: /^Email/ }).fill("a");
    await expect(error).toHaveCount(0);
  });

  test("the status region exists before the form succeeds", async ({
    page,
  }) => {
    const status = page.locator("form").getByRole("status");
    await expect(status).toHaveCount(1);
    await expect(status).toBeEmpty();
  });
});
