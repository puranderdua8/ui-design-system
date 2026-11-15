import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Grid,
  Text,
} from "@puranderdua/ui";

const items = [
  { name: "Tokens", text: "One source of truth in DTCG JSON." },
  { name: "Themes", text: "Switch a theme by swapping one CSS file." },
  { name: "Components", text: "React 19 and Tailwind v4, no copy-in." },
];

export const Demo = () => (
  <Grid as="ul" minItemWidth="sm" gap="md" className="w-full">
    {items.map((item) => (
      <Card as="li" key={item.name}>
        <CardHeader>
          <CardTitle as="h3">{item.name}</CardTitle>
          <CardDescription>Part of the package</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>{item.text}</Text>
        </CardContent>
        <CardFooter>
          {/* The visible text is the start of the name (WCAG 2.5.3); the rest
              tells the three buttons apart (WCAG 2.4.6). */}
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Read more about ${item.name}`}
          >
            Read more
          </Button>
        </CardFooter>
      </Card>
    ))}
  </Grid>
);
