"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Heading,
  Stack,
  Text,
  ThemeScope,
} from "@puranderdua/ui";
import { Demo as ButtonVariants } from "@/demos/actions/button-variants";
import { Demo as LinkInline } from "@/demos/actions/link-inline";
import { Demo as BannerTones } from "@/demos/display/banner-tones";
import { Demo as CardGrid } from "@/demos/display/card-grid";
import { Demo as TabsDemo } from "@/demos/display/tabs";
import { Demo as InputStates } from "@/demos/forms/input-states";
import { Demo as SelectStates } from "@/demos/forms/select-states";
import { Demo as SignupForm } from "@/demos/forms/signup-form";
import type { ThemeName, VarMap } from "@/playground/types";

type PreviewProps = { theme: ThemeName; vars: VarMap };

const Sample = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section aria-label={title}>
    <Stack gap="sm">
      <Text variant="caption">{title}</Text>
      {children}
    </Stack>
  </section>
);

/**
 * The resolved map is applied by a `ThemeScope`: everything inside reads it, and the
 * Select popovers portal into the scope (`usePortalContainer`), so they stay themed.
 */
export const Preview = ({ theme, vars }: PreviewProps) => (
  <ThemeScope
    theme={theme}
    vars={vars}
    data-testid="preview"
    className="ds-tone-canvas ds-border rounded-ds-card border-ds-border p-ds-gap-lg font-ds-body"
  >
    <Stack gap="xl">
      <Heading as="h2" variant="h2">
        Preview
      </Heading>
      <Sample title="Actions">
        <ButtonVariants />
        <LinkInline />
      </Sample>
      <Sample title="Cards">
        <CardGrid />
        <Card variant="accent">
          <CardHeader>
            <CardTitle as="h4">Accent card</CardTitle>
            <CardDescription>Driven by the accent colour.</CardDescription>
          </CardHeader>
          <CardContent>
            <Text>Tabs below use the accent colour for the active tab.</Text>
          </CardContent>
        </Card>
      </Sample>
      <Sample title="Tabs">
        <TabsDemo />
      </Sample>
      <Sample title="Forms">
        <InputStates />
        <SelectStates />
        <SignupForm />
      </Sample>
      <Sample title="Banners">
        <BannerTones />
      </Sample>
    </Stack>
  </ThemeScope>
);
