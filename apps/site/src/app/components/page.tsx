import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Text } from "@puranderdua/ui";
import { categories } from "@/lib/categories";

export const metadata: Metadata = { title: "Components — Purander Dua" };

const ComponentsIndex = () => (
  <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
    <Heading as="h1" variant="h1">
      Components
    </Heading>
    <Text variant="lead">
      Every component in @puranderdua/ui, grouped by what it is for.
    </Text>
    <ul className="grid gap-4 sm:grid-cols-2">
      {categories.map((c) => (
        <li
          key={c.slug}
          className="flex flex-col gap-2 rounded-ds-control border border-ds-border p-5"
        >
          <Heading as="h2" variant="h3">
            <Link href={`/components/${c.slug}`} className="ds-focus-ring">
              {c.title}
            </Link>
          </Heading>
          <Text>{c.description}</Text>
          {c.since ? <Text variant="caption">Coming in {c.since}</Text> : null}
        </li>
      ))}
    </ul>
  </main>
);

export default ComponentsIndex;
