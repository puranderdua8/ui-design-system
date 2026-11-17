import type { DemoName } from "@/demos/registry";
import type { CategorySlug } from "@/lib/categories";

type ExampleSpec = {
  title: string;
  /** One plain line: what this component is for. */
  purpose: string;
  /** Technical detail, shown smaller under the purpose. */
  description?: string;
  demo: DemoName;
  fill?: boolean;
};

export type CategoryContent = {
  /** A line shown above the examples, when the page needs one. */
  note?: string;
  examples: ExampleSpec[];
};

const typography: CategoryContent = {
  examples: [
    {
      title: "Heading variants",
      purpose:
        "Titles in six sizes, from a big display line down to a small label.",
      description:
        "The variant sets the look. The element is chosen separately.",
      demo: "typography/heading-variants",
      fill: true,
    },
    {
      title: "Text variants",
      purpose: "Body copy, lead paragraphs, captions and labels in one voice.",
      demo: "typography/text-variants",
      fill: true,
    },
    {
      title: "as versus variant",
      purpose: "Pick how text looks without changing what it is on the page.",
      description:
        "A display-sized heading can be any level, and lead text can be a span.",
      demo: "typography/as-versus-variant",
      fill: true,
    },
  ],
};

const actions: CategoryContent = {
  examples: [
    {
      title: "Variants and sizes",
      purpose:
        "Buttons for the main action and for the quieter ones beside it.",
      demo: "actions/button-variants",
    },
    {
      title: "Disabled",
      purpose: "A button that is there but cannot be used yet.",
      demo: "actions/button-disabled",
    },
    {
      title: "As a link",
      purpose: "A link that looks like a button, for going somewhere.",
      description: "asChild renders the child element with the button styles.",
      demo: "actions/button-as-link",
    },
    {
      title: "Inline link",
      purpose:
        "A link inside a sentence that reads as a link without relying on colour.",
      description:
        "In running text the underline is always on, so the link is not marked by colour alone.",
      demo: "actions/link-inline",
    },
    {
      title: "Standalone link",
      purpose: "A link on its own line, for menus and rows of choices.",
      description:
        "For navigation and call-to-action rows. The underline appears on hover and focus.",
      demo: "actions/link-standalone",
    },
    {
      title: "External link",
      purpose: "A link to another site that tells people it leaves this one.",
      description:
        "Opens in a new tab with rel set, an icon, and a screen-reader hint.",
      demo: "actions/link-external",
    },
    {
      title: "With next/link",
      purpose: "A link between your own pages that stays fast.",
      description:
        "asChild merges the link styles onto next/link, so navigation stays client-side.",
      demo: "actions/link-next",
    },
  ],
};

const forms: CategoryContent = {
  examples: [
    {
      title: "Input",
      purpose:
        "A box for people to type a short answer, with its label and help.",
      description:
        "Sizes, required, invalid and disabled. Field links the label, help text and error to the control.",
      demo: "forms/input-states",
      fill: true,
    },
    {
      title: "Checkbox",
      purpose: "A tick box for a yes-or-no choice.",
      description:
        "A Field with the inline layout puts the control first and the label beside it.",
      demo: "forms/checkbox-states",
    },
    {
      title: "RadioGroup",
      purpose: "A short list where people pick exactly one option.",
      description:
        "A group of controls takes a Fieldset: the legend names the group, and the description and error belong to it.",
      demo: "forms/radio-group",
      fill: true,
    },
    {
      title: "Select",
      purpose: "A drop-down list for choosing one option from many.",
      description:
        "Built on Radix Select. The list takes a container, so it can render inside a themed scope.",
      demo: "forms/select-states",
      fill: true,
    },
    {
      title: "Form with validation",
      purpose: "A whole sign-up form that tells people what to fix.",
      description:
        "Submit it empty to see the errors. Each message is linked to its control with aria-describedby and announced when it appears. After a failed submit, focus moves to the first invalid control.",
      demo: "forms/signup-form",
      fill: true,
    },
  ],
};

const layout: CategoryContent = {
  note: "Box is a placeholder block used only in these demos; it is not part of the package.",
  examples: [
    {
      title: "Container",
      purpose: "Keeps content to a readable width and centres it.",
      description:
        "Centres content and caps its width. Sizes run sm to xl, or full.",
      demo: "layout/container",
      fill: true,
    },
    {
      title: "Grid",
      purpose: "Lays items out in columns that fit the space.",
      description:
        "cols sets a fixed count. minItemWidth fits as many columns as the width allows.",
      demo: "layout/grid",
      fill: true,
    },
    {
      title: "Stack",
      purpose: "Puts items in a column with even space between them.",
      description: "Vertical rhythm from the gap tokens.",
      demo: "layout/stack",
      fill: true,
    },
    {
      title: "Cluster",
      purpose: "Puts items in a row that wraps when there is no more room.",
      description: "Items sit in a row and wrap when the space runs out.",
      demo: "layout/cluster",
      fill: true,
    },
    {
      title: "Section",
      purpose:
        "A full-width band that gives a part of the page its own background.",
      description:
        "A full-width band with a tone and padding from the section tokens.",
      demo: "layout/section",
      fill: true,
    },
    {
      title: "Split",
      purpose: "Two side-by-side columns, such as text beside a picture.",
      description:
        "Two columns in a chosen ratio. They stack when their container is too narrow.",
      demo: "layout/split",
      fill: true,
    },
    {
      title: "Sidebar",
      purpose: "A narrow column beside the main content, like a menu or notes.",
      description:
        "A fixed-width aside beside flexible content. The content wraps below the aside when its container is too narrow, and the aside stays first in the DOM.",
      demo: "layout/sidebar",
      fill: true,
    },
  ],
};

const display: CategoryContent = {
  examples: [
    {
      title: "Card grid",
      purpose:
        "A set of boxed items, such as products or articles, side by side.",
      description:
        "Cards in a list inside a Grid that fits as many columns as the width allows. Each card is a li, and its title is an h3 under this page's section heading.",
      demo: "display/card-grid",
      fill: true,
    },
    {
      title: "Raised Card",
      purpose: "A box that lifts off a coloured band and stays easy to read.",
      description:
        "A raised Card restores the base text, link and button colours, so it stays readable inside an inverse or brand Section.",
      demo: "display/card-raised",
      fill: true,
    },
    {
      title: "Tabs",
      purpose: "Switches between related views without leaving the page.",
      description:
        "Arrow keys move between tabs, Home and End jump to the first and last, and a disabled tab is skipped.",
      demo: "display/tabs",
      fill: true,
    },
    {
      title: "Banner tones",
      purpose:
        "A big opening band for the top of a page, in four colour styles.",
      description:
        "canvas, brand, inverse and gradient. These demos use the tall height and a div; a page hero uses the default full-screen height.",
      demo: "display/banner-tones",
      fill: true,
    },
    {
      title: "Banner with an image",
      purpose: "An opening band over a photo, with text that stays readable.",
      description:
        "The media slot takes any img. A scrim sits between it and the content; strong keeps light text at 7:1 over the lightest pixel.",
      demo: "display/banner-image",
      fill: true,
    },
    {
      title: "Banner with video",
      purpose:
        "An opening band over a looping video that respects people who prefer less motion.",
      description:
        "The clip is a small CC0 sample served from this site. Under prefers-reduced-motion only the poster shows.",
      demo: "display/banner-video",
      fill: true,
    },
  ],
};

export const categoryContent: Record<CategorySlug, CategoryContent> = {
  typography,
  layout,
  forms,
  actions,
  display,
};
