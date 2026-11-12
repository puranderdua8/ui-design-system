import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

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
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // WebKit upgrades http://localhost requests to https, so no script or style would load
  // in a local `next start` (the e2e run). The e2e build sets SITE_ALLOW_HTTP=1 to leave
  // the directive out (headers are fixed at build time); production never sets it.
  ...(process.env.SITE_ALLOW_HTTP === "1" ? [] : ["upgrade-insecure-requests"]),
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
