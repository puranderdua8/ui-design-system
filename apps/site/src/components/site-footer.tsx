import NextLink from "next/link";
import { Cluster, Container, Link, Text } from "@puranderdua/ui";

export const SiteFooter = () => (
  <footer className="border-t border-ds-border py-ds-gap-lg">
    <Container size="lg">
      <Cluster gap="md">
        <Text variant="caption" className="text-ds-text-muted">
          Built with @puranderdua/ui.
        </Text>
        <Text variant="caption">
          <Link asChild>
            <NextLink href="/about">About and privacy</NextLink>
          </Link>
        </Text>
      </Cluster>
    </Container>
  </footer>
);
