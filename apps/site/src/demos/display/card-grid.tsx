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
          <Button variant="secondary" size="sm">
            Read more
          </Button>
        </CardFooter>
      </Card>
    ))}
  </Grid>
);
