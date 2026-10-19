import type { ReactNode } from "react";
import NextLink from "next/link";
import {
  Button,
  Cluster,
  Container,
  Grid,
  Heading,
  Link,
  Section,
  Sidebar,
  Split,
  Stack,
  Text,
} from "@puranderdua/ui";
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
        <NextLink href="/components">All components</NextLink>
      </Button>
    </Example>
  </>
);

const linkImport = 'import { Link } from "@puranderdua/ui";';

const LinkExamples = () => (
  <>
    <Example
      title="Inline link"
      description="In running text the underline is always on, so the link is not marked by colour alone."
      importLine={linkImport}
      code={`<Text>
  Read the <Link href="/components">component overview</Link> first.
</Text>`}
    >
      <Text>
        Read the <Link href="/components">component overview</Link> first.
      </Text>
    </Example>
    <Example
      title="Standalone link"
      description="For navigation and call-to-action rows. The underline appears on hover and focus."
      importLine={linkImport}
      code={`<Link variant="standalone" href="/components/layout">Layout components</Link>`}
    >
      <Link variant="standalone" href="/components/layout">
        Layout components
      </Link>
    </Example>
    <Example
      title="External link"
      description="Opens in a new tab with rel set, an icon, and a screen-reader hint."
      importLine={linkImport}
      code={`<Link external href="https://www.npmjs.com/package/@puranderdua/ui">
  @puranderdua/ui on npm
</Link>`}
    >
      <Link external href="https://www.npmjs.com/package/@puranderdua/ui">
        @puranderdua/ui on npm
      </Link>
    </Example>
    <Example
      title="With next/link"
      description="asChild merges the link styles onto next/link, so navigation stays client-side."
      importLine={`import NextLink from "next/link";\n${linkImport}`}
      code={`<Link asChild variant="standalone">
  <NextLink href="/components/forms">Forms (coming soon)</NextLink>
</Link>`}
    >
      <Link asChild variant="standalone">
        <NextLink href="/components/forms">Forms (coming soon)</NextLink>
      </Link>
    </Example>
  </>
);

const Box = ({ children }: { children: ReactNode }) => (
  <div className="rounded-ds-control border border-dashed border-ds-border bg-ds-surface-subtle px-3 py-2 text-sm">
    {children}
  </div>
);

const layoutImport = (names: string) =>
  `import { ${names} } from "@puranderdua/ui";`;

const Layout = () => (
  <>
    <Example
      title="Container"
      description="Centres content and caps its width. Sizes run sm to xl, or full."
      importLine={layoutImport("Container")}
      code={`<Container size="sm">
  <Box>sm container</Box>
</Container>`}
    >
      <div className="w-full min-w-0 bg-ds-surface-subtle py-3">
        <Container size="sm">
          <Box>sm container</Box>
        </Container>
      </div>
    </Example>
    <Example
      title="Grid"
      description="cols sets a fixed count. minItemWidth fits as many columns as the width allows."
      importLine={layoutImport("Grid")}
      code={`<Grid cols={3} gap="sm">…</Grid>
<Grid minItemWidth="sm" gap="sm">…</Grid>`}
    >
      <div className="flex w-full min-w-0 flex-col gap-4">
        <Grid cols={3} gap="sm">
          <Box>One</Box>
          <Box>Two</Box>
          <Box>Three</Box>
        </Grid>
        <Grid minItemWidth="sm" gap="sm">
          <Box>Fit one</Box>
          <Box>Fit two</Box>
          <Box>Fit three</Box>
          <Box>Fit four</Box>
        </Grid>
      </div>
    </Example>
    <Example
      title="Stack"
      description="Vertical rhythm from the gap tokens."
      importLine={layoutImport("Stack")}
      code={`<Stack gap="sm">
  <Box>First</Box>
  <Box>Second</Box>
  <Box>Third</Box>
</Stack>`}
    >
      <div className="w-full min-w-0">
        <Stack gap="sm">
          <Box>First</Box>
          <Box>Second</Box>
          <Box>Third</Box>
        </Stack>
      </div>
    </Example>
    <Example
      title="Cluster"
      description="Items sit in a row and wrap when the space runs out."
      importLine={layoutImport("Cluster")}
      code={`<Cluster gap="sm" justify="between">
  <Box>Alpha</Box> … <Box>Epsilon</Box>
</Cluster>`}
    >
      <div className="w-full min-w-0">
        <Cluster gap="sm" justify="between">
          <Box>Alpha</Box>
          <Box>Beta</Box>
          <Box>Gamma</Box>
          <Box>Delta</Box>
          <Box>Epsilon</Box>
        </Cluster>
      </div>
    </Example>
    <Example
      title="Section"
      description="A full-width band with a tone and padding from the section tokens."
      importLine={layoutImport("Section")}
      code={`<Section tone="subtle" padding="sm" container="sm">
  <Text>Subtle tone</Text>
</Section>
<Section tone="inverse" padding="sm" container="sm">
  <Text>Inverse tone</Text>
</Section>`}
    >
      <div className="flex w-full min-w-0 flex-col">
        <Section tone="subtle" padding="sm" container="sm">
          <Text>Subtle tone</Text>
        </Section>
        <Section tone="inverse" padding="sm" container="sm">
          <Text>Inverse tone</Text>
        </Section>
      </div>
    </Example>
    <Example
      title="Split"
      description="Two columns in a chosen ratio. They stack on narrow screens."
      importLine={layoutImport("Split")}
      code={`<Split ratio="1:2" gap="sm">
  <Box>One part</Box>
  <Box>Two parts</Box>
</Split>`}
    >
      <div className="w-full min-w-0">
        <Split ratio="1:2" gap="sm">
          <Box>One part</Box>
          <Box>Two parts</Box>
        </Split>
      </div>
    </Example>
    <Example
      title="Sidebar"
      description="A fixed-width aside beside flexible content. It stacks below the md breakpoint."
      importLine={layoutImport("Sidebar")}
      code={`<Sidebar sidebar={<Box>Sidebar</Box>} gap="sm">
  <Box>Content</Box>
</Sidebar>`}
    >
      <div className="w-full min-w-0">
        <Sidebar sidebar={<Box>Sidebar</Box>} gap="sm">
          <Box>Content</Box>
        </Sidebar>
      </div>
    </Example>
  </>
);

export const categoryContent: Partial<Record<CategorySlug, () => ReactNode>> = {
  typography: Typography,
  layout: Layout,
  actions: () => (
    <>
      <Actions />
      <LinkExamples />
    </>
  ),
};
