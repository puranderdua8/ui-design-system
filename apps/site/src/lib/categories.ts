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
    since: null,
  },
  {
    slug: "forms",
    title: "Forms",
    description: "Label, Field, Input, Checkbox, RadioGroup and Select.",
    since: null,
  },
  {
    slug: "actions",
    title: "Actions",
    description:
      "Button variants and sizes, a button that renders a link, and Link itself.",
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
