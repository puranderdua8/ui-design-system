import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  Banner,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  Split,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ThemeScope,
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
    <Sidebar sidebarSide="end" sidebar={<Box id="a" />}>
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
    <Sidebar sidebarSide="end" sidebar={<button id="a">a</button>}>
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
  // R07: a container-query wrapper must not collapse to zero width in a flex
  // parent, and `className` must land on the element that is the flex item.
  "grid-in-cluster": (
    <Cluster gap="sm">
      <Grid cols={2} gap="sm" data-testid="outer">
        <Box id="a" />
        <Box id="b" />
      </Grid>
    </Cluster>
  ),
  "grid-in-stack-centre": (
    <Stack align="center">
      <Grid cols={2} gap="sm" data-testid="outer">
        <Box id="a" />
        <Box id="b" />
      </Grid>
    </Stack>
  ),
  "grid-in-stack-start-capped": (
    <Stack align="start">
      <Grid cols={2} gap="sm" className="max-w-ds-sm" data-testid="outer">
        <Box id="a" />
        <Box id="b" />
      </Grid>
    </Stack>
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
  // Banner (S27): every tone with the roles a component reads inside it, the
  // heights, and the scrim over the lightest possible image.
  "banner-tones": (
    <>
      {(["canvas", "brand", "inverse", "gradient"] as const).map((t) => (
        <Banner
          key={t}
          tone={t}
          height="tall"
          aria-label={`${t} banner`}
          data-testid={`banner-${t}`}
        >
          <Stack gap="sm" align="start">
            <Text data-testid={`btext-${t}`}>Body text</Text>
            <Text variant="caption" data-testid={`bmuted-${t}`}>
              Muted text
            </Text>
            <Link href="#x" data-testid={`blink-${t}`}>
              Link
            </Link>
            <Cluster gap="sm">
              <Button data-testid={`bprimary-${t}`}>Primary</Button>
              <Button variant="secondary" data-testid={`bsecondary-${t}`}>
                Secondary
              </Button>
            </Cluster>
          </Stack>
        </Banner>
      ))}
    </>
  ),
  "banner-heights": (
    <>
      <Banner height="screen" aria-label="Screen" data-testid="banner-screen">
        <Text>Screen</Text>
      </Banner>
      <Banner height="tall" aria-label="Tall" data-testid="banner-tall">
        <Text>Tall</Text>
      </Banner>
    </>
  ),
  "banner-media": (
    <>
      {(["strong", "medium"] as const).map((s) => (
        <Banner
          key={s}
          height="tall"
          scrim={s}
          aria-label={`${s} scrim`}
          data-testid={`banner-${s}`}
          media={
            <img
              alt=""
              src={`data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#ffffff"/></svg>')}`}
            />
          }
        >
          <Text data-testid={`mtext-${s}`}>Text over a white image</Text>
        </Banner>
      ))}
    </>
  ),
  "banner-video": (
    <Banner
      height="tall"
      aria-label="Video"
      data-testid="banner-video"
      video={{
        src: "/missing.mp4",
        poster: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#cccccc"/></svg>')}`,
      }}
    >
      <Text>Video</Text>
    </Banner>
  ),
  // R22: a ThemeScope inside an ancestor that clips and transforms. The open
  // list must still be fully visible and clickable.
  "select-clip": (
    <div
      data-testid="clip"
      style={{
        transform: "translateX(40px)",
        overflow: "hidden",
        height: 120,
      }}
    >
      <ThemeScope
        theme="nature"
        vars={{ "--ds-surface-raised": "rgb(10, 20, 30)" }}
        data-testid="scope"
      >
        <Select defaultValue="a">
          <SelectTrigger aria-label="Letter" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((v) => (
              <SelectItem key={v} value={v} data-testid={`opt-${v}`}>
                Option {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ThemeScope>
    </div>
  ),
  // R18: Tabs and RadioGroup under an RTL ThemeScope.
  "rtl-tabs": (
    <ThemeScope theme="base" vars={{}} dir="rtl">
      <Tabs defaultValue="one">
        <TabsList aria-label="RTL tabs">
          <TabsTrigger value="one" data-testid="rtab-one">
            One
          </TabsTrigger>
          <TabsTrigger value="two" data-testid="rtab-two">
            Two
          </TabsTrigger>
          <TabsTrigger value="three" data-testid="rtab-three">
            Three
          </TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
      </Tabs>
      <RadioGroup defaultValue="a" aria-label="RTL radios">
        {["a", "b", "c"].map((v) => (
          <RadioGroupItem
            key={v}
            value={v}
            aria-label={`radio ${v}`}
            data-testid={`rradio-${v}`}
          />
        ))}
      </RadioGroup>
    </ThemeScope>
  ),
  // R19: every state indicator, for the forced-colours tests.
  states: (
    <Stack gap="md">
      <Tabs defaultValue="one">
        <TabsList aria-label="State tabs">
          <TabsTrigger value="one" data-testid="stab-one">
            One
          </TabsTrigger>
          <TabsTrigger value="two" data-testid="stab-two">
            Two
          </TabsTrigger>
          <TabsTrigger value="three" disabled data-testid="stab-off">
            Three
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Cluster gap="md">
        <Checkbox defaultChecked aria-label="on" data-testid="check-on" />
        <Checkbox aria-label="off" data-testid="check-off" />
        <Checkbox disabled aria-label="disabled" data-testid="check-disabled" />
        <RadioGroup defaultValue="a">
          <RadioGroupItem value="a" aria-label="a" data-testid="radio-on" />
          <RadioGroupItem value="b" aria-label="b" data-testid="radio-off" />
        </RadioGroup>
      </Cluster>
      <Select defaultValue="b">
        <SelectTrigger aria-label="Pick" data-testid="state-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a" data-testid="sopt-a">
            A
          </SelectItem>
          <SelectItem value="b" data-testid="sopt-b">
            B
          </SelectItem>
          <SelectItem value="c" disabled data-testid="sopt-c">
            C
          </SelectItem>
        </SelectContent>
      </Select>
    </Stack>
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
