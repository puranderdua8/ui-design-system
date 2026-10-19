import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import { Cluster, Heading, Stack, Text } from "@puranderdua/ui";

type ExampleProps = {
  title: string;
  description?: string;
  /** Demo file under `src/demos/` without the extension, e.g. `layout/grid`. */
  demo: string;
  /** The demo component. Its source file is shown below the preview, so the two cannot drift. */
  Demo: ComponentType;
  /** Let the demo use the full width of the frame instead of sitting in a wrapping row. */
  fill?: boolean;
};

const frame = "ds-border rounded-ds-card border-ds-border p-ds-gap-lg";

/** Read at build time (static pages), so the shown code is the code that rendered. */
const readDemo = (name: string) =>
  readFileSync(join(process.cwd(), "src/demos", `${name}.tsx`), "utf8").trim();

export const Example = ({
  title,
  description,
  demo,
  Demo,
  fill = false,
}: ExampleProps) => (
  <Stack as="section" gap="md">
    <Heading as="h2" variant="h3">
      {title}
    </Heading>
    {description ? <Text>{description}</Text> : null}
    {fill ? (
      <div className={frame}>
        <Demo />
      </div>
    ) : (
      <Cluster gap="md" className={frame}>
        <Demo />
      </Cluster>
    )}
    <pre
      role="region"
      tabIndex={0}
      aria-label={`${title} code`}
      className="overflow-x-auto rounded-ds-card bg-ds-surface-subtle p-ds-gap-md font-mono ds-type-caption"
    >
      <code>{readDemo(demo)}</code>
    </pre>
  </Stack>
);
