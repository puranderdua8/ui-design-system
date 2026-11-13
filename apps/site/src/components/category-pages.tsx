import type { ReactNode } from "react";
import { Text } from "@puranderdua/ui";
import { Example } from "@/components/example";
import type { CategorySlug } from "@/lib/categories";

const Typography = () => (
  <>
    <Example
      title="Heading variants"
      description="The variant sets the look. The element is chosen separately."
      demo="typography/heading-variants"
      fill
    />
    <Example title="Text variants" demo="typography/text-variants" fill />
    <Example
      title="as versus variant"
      description="A display-sized heading can be any level, and lead text can be a span."
      demo="typography/as-versus-variant"
      fill
    />
  </>
);

const Actions = () => (
  <>
    <Example title="Variants and sizes" demo="actions/button-variants" />
    <Example title="Disabled" demo="actions/button-disabled" />
    <Example
      title="As a link"
      description="asChild renders the child element with the button styles."
      demo="actions/button-as-link"
    />
    <Example
      title="Inline link"
      description="In running text the underline is always on, so the link is not marked by colour alone."
      demo="actions/link-inline"
    />
    <Example
      title="Standalone link"
      description="For navigation and call-to-action rows. The underline appears on hover and focus."
      demo="actions/link-standalone"
    />
    <Example
      title="External link"
      description="Opens in a new tab with rel set, an icon, and a screen-reader hint."
      demo="actions/link-external"
    />
    <Example
      title="With next/link"
      description="asChild merges the link styles onto next/link, so navigation stays client-side."
      demo="actions/link-next"
    />
  </>
);

const Forms = () => (
  <>
    <Example
      title="Input"
      description="Sizes, required, invalid and disabled. Field links the label, help text and error to the control."
      demo="forms/input-states"
      fill
    />
    <Example
      title="Checkbox"
      description="A Field with the inline layout puts the control first and the label beside it."
      demo="forms/checkbox-states"
    />
    <Example
      title="RadioGroup"
      description="A group of controls takes a Fieldset: the legend names the group, and the description and error belong to it."
      demo="forms/radio-group"
      fill
    />
    <Example
      title="Select"
      description="Built on Radix Select. The list takes a container, so it can render inside a themed scope."
      demo="forms/select-states"
      fill
    />
    <Example
      title="Form with validation"
      description="Submit it empty to see the errors. Each message is linked to its control with aria-describedby and announced when it appears. After a failed submit, focus moves to the first invalid control."
      demo="forms/signup-form"
      fill
    />
  </>
);

const Layout = () => (
  <>
    <Text variant="caption" className="text-ds-text-muted">
      Box is a placeholder block used only in these demos; it is not part of the
      package.
    </Text>
    <Example
      title="Container"
      description="Centres content and caps its width. Sizes run sm to xl, or full."
      demo="layout/container"
      fill
    />
    <Example
      title="Grid"
      description="cols sets a fixed count. minItemWidth fits as many columns as the width allows."
      demo="layout/grid"
      fill
    />
    <Example
      title="Stack"
      description="Vertical rhythm from the gap tokens."
      demo="layout/stack"
      fill
    />
    <Example
      title="Cluster"
      description="Items sit in a row and wrap when the space runs out."
      demo="layout/cluster"
      fill
    />
    <Example
      title="Section"
      description="A full-width band with a tone and padding from the section tokens."
      demo="layout/section"
      fill
    />
    <Example
      title="Split"
      description="Two columns in a chosen ratio. They stack when their container is too narrow."
      demo="layout/split"
      fill
    />
    <Example
      title="Sidebar"
      description="A fixed-width aside beside flexible content. The content wraps below the aside when its container is too narrow, and the aside stays first in the DOM."
      demo="layout/sidebar"
      fill
    />
  </>
);

const Display = () => (
  <>
    <Example
      title="Card grid"
      description="Cards in a list inside a Grid that fits as many columns as the width allows. Each card is a li, and its title is an h3 under this page's section heading."
      demo="display/card-grid"
      fill
    />
    <Example
      title="Raised Card"
      description="A raised Card restores the base text, link and button colours, so it stays readable inside an inverse or brand Section."
      demo="display/card-raised"
      fill
    />
    <Example
      title="Tabs"
      description="Arrow keys move between tabs, Home and End jump to the first and last, and a disabled tab is skipped."
      demo="display/tabs"
      fill
    />
    <Example
      title="Banner tones"
      description="canvas, brand, inverse and gradient. These demos use the tall height and a div; a page hero uses the default full-screen height."
      demo="display/banner-tones"
      fill
    />
    <Example
      title="Banner with an image"
      description="The media slot takes any img. A scrim sits between it and the content; strong keeps light text at 7:1 over the lightest pixel."
      demo="display/banner-image"
      fill
    />
    <Example
      title="Banner with video"
      description="The clip is a small CC0 sample served from this site. Under prefers-reduced-motion only the poster shows."
      demo="display/banner-video"
      fill
    />
  </>
);

export const categoryContent: Record<CategorySlug, () => ReactNode> = {
  typography: Typography,
  layout: Layout,
  forms: Forms,
  actions: Actions,
  display: Display,
};
