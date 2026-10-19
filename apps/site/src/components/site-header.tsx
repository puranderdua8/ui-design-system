"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Cluster, Container, Link } from "@puranderdua/ui";

const items = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
] as const;

const isCurrent = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export const SiteHeader = () => {
  const pathname = usePathname();
  return (
    <header className="border-b border-ds-border py-ds-gap-md">
      <Container size="lg">
        <nav aria-label="Main">
          <Cluster as="ul" gap="lg">
            {items.map(({ href, label }) => (
              <li key={href}>
                <Link asChild variant="standalone">
                  <NextLink
                    href={href}
                    aria-current={
                      isCurrent(pathname, href) ? "page" : undefined
                    }
                  >
                    {label}
                  </NextLink>
                </Link>
              </li>
            ))}
          </Cluster>
        </nav>
      </Container>
    </header>
  );
};
