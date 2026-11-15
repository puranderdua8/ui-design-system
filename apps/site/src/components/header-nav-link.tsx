"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Link } from "@puranderdua/ui";
import { isCurrent } from "@/lib/is-current";

/** The only client part of the header: it reads the pathname for `aria-current`. */
export const HeaderNavLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <Link
      asChild
      variant="standalone"
      className="aria-[current=page]:font-semibold aria-[current=page]:underline aria-[current=page]:underline-offset-4"
    >
      <NextLink
        href={href}
        aria-current={isCurrent(pathname, href) ? "page" : undefined}
      >
        {children}
      </NextLink>
    </Link>
  );
};
