import type { ReactNode } from "react";
import { Heading, Text } from "@puranderdua/ui";

type ExampleProps = {
  title: string;
  description?: string;
  /** Static source shown next to the live preview. Written by hand, never parsed. */
  code: string;
  /** The npm import line, e.g. `import { Button } from "@puranderdua/ui";`. */
  importLine: string;
  children: ReactNode;
};

export const Example = ({
  title,
  description,
  code,
  importLine,
  children,
}: ExampleProps) => (
  <section className="flex flex-col gap-4">
    <Heading as="h2" variant="h3">
      {title}
    </Heading>
    {description ? <Text>{description}</Text> : null}
    <div className="flex flex-wrap items-center gap-4 rounded-ds-control border border-ds-border p-6">
      {children}
    </div>
    <pre
      tabIndex={0}
      aria-label={`${title} code`}
      className="overflow-x-auto rounded-ds-control bg-ds-surface-subtle p-4 text-sm"
    >
      <code>{`${importLine}\n\n${code}`}</code>
    </pre>
  </section>
);
