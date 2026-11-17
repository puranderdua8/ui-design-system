import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Cluster, Heading, Stack, Text } from "@puranderdua/ui";
import { CopyCodeButton } from "@/components/copy-code-button";
import { ExamplesScope } from "@/components/examples-scope";
import { demos, type DemoName } from "@/demos/registry";

type ExampleProps = {
  title: string;
  /** One plain line: what this component is for. */
  purpose: string;
  description?: string;
  /** A key of the demo registry. The component and the file shown below both come from it. */
  demo: DemoName;
  /** Let the demo use the full width of the frame instead of sitting in a wrapping row. */
  fill?: boolean;
};

// `ds-tone-canvas` so the frame wears the chosen look's own page colour and text.
const frame =
  "ds-tone-canvas ds-border rounded-ds-card border-ds-border p-ds-gap-lg font-ds-body";

/** `src/demos`, found from this module's location so it does not depend on the working directory. */
const demosDir = join(dirname(fileURLToPath(import.meta.url)), "..", "demos");

/** Read at build time (static pages), so the shown code is the code that rendered. */
const readDemo = (name: DemoName) =>
  readFileSync(join(demosDir, `${name}.tsx`), "utf8").trim();

/** The anchor for an example: the "On this page" list and the section share it. */
export const exampleId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const Example = ({
  title,
  purpose,
  description,
  demo,
  fill = false,
}: ExampleProps) => {
  const Demo = demos[demo];
  const code = readDemo(demo);
  return (
    <Stack
      as="section"
      gap="md"
      id={exampleId(title)}
      className="scroll-mt-ds-gap-lg"
    >
      <Heading as="h2" variant="h3">
        {title}
      </Heading>
      <Text>{purpose}</Text>
      {description ? (
        <Text variant="caption" className="text-ds-text-muted">
          {description}
        </Text>
      ) : null}
      <ExamplesScope className={frame}>
        {fill ? (
          <Demo />
        ) : (
          <Cluster gap="md">
            <Demo />
          </Cluster>
        )}
      </ExamplesScope>
      <details className="group">
        <summary className="ds-focus-ring w-fit cursor-pointer rounded-ds-control py-ds-gap-xs underline">
          Show code
        </summary>
        <Stack gap="sm" className="mt-ds-gap-sm">
          <CopyCodeButton text={code} label={title} />
          <pre
            role="region"
            tabIndex={0}
            aria-label={`${title} code`}
            className="overflow-x-auto rounded-ds-card bg-ds-surface-subtle p-ds-gap-md font-mono ds-type-caption"
          >
            <code>{code}</code>
          </pre>
        </Stack>
      </details>
    </Stack>
  );
};
