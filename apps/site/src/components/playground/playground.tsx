"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Container, Heading, Split, Stack, Text } from "@puranderdua/ui";
import { evaluateContrast } from "@/playground/contrast";
import { contrastSpec, themeMaps } from "@/playground/data";
import { previewVars, safeResolve } from "@/playground/state";
import { getServerSnapshot, getSnapshot, subscribe } from "@/playground/store";
import { AdvancedPanel } from "./advanced-panel";
import { ContrastPanel } from "./contrast-panel";
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
  const vars = useMemo(() => previewVars(resolved.vars), [resolved]);

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
              Start from a theme, turn the knobs and watch the components
              change. Your last state is remembered in this browser.
            </Text>
          </Stack>
          {error ? (
            <div
              role="alert"
              className="ds-border rounded-ds-card border-ds-danger-border bg-ds-danger-bg p-ds-gap-md text-ds-danger-fg"
            >
              This state could not be applied ({error}). Showing the starting
              theme instead.
            </div>
          ) : null}
          <Split ratio="1:2" align="start" gap="xl">
            <Stack gap="xl">
              <KnobPanel state={state} resolved={resolved} />
              <ContrastPanel report={report} />
              <AdvancedPanel state={state} resolved={resolved} />
            </Stack>
            <Preview theme={state.start} vars={vars} />
          </Split>
        </Stack>
      </Container>
    </main>
  );
};
