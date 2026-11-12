import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Cluster, Heading, Stack, Text } from "@puranderdua/ui";
import { demos, type DemoName } from "@/demos/registry";

type ExampleProps = {
  title: string;
  description?: string;
  /** A key of the demo registry. The component and the file shown below both come from it. */
  demo: DemoName;
  /** Let the demo use the full width of the frame instead of sitting in a wrapping row. */
  fill?: boolean;
};

const frame = "ds-border rounded-ds-card border-ds-border p-ds-gap-lg";

/** `src/demos`, found from this module's location so it does not depend on the working directory. */
const demosDir = join(dirname(fileURLToPath(import.meta.url)), "..", "demos");

/** Read at build time (static pages), so the shown code is the code that rendered. */
const readDemo = (name: DemoName) =>
  readFileSync(join(demosDir, `${name}.tsx`), "utf8").trim();

export const Example = ({
  title,
  description,
  demo,
  fill = false,
}: ExampleProps) => {
  const Demo = demos[demo];
  return (
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
};
