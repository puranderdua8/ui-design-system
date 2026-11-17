import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Heading, Link, Stack, Text } from "@puranderdua/ui";
import { categoryContent } from "@/components/category-pages";
import { Example, exampleId } from "@/components/example";
import { categories } from "@/lib/categories";

type Params = { category: string };
type PageProps = { params: Promise<Params> };

export const dynamicParams = false;

export const generateStaticParams = (): Params[] =>
  categories.map((c) => ({ category: c.slug }));

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { category } = await params;
  const found = categories.find((c) => c.slug === category);
  return {
    title: found?.title ?? "Components",
    // Each category says what it holds instead of sharing the site description (R34).
    ...(found ? { description: found.description } : {}),
  };
};

const CategoryPage = async ({ params }: PageProps) => {
  const { category } = await params;
  const found = categories.find((c) => c.slug === category);
  if (!found) notFound();
  const { note, examples } = categoryContent[found.slug];

  return (
    <main id="main" tabIndex={-1} className="py-ds-section-sm">
      <Container size="lg">
        <Stack gap="lg">
          <Heading as="h1" variant="h1">
            {found.title}
          </Heading>
          <Text variant="lead">{found.description}</Text>
          {/* aria-label, not aria-labelledby: the latter made Firefox crash inside axe. */}
          <nav aria-label="On this page">
            <Stack gap="sm">
              <Text as="span" variant="label">
                On this page
              </Text>
              <ul className="flex flex-wrap gap-x-ds-gap-md gap-y-ds-gap-xs">
                {examples.map((example) => (
                  <li key={example.title}>
                    <Link href={`#${exampleId(example.title)}`}>
                      {example.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Stack>
          </nav>
          {note ? (
            <Text variant="caption" className="text-ds-text-muted">
              {note}
            </Text>
          ) : null}
          {examples.map((example) => (
            <Example key={example.title} {...example} />
          ))}
        </Stack>
      </Container>
    </main>
  );
};

export default CategoryPage;
