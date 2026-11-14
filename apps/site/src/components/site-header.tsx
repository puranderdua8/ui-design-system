"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Cluster, Container, Link } from "@puranderdua/ui";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { isCurrent } from "@/lib/is-current";

const items = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
  { href: "/playground", label: "Playground" },
] as const;

export const SiteHeader = () => {
  const pathname = usePathname();
  return (
    <header className="border-b border-ds-border py-ds-gap-md">
      <Container size="lg">
        <Cluster justify="between" gap="lg">
          <nav aria-label="Main">
            <Cluster as="ul" gap="lg">
              {items.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    asChild
                    variant="standalone"
                    className="aria-[current=page]:font-semibold aria-[current=page]:underline aria-[current=page]:underline-offset-4"
                  >
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
          <ThemeSwitcher />
        </Cluster>
      </Container>
    </header>
  );
};
