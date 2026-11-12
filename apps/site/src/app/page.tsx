import NextLink from "next/link";
import {
  Button,
  Cluster,
  Container,
  Heading,
  Link,
  Stack,
  Text,
} from "@puranderdua/ui";
import { githubUrl } from "@/lib/site";

const Home = () => (
  <main id="main" tabIndex={-1} className="py-ds-section-md">
    <Container size="md">
      <Stack gap="xl">
        <Stack gap="lg">
          <Text as="span" variant="caption" className="text-ds-text-muted">
            Portfolio · Design systems
          </Text>
          <Heading
            as="h1"
            variant="display"
            className="text-balance break-words"
          >
            Interfaces built from tokens
          </Heading>
          <Text variant="lead">
            I design and build token-driven systems that carry one set of
            decisions from a JSON file to the buttons on this page.
          </Text>
          <Cluster gap="md" align="center">
            <Button variant="primary" asChild>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                Get in touch
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="#approach">Read the approach</a>
            </Button>
          </Cluster>
        </Stack>

        <Stack as="section" id="approach" gap="lg" className="scroll-mt-8">
          <Heading as="h2" variant="h2">
            One source of truth
          </Heading>
          <Text>
            Every colour, size and spacing value on this site starts as a design
            token. Primitives hold the raw palette, semantic tokens give those
            values roles, and a thin Tailwind layer turns the roles into
            classes. Components only ever see the roles.
          </Text>
          <Text>
            Changing the brand colour is a one-line edit. The build regenerates
            the CSS, the contrast checks run, and every component follows
            without being touched.
          </Text>

          <Heading as="h3" variant="h3">
            One package to consume
          </Heading>
          <Text>
            Every component on this page comes from a single npm package, pinned
            to an exact version. There are no copied sources to keep in sync.
            Browse them in the{" "}
            <Link asChild>
              <NextLink href="/components">component showcase</NextLink>
            </Link>
            , or find the source on{" "}
            <Link href={githubUrl} external>
              GitHub
            </Link>
            .
          </Text>

          <Heading as="h3" variant="h3">
            Accessible by default
          </Heading>
          <Text>
            Text colours meet WCAG AA contrast against their surfaces, the focus
            ring is a token rather than an afterthought, and the page reads
            cleanly at 320px wide and at 200% zoom.
          </Text>
        </Stack>
      </Stack>
    </Container>
  </main>
);

export default Home;
