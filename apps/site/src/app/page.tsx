import { Heading, Text } from "@puranderdua/ui";
import { Cta } from "@/components/cta";

const Home = () => {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-20">
      <header className="flex flex-col gap-6">
        <Text as="span" variant="caption" className="text-ds-text-muted">
          Portfolio · Design systems
        </Text>
        <Heading as="h1" variant="display" className="text-balance break-words">
          Interfaces built from tokens
        </Heading>
        <Text variant="lead">
          I design and build token-driven systems that carry one set of
          decisions from a JSON file to the buttons on this page.
        </Text>
        <Cta />
      </header>

      <article id="approach" className="flex flex-col gap-6 scroll-mt-8">
        <Heading as="h2" variant="h2">
          One source of truth
        </Heading>
        <Text>
          Every colour, size and spacing value on this site starts as a design
          token. Primitives hold the raw palette, semantic tokens give those
          values roles, and a thin Tailwind layer turns the roles into classes.
          Components only ever see the roles.
        </Text>
        <Text>
          Changing the brand colour is a one-line edit. The build regenerates
          the CSS, the contrast checks run, and every component follows without
          being touched.
        </Text>

        <Heading as="h3" variant="h3">
          One package to consume
        </Heading>
        <Text>
          Every component on this page comes from a single npm package, pinned
          to an exact version. There are no copied sources to keep in sync.
        </Text>
        <Text>
          Heading, Text and Button share the same tokens, so they sit side by
          side without any visual seams.
        </Text>

        <Heading as="h3" variant="h3">
          Accessible by default
        </Heading>
        <Text>
          Text colours meet WCAG AA contrast against their surfaces, the focus
          ring is a token rather than an afterthought, and the page reads
          cleanly at 320px wide and at 200% zoom.
        </Text>
      </article>

      <footer>
        <Text variant="caption" className="text-ds-text-muted">
          Built with @puranderdua/ui.
        </Text>
      </footer>
    </main>
  );
};

export default Home;
