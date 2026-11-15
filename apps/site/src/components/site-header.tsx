import { Cluster, Container } from "@puranderdua/ui";
import { HeaderNavLink } from "@/components/header-nav-link";
import { ThemeSwitcher } from "@/components/theme-switcher";

const items = [
  { href: "/", label: "Home" },
  { href: "/components", label: "Components" },
  { href: "/playground", label: "Playground" },
] as const;

// A Server Component (R30): only the links' `aria-current` and the theme
// switcher run in the browser.
export const SiteHeader = () => (
  <header className="border-b border-ds-border py-ds-gap-md">
    <Container size="lg">
      <Cluster justify="between" gap="lg">
        <nav aria-label="Main">
          <Cluster as="ul" gap="lg">
            {items.map(({ href, label }) => (
              <li key={href}>
                <HeaderNavLink href={href}>{label}</HeaderNavLink>
              </li>
            ))}
          </Cluster>
        </nav>
        <ThemeSwitcher />
      </Cluster>
    </Container>
  </header>
);
