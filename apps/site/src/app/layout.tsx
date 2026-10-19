import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Purander Dua — Design systems",
    template: "%s — Purander Dua",
  },
  description:
    "Portfolio of Purander Dua, built with its own token-driven design system.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" className={inter.variable}>
    <body className="min-h-screen">
      <a
        href="#main"
        className="sr-only ds-focus-ring text-ds-link focus:not-sr-only focus:absolute focus:top-ds-gap-sm focus:left-ds-gutter focus:z-10 focus:bg-ds-canvas focus:px-ds-gap-md focus:py-ds-gap-sm"
      >
        Skip to content
      </a>
      <SiteHeader />
      {children}
    </body>
  </html>
);

export default RootLayout;
