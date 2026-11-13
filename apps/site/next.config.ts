import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const allowHttp = process.env.SITE_ALLOW_HTTP === "1";

// The flag is for the local e2e build only. A deployed build (Vercel sets VERCEL) must
// never ship without `upgrade-insecure-requests`, so fail the build instead.
if (allowHttp && process.env.VERCEL) {
  throw new Error(
    "SITE_ALLOW_HTTP=1 is set on Vercel. It removes upgrade-insecure-requests from the CSP and is only for the local e2e build. Remove it from the project's environment variables.",
  );
}

/**
 * Why `'unsafe-inline'` for scripts and not nonces: a nonce is generated per
 * request, which forces every page to render dynamically. The site is fully
 * static, so we keep static rendering and accept inline scripts from our own
 * origin's HTML (Next's bootstrap and RSC payload scripts). Dev needs
 * `'unsafe-eval'` for React's debugging features; production does not.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Google Fonts (theme fonts, docs/themes.md): the stylesheet comes from
  // fonts.googleapis.com and the font files from fonts.gstatic.com. Nothing else
  // is opened up (no script-src, connect-src or img-src change).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // WebKit upgrades http://localhost requests to https, so no script or style would load
  // in a local `next start` (the e2e run). The e2e build sets SITE_ALLOW_HTTP=1 to leave
  // the directive out (headers are fixed at build time); production never sets it.
  ...(allowHttp ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  headers: () => [{ source: "/:path*", headers: securityHeaders }],
};

export default nextConfig;
