import { Heading, Link, Stack, Text } from "@puranderdua/ui";

/** An article: a title, a byline, a lead, body text with links and a sub-heading. */
export const ArticlePage = () => (
  <article className="w-full max-w-prose">
    <Stack gap="md">
      <Heading as="h3" variant="h1">
        Why small teams keep better lists
      </Heading>
      <Text variant="caption">By Sam Rivera · 4 minute read</Text>
      <Text variant="lead">
        A short list you trust beats a long one you avoid.
      </Text>
      <Text>
        Most lists grow until nobody wants to open them. The teams that keep
        going do one thing differently: they decide, each week, what is allowed
        to stay. Read more about <Link href="#">how they choose</Link> before
        you try it yourself.
      </Text>
      <Heading as="h4" variant="h3">
        Start with three things
      </Heading>
      <Text>
        Pick the three things that would make the week feel done. Write them
        where everyone can see them. Everything else waits, and that is fine.
      </Text>
      <Text>
        When a new task arrives, ask whether it beats one of the three. If it
        does, swap it in. If it does not, it goes on the shelf, where you can
        find it later. <Link href="#">See an example week</Link>.
      </Text>
    </Stack>
  </article>
);
