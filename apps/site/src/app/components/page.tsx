import type { Metadata } from "next";
import NextLink from "next/link";
import { Container, Grid, Heading, Link, Stack, Text } from "@puranderdua/ui";
import { categories } from "@/lib/categories";

export const metadata: Metadata = { title: "Components" };

const total = categories.reduce((n, c) => n + c.components.length, 0);

const ComponentsIndex = () => (
  <main id="main" tabIndex={-1} className="py-ds-section-sm">
    <Container size="lg">
      <Stack gap="xl">
        <Heading as="h1" variant="h1">
          Components
        </Heading>
        <Text variant="lead">
          {total} components in @puranderdua/ui, grouped by what they are for.
        </Text>
        <Grid as="ul" cols={2}>
          {categories.map((c) => (
            <li key={c.slug}>
              <Stack
                gap="xs"
                className="ds-border h-full rounded-ds-card border-ds-border p-ds-gap-lg"
              >
                <Heading as="h2" variant="h3">
                  <Link asChild variant="standalone">
                    <NextLink href={`/components/${c.slug}`}>
                      {c.title}
                    </NextLink>
                  </Link>
                </Heading>
                <Text>{c.description}</Text>
                <Text variant="caption">{c.components.length} components</Text>
              </Stack>
            </li>
          ))}
        </Grid>
      </Stack>
    </Container>
  </main>
);

export default ComponentsIndex;
