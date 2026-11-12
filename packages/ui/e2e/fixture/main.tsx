import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Cluster,
  Container,
  Grid,
  Link,
  RadioGroup,
  RadioGroupItem,
  Section,
  Sidebar,
  Split,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  type SectionTone,
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
  // Focusable content so tab order can be compared with the visual order (F10).
  // Buttons, because WebKit on macOS does not Tab to links by default.
  "sidebar-start-focus": (
    <Sidebar sidebar={<button id="a">a</button>}>
      <button id="b">b</button>
    </Sidebar>
  ),
  "sidebar-end-focus": (
    <Sidebar side="end" sidebar={<button id="a">a</button>}>
      <button id="b">b</button>
    </Sidebar>
  ),
  targets: (
    // Padded so a point just outside either control is still inside the page.
    <Cluster gap="lg" style={{ padding: 24 }}>
      <Checkbox aria-label="check" data-testid="check" />
      <RadioGroup>
        <RadioGroupItem value="r" aria-label="radio" data-testid="radio" />
      </RadioGroup>
    </Cluster>
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
  // Every tone with the roles a component reads inside it (H4, F02).
  tones: (
    <>
      {(["canvas", "subtle", "inverse", "brand"] as SectionTone[]).map((t) => (
        <Section key={t} tone={t} padding="sm" data-testid={`tone-${t}`}>
          <Stack gap="sm">
            <Text data-testid={`text-${t}`}>Body text</Text>
            <Text variant="caption" data-testid={`muted-${t}`}>
              Muted text
            </Text>
            <Link href="#x" data-testid={`link-${t}`}>
              Link
            </Link>
            <Cluster gap="sm">
              <Button data-testid={`primary-${t}`}>Primary</Button>
              <Button variant="secondary" data-testid={`secondary-${t}`}>
                Secondary
              </Button>
              <Checkbox aria-label={`check ${t}`} data-testid={`check-${t}`} />
            </Cluster>
          </Stack>
        </Section>
      ))}
    </>
  ),
  // A raised and an outline Card inside every tone (S26, D-080): the raised one
  // restores the base roles, the outline one follows the tone around it.
  "card-tones": (
    <>
      {(["canvas", "subtle", "inverse", "brand"] as SectionTone[]).map((t) => (
        <Section key={t} tone={t} padding="sm" data-testid={`ctone-${t}`}>
          <Cluster gap="md" align="start">
            {(["raised", "outline"] as const).map((v) => (
              <Card key={v} variant={v} data-testid={`card-${v}-${t}`}>
                <CardHeader>
                  <CardTitle data-testid={`ctitle-${v}-${t}`}>Title</CardTitle>
                  <CardDescription data-testid={`cmuted-${v}-${t}`}>
                    Description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Text data-testid={`ctext-${v}-${t}`}>Body</Text>{" "}
                  <Link href="#x" data-testid={`clink-${v}-${t}`}>
                    Link
                  </Link>
                </CardContent>
                <CardFooter>
                  <Button data-testid={`cprimary-${v}-${t}`}>Primary</Button>
                  <Button
                    variant="secondary"
                    data-testid={`csecondary-${v}-${t}`}
                  >
                    Secondary
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </Cluster>
        </Section>
      ))}
    </>
  ),
  // Tabs on a light and a dark tone, plus a vertical list.
  tabs: (
    <>
      {(["canvas", "inverse"] as SectionTone[]).map((t) => (
        <Section key={t} tone={t} padding="sm" data-testid={`ttone-${t}`}>
          <Tabs defaultValue="one">
            <TabsList aria-label={`Tabs on ${t}`}>
              <TabsTrigger value="one" data-testid={`tab-one-${t}`}>
                One
              </TabsTrigger>
              <TabsTrigger value="two" data-testid={`tab-two-${t}`}>
                Two
              </TabsTrigger>
              <TabsTrigger value="three" data-testid={`tab-three-${t}`}>
                Three
              </TabsTrigger>
            </TabsList>
            <TabsContent value="one">First panel</TabsContent>
            <TabsContent value="two">Second panel</TabsContent>
            <TabsContent value="three">Third panel</TabsContent>
          </Tabs>
        </Section>
      ))}
    </>
  ),
  "tabs-vertical": (
    <Tabs defaultValue="one" orientation="vertical">
      <TabsList aria-label="Vertical tabs">
        <TabsTrigger value="one" data-testid="vtab-one">
          One
        </TabsTrigger>
        <TabsTrigger value="two" data-testid="vtab-two">
          Two
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">First panel</TabsContent>
      <TabsContent value="two">Second panel</TabsContent>
    </Tabs>
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
