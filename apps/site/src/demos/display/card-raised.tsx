import {
  Button,
  Card,
  CardContent,
  CardTitle,
  Section,
  Text,
} from "@puranderdua/ui";

export const Demo = () => (
  <>
    <Section tone="subtle" padding="sm" container="sm">
      <Card variant="raised">
        <CardContent>
          <CardTitle as="h3">Raised on subtle</CardTitle>
          <Text>A lifted surface with its own shadow.</Text>
        </CardContent>
      </Card>
    </Section>
    <Section tone="inverse" padding="sm" container="sm">
      <Card variant="raised">
        <CardContent>
          <CardTitle as="h3">Raised on inverse</CardTitle>
          <Text>
            It restores the base text, link and button colours, so it stays
            readable.
          </Text>
          <Button size="sm">Action</Button>
        </CardContent>
      </Card>
    </Section>
  </>
);
