import type { ReactNode } from "react";
import { Text } from "@puranderdua/ui";
import { Example } from "@/components/example";
import type { CategorySlug } from "@/lib/categories";
import { Demo as AsVersusVariant } from "@/demos/typography/as-versus-variant";
import { Demo as HeadingVariants } from "@/demos/typography/heading-variants";
import { Demo as TextVariants } from "@/demos/typography/text-variants";
import { Demo as ButtonAsLink } from "@/demos/actions/button-as-link";
import { Demo as ButtonDisabled } from "@/demos/actions/button-disabled";
import { Demo as ButtonVariants } from "@/demos/actions/button-variants";
import { Demo as LinkExternal } from "@/demos/actions/link-external";
import { Demo as LinkInline } from "@/demos/actions/link-inline";
import { Demo as LinkNext } from "@/demos/actions/link-next";
import { Demo as LinkStandalone } from "@/demos/actions/link-standalone";
import { Demo as ClusterDemo } from "@/demos/layout/cluster";
import { Demo as ContainerDemo } from "@/demos/layout/container";
import { Demo as GridDemo } from "@/demos/layout/grid";
import { Demo as SectionDemo } from "@/demos/layout/section";
import { Demo as SidebarDemo } from "@/demos/layout/sidebar";
import { Demo as SplitDemo } from "@/demos/layout/split";
import { Demo as StackDemo } from "@/demos/layout/stack";

const Typography = () => (
  <>
    <Example
      title="Heading variants"
      description="The variant sets the look. The element is chosen separately."
      demo="typography/heading-variants"
      Demo={HeadingVariants}
      fill
    />
    <Example
      title="Text variants"
      demo="typography/text-variants"
      Demo={TextVariants}
      fill
    />
    <Example
      title="as versus variant"
      description="A display-sized heading can be any level, and lead text can be a span."
      demo="typography/as-versus-variant"
      Demo={AsVersusVariant}
      fill
    />
  </>
);

const Actions = () => (
  <>
    <Example
      title="Variants and sizes"
      demo="actions/button-variants"
      Demo={ButtonVariants}
    />
    <Example
      title="Disabled"
      demo="actions/button-disabled"
      Demo={ButtonDisabled}
    />
    <Example
      title="As a link"
      description="asChild renders the child element with the button styles."
      demo="actions/button-as-link"
      Demo={ButtonAsLink}
    />
    <Example
      title="Inline link"
      description="In running text the underline is always on, so the link is not marked by colour alone."
      demo="actions/link-inline"
      Demo={LinkInline}
    />
    <Example
      title="Standalone link"
      description="For navigation and call-to-action rows. The underline appears on hover and focus."
      demo="actions/link-standalone"
      Demo={LinkStandalone}
    />
    <Example
      title="External link"
      description="Opens in a new tab with rel set, an icon, and a screen-reader hint."
      demo="actions/link-external"
      Demo={LinkExternal}
    />
    <Example
      title="With next/link"
      description="asChild merges the link styles onto next/link, so navigation stays client-side."
      demo="actions/link-next"
      Demo={LinkNext}
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
      Demo={ContainerDemo}
      fill
    />
    <Example
      title="Grid"
      description="cols sets a fixed count. minItemWidth fits as many columns as the width allows."
      demo="layout/grid"
      Demo={GridDemo}
      fill
    />
    <Example
      title="Stack"
      description="Vertical rhythm from the gap tokens."
      demo="layout/stack"
      Demo={StackDemo}
      fill
    />
    <Example
      title="Cluster"
      description="Items sit in a row and wrap when the space runs out."
      demo="layout/cluster"
      Demo={ClusterDemo}
      fill
    />
    <Example
      title="Section"
      description="A full-width band with a tone and padding from the section tokens."
      demo="layout/section"
      Demo={SectionDemo}
      fill
    />
    <Example
      title="Split"
      description="Two columns in a chosen ratio. They stack on narrow screens."
      demo="layout/split"
      Demo={SplitDemo}
      fill
    />
    <Example
      title="Sidebar"
      description="A fixed-width aside beside flexible content. It stacks below the md breakpoint."
      demo="layout/sidebar"
      Demo={SidebarDemo}
      fill
    />
  </>
);

export const categoryContent: Partial<Record<CategorySlug, () => ReactNode>> = {
  typography: Typography,
  layout: Layout,
  actions: Actions,
};
