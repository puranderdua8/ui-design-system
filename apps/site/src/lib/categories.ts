export const categories = [
  {
    slug: "typography",
    title: "Typography",
    description:
      "Text and Heading, with the element chosen apart from the look.",
    components: ["Text", "Heading"],
  },
  {
    slug: "layout",
    title: "Layout",
    description: "Container, Grid, Stack, Cluster, Section, Split and Sidebar.",
    components: [
      "Container",
      "Grid",
      "Stack",
      "Cluster",
      "Section",
      "Split",
      "Sidebar",
    ],
  },
  {
    slug: "forms",
    title: "Forms",
    description:
      "Label, Field, Fieldset, Input, Checkbox, RadioGroup and Select.",
    components: [
      "Label",
      "Field",
      "Fieldset",
      "Input",
      "Checkbox",
      "RadioGroup",
      "Select",
    ],
  },
  {
    slug: "actions",
    title: "Actions",
    description:
      "Button variants and sizes, a button that renders a link, and Link itself.",
    components: ["Button", "Link"],
  },
  {
    slug: "display",
    title: "Display",
    description: "Card, Tabs and Banner.",
    components: ["Card", "Tabs", "Banner"],
  },
] as const;

export type Category = (typeof categories)[number];
export type CategorySlug = Category["slug"];
