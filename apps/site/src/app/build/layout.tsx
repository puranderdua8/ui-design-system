import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TopBar } from "@/components/build/top-bar";

// The Builder is built in the open but not announced (D-143): unlinked, out of the
// sitemap and `noindex` until launch.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const BuildLayout = ({ children }: { children: ReactNode }) => (
  <>
    <TopBar />
    {children}
  </>
);

export default BuildLayout;
