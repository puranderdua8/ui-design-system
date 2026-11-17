"use client";

import { useState, type FormEvent, type MouseEvent } from "react";
import {
  cn,
  Heading,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeScope,
  ToggleGroup,
  ToggleGroupItem,
} from "@puranderdua/ui";
import { builderContent } from "@/content/builder";
import { AllComponentsPage } from "@/components/preview/all-components";
import { ArticlePage } from "@/components/preview/article";
import { LandingPage } from "@/components/preview/landing";
import { SettingsPage } from "@/components/preview/settings";
import { SignupPage } from "@/components/preview/signup";
import type { ThemeName, VarMap } from "@/playground/types";

const { shell, preview: text } = builderContent;

type PreviewProps = { theme: ThemeName; vars: VarMap };
type Width = keyof typeof text.widths;
type Page = keyof typeof text.pages;

const pageIds = ["landing", "signup", "settings", "article", "all"] as const;
const widthIds = ["phone", "tablet", "desktop"] as const;

// Static maps (no dynamic class names). The frame is a container, so the package's
// layout follows its width, not the window's: Phone is 24rem, Tablet 48rem.
const widthClasses: Record<Width, string> = {
  phone: "max-w-sm",
  tablet: "max-w-3xl",
  desktop: "max-w-none",
};

const pages: Record<Page, () => React.ReactNode> = {
  landing: () => <LandingPage />,
  signup: () => <SignupPage />,
  settings: () => <SettingsPage />,
  article: () => <ArticlePage />,
  all: () => <AllComponentsPage />,
};

// Examples never leave the page: a link does not navigate, a form does not submit.
const stopLinks = (event: MouseEvent) => {
  if ((event.target as Element).closest("a")) event.preventDefault();
};
const stopForms = (event: FormEvent) => event.preventDefault();

/**
 * The five example pages and the width switch (spec 4.8). The page around it owns the
 * one labelled region and its skip link; this adds no landmark of its own, and its
 * headings sit below the tool's (the title is an h2, the pages start at h3).
 *
 * The resolved map is applied by a `ThemeScope`: everything inside reads it, and the
 * Select popovers and dialogs portal to the body and re-apply the scope's theme.
 */
export const Preview = ({ theme, vars }: PreviewProps) => {
  const [page, setPage] = useState<Page>("landing");
  const [width, setWidth] = useState<Width>("desktop");

  return (
    <ThemeScope
      theme={theme}
      vars={vars}
      data-testid="preview"
      onClickCapture={stopLinks}
      onSubmitCapture={stopForms}
      className="ds-tone-canvas ds-border rounded-ds-card border-ds-border p-ds-gap-lg font-ds-body"
    >
      <Stack gap="lg">
        <Heading as="h2" variant="h2">
          {shell.previewHeading}
        </Heading>
        <ToggleGroup
          type="single"
          value={width}
          onValueChange={(next) => {
            if (next) setWidth(next as Width);
          }}
          aria-label={text.widthLabel}
        >
          {widthIds.map((id) => (
            <ToggleGroupItem key={id} value={id}>
              {text.widths[id]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Tabs
          value={page}
          onValueChange={(next) => setPage(next as Page)}
          className="w-full"
        >
          {/* Five names do not fit a narrow pane: they wrap to a second row instead of
              hiding behind a sideways scroll. */}
          <TabsList
            aria-label={text.pagesLabel}
            className="group-data-[orientation=horizontal]/tabs:flex-wrap group-data-[orientation=horizontal]/tabs:overflow-x-visible"
          >
            {pageIds.map((id) => (
              <TabsTrigger key={id} value={id}>
                {text.pages[id]}
              </TabsTrigger>
            ))}
          </TabsList>
          {pageIds.map((id) => (
            <TabsContent key={id} value={id}>
              <div
                data-testid="preview-frame"
                data-width={width}
                className={cn("@container mx-auto w-full", widthClasses[width])}
              >
                {pages[id]()}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Stack>
    </ThemeScope>
  );
};
