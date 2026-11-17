"use client";

import { useEffect } from "react";
import NextLink from "next/link";
import {
  Button,
  Cluster,
  Container,
  Heading,
  Split,
  Stack,
  Text,
} from "@puranderdua/ui";
import { builderContent as content, type StepId } from "@/content/builder";
import { Preview } from "@/components/playground/preview";
import {
  currentChoice,
  getStep,
  neighbours,
  stepHref,
  stepIds,
} from "@/playground/steps";
import { ColourStep } from "./colour-step";
import { StartStep } from "./start-step";
import { TypographyStep } from "./typography-step";
import { useBuilder } from "./use-builder";

const { shell, buttons } = content;

type VarRecord = Record<string, string | number>;

// True once any Builder page has shown in this page load. The first load keeps the
// normal tab order (header, then the steps); every later step moves focus to the open
// step's heading, so a keyboard or screen-reader user lands where the change is (2.4.3).
let shownBefore = false;

const headingId = "step-heading";

const nextLabel = (id: StepId): string =>
  buttons.next.replace("{step}", getStep(id).name);
const backLabel = (id: StepId): string =>
  buttons.back.replace("{step}", getStep(id).name);

/**
 * The Guided panel (spec 4.3): one ordered list of links, the open step expanded under
 * its link, the others collapsed but readable, the preview pinned beside it. The
 * picture choices arrive in S53–S55; today each step shows its current choice.
 */
export const BuilderShell = ({ step }: { step: StepId }) => {
  const { view, hydrated, error, failing, vars, resolved } = useBuilder();

  useEffect(() => {
    if (shownBefore) document.getElementById(headingId)?.focus();
    shownBefore = true;
  }, [step]);

  const open = getStep(step);
  const { previous, next } = neighbours(step);
  const skip =
    "sr-only ds-focus-ring text-ds-link focus:not-sr-only focus:bg-ds-canvas focus:px-ds-gap-md focus:py-ds-gap-sm";

  return (
    <main
      id="main"
      tabIndex={-1}
      data-hydrated={hydrated}
      className="py-ds-section-sm"
    >
      <Container size="lg">
        <Stack gap="lg">
          <Heading as="h1" variant="h2">
            {shell.name}
          </Heading>
          <a href="#preview" className={skip}>
            {shell.skipToPreview}
          </a>
          {error ? (
            <div
              role="alert"
              className="ds-border rounded-ds-card border-ds-danger-border bg-ds-danger-bg p-ds-gap-md text-ds-danger-fg"
            >
              {content.errors.stateInvalid.message}{" "}
              {content.errors.stateInvalid.fix}
            </div>
          ) : null}
          {view.storage === "blocked" || view.storage === "full" ? (
            <div
              role="status"
              className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
            >
              {view.storage === "blocked"
                ? `${content.errors.storageBlocked.message} ${content.errors.storageBlocked.fix}`
                : `${content.errors.storageFull.message} ${content.errors.storageFull.fix}`}
            </div>
          ) : null}
          {/* The container query decides, not the viewport (D-064): from 56rem of
              width the panel and the preview sit side by side and the preview is
              pinned; narrower, the preview follows the steps and nothing sticks. */}
          <div className="@container">
            <Split ratio="1:1" align="start" gap="xl">
              <nav aria-label={shell.stepListLabel}>
                <ol className="m-0 flex list-none flex-col gap-ds-gap-md p-0">
                  {stepIds.map((id, index) => {
                    const item = getStep(id);
                    const isOpen = id === step;
                    const { lines, swatch } = currentChoice(
                      id,
                      view.state,
                      failing,
                    );
                    return (
                      <li
                        key={id}
                        className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
                      >
                        <Stack gap="sm">
                          <NextLink
                            href={stepHref(id)}
                            aria-current={isOpen ? "step" : undefined}
                            className="ds-focus-ring ds-hit-area text-ds-link font-semibold underline-offset-4 hover:underline aria-[current=step]:no-underline"
                          >
                            {index + 1}. {item.name}
                          </NextLink>
                          <Cluster gap="sm" align="center">
                            {swatch ? (
                              <span
                                aria-hidden="true"
                                className="ds-border inline-block size-4 rounded-ds-sm border-ds-border"
                                style={{ backgroundColor: swatch }}
                              />
                            ) : null}
                            <Text
                              variant="caption"
                              data-testid={`choice-${id}`}
                            >
                              {lines.join(", ")}
                            </Text>
                          </Cluster>
                          {isOpen ? (
                            <Stack gap="sm">
                              <Heading
                                as="h2"
                                variant="h3"
                                id={headingId}
                                tabIndex={-1}
                              >
                                {open.question}
                              </Heading>
                              <Text>{open.whatItIs}</Text>
                              <Text>{open.whereItShows}</Text>
                              {step === "start" ? (
                                <StartStep
                                  state={view.state}
                                  vars={resolved.vars as VarRecord}
                                />
                              ) : step === "colour" ? (
                                <ColourStep
                                  state={view.state}
                                  vars={resolved.vars as VarRecord}
                                />
                              ) : step === "typography" ? (
                                <TypographyStep
                                  state={view.state}
                                  vars={resolved.vars as VarRecord}
                                />
                              ) : open.groups.length > 0 ? (
                                <Text variant="caption">
                                  {shell.yourChoice}: {lines.join(", ")}.{" "}
                                  {shell.comingSoon}
                                </Text>
                              ) : null}
                              <Text variant="caption">{open.whyItMatters}</Text>
                              <Cluster gap="md">
                                {previous ? (
                                  <Button asChild variant="secondary" size="sm">
                                    <NextLink href={stepHref(previous)}>
                                      {backLabel(previous)}
                                    </NextLink>
                                  </Button>
                                ) : null}
                                {next ? (
                                  <Button asChild size="sm">
                                    <NextLink href={stepHref(next)}>
                                      {nextLabel(next)}
                                    </NextLink>
                                  </Button>
                                ) : null}
                              </Cluster>
                            </Stack>
                          ) : null}
                        </Stack>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <section
                id="preview"
                tabIndex={-1}
                aria-label={shell.previewLabel}
                data-testid="preview-pin"
                className="@4xl:sticky @4xl:top-0 @4xl:max-h-dvh @4xl:overflow-y-auto"
              >
                <Preview theme={view.state.start} vars={vars} />
              </section>
            </Split>
          </div>
        </Stack>
      </Container>
    </main>
  );
};
