import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Bricolage_Grotesque,
  Fraunces,
  IBM_Plex_Sans,
  Inter,
  Nunito_Sans,
} from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteName, siteUrl } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Every theme's font is self-hosted by next/font and exposed as a CSS variable;
// `lib/theme.ts` maps each theme's family vars onto these (docs/themes.md). Base's
// Inter is the default and preloads. The others set `preload: false`, so no page
// downloads them up front: the browser fetches a font file only once text uses it.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const fontVariables = [inter, plex, fraunces, nunito, bricolage]
  .map((font) => font.variable)
  .join(" ");

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
  // The head script and the theme switcher change <html>'s style and data-ds-theme
  // before React hydrates, so React must not flag the mismatch.
  <html lang="en" className={fontVariables} suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    </head>
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
