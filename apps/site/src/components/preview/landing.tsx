import {
  Banner,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Cluster,
  Container,
  Grid,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@puranderdua/ui";

const features = [
  {
    title: "Plan the week",
    text: "See what is coming up and what can wait.",
    variant: "outline",
  },
  {
    title: "Share with the team",
    text: "Everyone works from the same list.",
    variant: "raised",
  },
  {
    title: "Highlights",
    text: "The things that matter most stand out.",
    variant: "accent",
  },
] as const;

/** A landing page: a hero, three cards, a band and a closing call to act. */
export const LandingPage = () => (
  <div>
    <Banner as="div" tone="canvas" className="min-h-0 py-ds-section-md">
      <Stack gap="md">
        <Heading as="h3" variant="h1">
          Get your week under control
        </Heading>
        <Text variant="lead">
          One calm place for plans, lists and reminders.
        </Text>
        <Cluster gap="md">
          <Button>Get started</Button>
          <Button variant="secondary">See how it works</Button>
        </Cluster>
      </Stack>
    </Banner>
    <Section as="div" padding="md">
      <Container size="lg">
        <Stack gap="lg">
          <Heading as="h4" variant="h2">
            Why people like it
          </Heading>
          <Grid cols={3} gap="md">
            {features.map((feature) => (
              <Card key={feature.title} variant={feature.variant}>
                <CardHeader>
                  <CardTitle as="h5">{feature.title}</CardTitle>
                  <CardDescription>{feature.text}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="#">Learn more</Link>
                </CardContent>
                <CardFooter>
                  <Text variant="caption">Free to try</Text>
                </CardFooter>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
    <Section as="div" tone="brand" padding="md">
      <Container size="md">
        <Stack gap="sm">
          <Heading as="h4" variant="h3">
            Ready when you are
          </Heading>
          <Text>
            Start with a blank week or bring your list. You can change your mind
            at any time. <Link href="#">Read the questions people ask</Link>.
          </Text>
        </Stack>
      </Container>
    </Section>
  </div>
);
