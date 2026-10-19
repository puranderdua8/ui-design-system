export const categories = [
  {
    slug: "typography",
    title: "Typography",
    description:
      "Text and Heading, with the element chosen apart from the look.",
    since: null,
  },
  {
    slug: "layout",
    title: "Layout",
    description: "Container, Grid, Stack, Cluster, Section, Split and Sidebar.",
    since: "0.3",
  },
  {
    slug: "forms",
    title: "Forms",
    description: "Label, Field, Input, Checkbox, RadioGroup and Select.",
    since: "0.4",
  },
  {
    slug: "actions",
    title: "Actions",
    description: "Button variants and sizes, and a button that renders a link.",
    since: null,
  },
  {
    slug: "display",
    title: "Display",
    description: "Card, Tabs and Banner.",
    since: "0.5",
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];
