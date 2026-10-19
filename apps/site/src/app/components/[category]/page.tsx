import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Heading, Text } from "@puranderdua/ui";
import { categoryContent } from "@/components/category-pages";
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
  return { title: `${found?.title ?? "Components"} — Purander Dua` };
};

const CategoryPage = async ({ params }: PageProps) => {
  const { category } = await params;
  const found = categories.find((c) => c.slug === category);
  if (!found) notFound();
  const Content = categoryContent[found.slug];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <Heading as="h1" variant="h1">
        {found.title}
      </Heading>
      <Text variant="lead">{found.description}</Text>
      {Content ? (
        <Content />
      ) : (
        <Text>
          Coming in {found.since}. These components are not published yet.
        </Text>
      )}
    </main>
  );
};

export default CategoryPage;
