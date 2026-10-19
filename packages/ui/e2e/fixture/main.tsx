import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Cluster,
  Container,
  Grid,
  Link,
  Section,
  Sidebar,
  Split,
  Stack,
} from "../../src";
import "./fixture.css";

// `?case=<name>&w=<px>` renders one case inside a frame of that width, so the
// tests can change the container width without changing the viewport.
const params = new URLSearchParams(location.search);
const width = params.get("w");
const name = params.get("case") ?? "";

const Box = ({ id, children }: { id: string; children?: ReactNode }) => (
  // No horizontal padding on the measured box: Split's ratio applies to content boxes.
  <div data-testid={id}>
    <div className="bg-ds-surface-subtle py-ds-gap-sm">{children ?? id}</div>
  </div>
);

const cases: Record<string, ReactNode> = {
  "split-1-1": (
    <Split ratio="1:1">
      <Box id="a" />
      <Box id="b" />
    </Split>
  ),
  "split-1-2": (
    <Split ratio="1:2">
      <Box id="a" />
      <Box id="b" />
    </Split>
  ),
  "split-2-1": (
    <Split ratio="2:1">
      <Box id="a" />
      <Box id="b" />
    </Split>
  ),
  "sidebar-start": (
    <Sidebar sidebar={<Box id="a" />}>
      <Box id="b">
        content averyveryveryveryveryveryveryveryveryveryveryveryverylongword
      </Box>
    </Sidebar>
  ),
  "sidebar-end": (
    <Sidebar side="end" sidebar={<Box id="a" />}>
      <Box id="b" />
    </Sidebar>
  ),
  "grid-cols-3": (
    <Grid cols={3} gap="sm">
      <Box id="a" />
      <Box id="b" />
      <Box id="c" />
    </Grid>
  ),
  "grid-fit-md": (
    <Grid minItemWidth="md" gap="sm">
      <Box id="a" />
      <Box id="b" />
      <Box id="c" />
      <Box id="d" />
    </Grid>
  ),
  "container-sm": (
    <Container size="sm" data-testid="container">
      <Box id="a" />
    </Container>
  ),
  stack: (
    <Stack gap="lg" data-testid="stack">
      <Box id="a" />
      <Box id="b" />
    </Stack>
  ),
  cluster: (
    <Cluster gap="sm" data-testid="cluster">
      <Box id="a">Alpha item</Box>
      <Box id="b">Beta item</Box>
      <Box id="c">Gamma item</Box>
    </Cluster>
  ),
  section: (
    <>
      <Section tone="inverse" padding="lg" data-testid="inverse">
        <Box id="a" />
      </Section>
      <Section tone="canvas" padding="sm" data-testid="canvas">
        <Box id="b" />
      </Section>
    </>
  ),
  controls: (
    <Stack gap="md">
      <Button data-testid="button">Button</Button>
      <Link href="#x" data-testid="link">
        Link
      </Link>
    </Stack>
  ),
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div id="frame" style={{ width: width ? `${width}px` : "100%" }}>
      {cases[name] ?? <p>unknown case</p>}
    </div>
  </StrictMode>,
);
