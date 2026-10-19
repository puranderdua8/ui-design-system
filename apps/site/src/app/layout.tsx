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
  title: "Purander Dua — Design systems",
  description:
    "Portfolio of Purander Dua, built with its own token-driven design system.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" className={inter.variable}>
    <body className="min-h-screen">
      <SiteHeader />
      {children}
    </body>
  </html>
);

export default RootLayout;
