import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "A design system portfolio, built with its own token-driven components.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s — ${siteName}`,
  },
  description,
  openGraph: { title: siteName, description, siteName, type: "website" },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" className={inter.variable}>
    <body className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only ds-focus-ring ds-layer-skip-link text-ds-link focus:not-sr-only focus:absolute focus:top-ds-gap-sm focus:left-ds-gutter focus:bg-ds-canvas focus:px-ds-gap-md focus:py-ds-gap-sm"
      >
        Skip to content
      </a>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </body>
  </html>
);

export default RootLayout;
