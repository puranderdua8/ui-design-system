import type { ReactNode } from "react";
import Link from "next/link";
import { Button, Heading, Text } from "@puranderdua/ui";
import { Example } from "@/components/example";
import type { CategorySlug } from "@/lib/categories";

const typographyImport = 'import { Heading, Text } from "@puranderdua/ui";';
const buttonImport = 'import { Button } from "@puranderdua/ui";';

const Typography = () => (
  <>
    <Example
      title="Heading variants"
      description="The variant sets the look. The element is chosen separately."
      importLine={typographyImport}
      code={`<Heading as="h2" variant="display">Display</Heading>
<Heading as="h2" variant="h1">Heading 1</Heading>
<Heading as="h2" variant="h2">Heading 2</Heading>
<Heading as="h2" variant="h3">Heading 3</Heading>`}
    >
      <div className="flex flex-col gap-3">
        <Heading as="h3" variant="display">
          Display
        </Heading>
        <Heading as="h3" variant="h1">
          Heading 1
        </Heading>
        <Heading as="h3" variant="h2">
          Heading 2
        </Heading>
        <Heading as="h3" variant="h3">
          Heading 3
        </Heading>
      </div>
    </Example>
    <Example
      title="Text variants"
      importLine={typographyImport}
      code={`<Text variant="body">Body</Text>
<Text variant="lead">Lead</Text>
<Text variant="caption">Caption</Text>
<Text as="span" variant="label">Label</Text>`}
    >
      <div className="flex flex-col gap-3">
        <Text variant="body">Body</Text>
        <Text variant="lead">Lead</Text>
        <Text variant="caption">Caption</Text>
        <Text as="span" variant="label">
          Label
        </Text>
      </div>
    </Example>
    <Example
      title="as versus variant"
      description="A display-sized heading can be any level, and lead text can be a span."
      importLine={typographyImport}
      code={`<Heading as="h3" variant="display">h3 element, display look</Heading>
<Text as="span" variant="lead">span element, lead look</Text>`}
    >
      <div className="flex flex-col gap-3">
        <Heading as="h3" variant="display">
          h3 element, display look
        </Heading>
        <Text as="span" variant="lead">
          span element, lead look
        </Text>
      </div>
    </Example>
  </>
);

const Actions = () => (
  <>
    <Example
      title="Variants and sizes"
      importLine={buttonImport}
      code={`<Button variant="primary" size="sm">Primary sm</Button>
<Button variant="primary" size="md">Primary md</Button>
<Button variant="secondary" size="sm">Secondary sm</Button>
<Button variant="secondary" size="md">Secondary md</Button>`}
    >
      <Button variant="primary" size="sm">
        Primary sm
      </Button>
      <Button variant="primary" size="md">
        Primary md
      </Button>
      <Button variant="secondary" size="sm">
        Secondary sm
      </Button>
      <Button variant="secondary" size="md">
        Secondary md
      </Button>
    </Example>
    <Example
      title="Disabled"
      importLine={buttonImport}
      code={`<Button variant="primary" disabled>Primary</Button>
<Button variant="secondary" disabled>Secondary</Button>`}
    >
      <Button variant="primary" disabled>
        Primary
      </Button>
      <Button variant="secondary" disabled>
        Secondary
      </Button>
    </Example>
    <Example
      title="As a link"
      description="asChild renders the child element with the button styles."
      importLine={buttonImport}
      code={`<Button variant="secondary" asChild>
  <a href="/docs">Read the docs</a>
</Button>`}
    >
      <Button variant="secondary" asChild>
        <Link href="/components">All components</Link>
      </Button>
    </Example>
  </>
);

export const categoryContent: Partial<Record<CategorySlug, () => ReactNode>> = {
  typography: Typography,
  actions: Actions,
};
