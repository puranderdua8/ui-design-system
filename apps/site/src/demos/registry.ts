import type { ComponentType } from "react";
import { Demo as ButtonAsLink } from "@/demos/actions/button-as-link";
import { Demo as ButtonDisabled } from "@/demos/actions/button-disabled";
import { Demo as ButtonVariants } from "@/demos/actions/button-variants";
import { Demo as LinkExternal } from "@/demos/actions/link-external";
import { Demo as LinkInline } from "@/demos/actions/link-inline";
import { Demo as LinkNext } from "@/demos/actions/link-next";
import { Demo as LinkStandalone } from "@/demos/actions/link-standalone";
import { Demo as CheckboxStates } from "@/demos/forms/checkbox-states";
import { Demo as InputStates } from "@/demos/forms/input-states";
import { Demo as RadioGroupDemo } from "@/demos/forms/radio-group";
import { Demo as SelectStates } from "@/demos/forms/select-states";
import { Demo as SignupForm } from "@/demos/forms/signup-form";
import { Demo as ClusterDemo } from "@/demos/layout/cluster";
import { Demo as ContainerDemo } from "@/demos/layout/container";
import { Demo as GridDemo } from "@/demos/layout/grid";
import { Demo as SectionDemo } from "@/demos/layout/section";
import { Demo as SidebarDemo } from "@/demos/layout/sidebar";
import { Demo as SplitDemo } from "@/demos/layout/split";
import { Demo as StackDemo } from "@/demos/layout/stack";
import { Demo as AsVersusVariant } from "@/demos/typography/as-versus-variant";
import { Demo as HeadingVariants } from "@/demos/typography/heading-variants";
import { Demo as TextVariants } from "@/demos/typography/text-variants";

/**
 * The one list of demos. The key is the demo's path under `src/demos/` without
 * the extension; `Example` renders the component and shows the file with that
 * name, so the preview and the code beside it cannot drift.
 */
export const demos = {
  "typography/heading-variants": HeadingVariants,
  "typography/text-variants": TextVariants,
  "typography/as-versus-variant": AsVersusVariant,
  "actions/button-variants": ButtonVariants,
  "actions/button-disabled": ButtonDisabled,
  "actions/button-as-link": ButtonAsLink,
  "actions/link-inline": LinkInline,
  "actions/link-standalone": LinkStandalone,
  "actions/link-external": LinkExternal,
  "actions/link-next": LinkNext,
  "forms/input-states": InputStates,
  "forms/checkbox-states": CheckboxStates,
  "forms/radio-group": RadioGroupDemo,
  "forms/select-states": SelectStates,
  "forms/signup-form": SignupForm,
  "layout/container": ContainerDemo,
  "layout/grid": GridDemo,
  "layout/stack": StackDemo,
  "layout/cluster": ClusterDemo,
  "layout/section": SectionDemo,
  "layout/split": SplitDemo,
  "layout/sidebar": SidebarDemo,
} satisfies Record<string, ComponentType>;

export type DemoName = keyof typeof demos;
