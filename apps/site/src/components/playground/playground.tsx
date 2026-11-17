"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Button,
  Container,
  Heading,
  Split,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from "@puranderdua/ui";
import { builderContent } from "@/content/builder";
import { evaluateContrast } from "@/playground/contrast";
import { contrastSpec, themeMaps } from "@/playground/data";
import { previewVars, safeResolve } from "@/playground/state";
import { getServerSnapshot, getSnapshot, subscribe } from "@/playground/store";
import { AdvancedPanel } from "./advanced-panel";
import { ContrastPanel } from "./contrast-panel";
import { ExportPanel } from "./export-panel";
import { KnobPanel } from "./knob-panel";
import { Preview } from "./preview";

const noopSubscribe = () => () => {};

export const Playground = () => {
  // Server and first client render use the default state; localStorage takes over
  // right after hydration.
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // False on the server and during hydration, true once handlers are attached
  // (the e2e tests wait for it before typing).
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const { resolved, error } = useMemo(
    () => safeResolve(state, themeMaps),
    [state],
  );
  const report = useMemo(
    () => evaluateContrast(resolved.vars, contrastSpec),
    [resolved],
  );
  const vars = useMemo(
    () => previewVars(resolved.vars, state.fonts),
    [resolved, state.fonts],
  );
  const failing = report.results.filter((result) => !result.ok).length;
  const [tab, setTab] = useState("design");

  return (
    <main
      id="main"
      tabIndex={-1}
      data-hydrated={hydrated}
      className="py-ds-section-sm"
    >
      <Container size="lg">
        <Stack gap="xl">
          <Stack gap="sm">
            <Heading as="h1" variant="h1">
              Playground
            </Heading>
            <Text variant="lead">
              Pick a starting look, change it to suit you and watch the examples
              update. Your last changes are remembered in this browser.
            </Text>
          </Stack>
          <a
            href="#preview"
            className="sr-only ds-focus-ring text-ds-link focus:not-sr-only focus:bg-ds-canvas focus:px-ds-gap-md focus:py-ds-gap-sm"
          >
            {builderContent.shell.skipToPreview}
          </a>
          {error ? (
            <div
              role="alert"
              className="ds-border rounded-ds-card border-ds-danger-border bg-ds-danger-bg p-ds-gap-md text-ds-danger-fg"
            >
              This state could not be applied ({error}). Showing the starting
              theme instead.
            </div>
          ) : null}
          {/* The container query decides, not the viewport (D-064): from 56rem of
              width the Split has two columns and the preview is pinned; narrower, it
              stacks as before and nothing sticks. */}
          <div className="@container">
            <Split ratio="1:1" align="start" gap="xl">
              <Stack gap="md">
                <Text
                  role="status"
                  data-testid="contrast-summary"
                  className="font-semibold"
                >
                  {failing === 0
                    ? `All ${report.results.length} combinations are readable.`
                    : `${failing} ${failing === 1 ? "thing" : "things"} to fix.`}
                </Text>
                {failing > 0 && tab !== "check" ? (
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setTab("check")}
                    >
                      See what to fix
                    </Button>
                  </div>
                ) : null}
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList aria-label="Controls">
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="check">Check</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="export">Export</TabsTrigger>
                  </TabsList>
                  <TabsContent value="design">
                    <KnobPanel state={state} resolved={resolved} />
                  </TabsContent>
                  <TabsContent value="check">
                    <ContrastPanel report={report} />
                  </TabsContent>
                  <TabsContent value="advanced">
                    <AdvancedPanel state={state} resolved={resolved} />
                  </TabsContent>
                  <TabsContent value="export">
                    <ExportPanel resolved={resolved} report={report} />
                  </TabsContent>
                </Tabs>
              </Stack>
              <section
                id="preview"
                tabIndex={-1}
                aria-label={builderContent.shell.previewLabel}
                data-testid="preview-pin"
                className="@4xl:sticky @4xl:top-0 @4xl:max-h-dvh @4xl:overflow-y-auto"
              >
                <Preview theme={state.start} vars={vars} />
              </section>
            </Split>
          </div>
        </Stack>
      </Container>
    </main>
  );
};
