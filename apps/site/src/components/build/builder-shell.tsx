"use client";

import { useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import {
  Button,
  Cluster,
  Container,
  Heading,
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
import { CheckStep } from "./check-step";
import { ColourStep } from "./colour-step";
import { StartStep } from "./start-step";
import { DepthStep, ShapeStep, SpacingStep } from "./preset-steps";
import { TypographyStep } from "./typography-step";
import { UseStep } from "./use-step";
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
  const { view, hydrated, error, failing, report, vars, resolved } =
    useBuilder();

  const [collapsed, setCollapsed] = useState(false);
  const pinRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shownBefore) document.getElementById(headingId)?.focus();
    shownBefore = true;
  }, [step]);

  // The pinned preview must never hide the focused control (2.4.11): the page scrolls
  // clear of its height. Only the sticky (narrow) layout needs it; wide, the pin sits
  // beside the steps and the height is 0.
  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const root = document.documentElement;
    const measure = () =>
      root.style.setProperty(
        "scroll-padding-top",
        getComputedStyle(pin).position === "sticky" &&
          getComputedStyle(pin).gridColumnStart === "auto"
          ? `${pin.offsetHeight}px`
          : "0px",
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    return () => {
      observer.disconnect();
      root.style.removeProperty("scroll-padding-top");
    };
  }, []);

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
          <a href="#steps" className={skip}>
            {shell.skipToSteps}
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
              width the steps and the preview sit side by side and the preview is
              pinned on the right; narrower (a phone), the preview comes first and is
              pinned on top, collapsible, with the steps below it. The preview is first
              in the page too, so what you see is the order a screen reader reads
              (D-164); the wide layout places the columns by grid line. */}
          <div className="@container">
            <div className="grid grid-cols-1 items-start gap-ds-gap-xl @4xl:grid-cols-2">
              <section
                id="preview"
                tabIndex={-1}
                aria-label={shell.previewLabel}
                data-testid="preview-pin"
                data-collapsed={collapsed}
                ref={pinRef}
                className="ds-layer-sticky sticky top-0 bg-ds-canvas py-ds-gap-sm @4xl:col-start-2 @4xl:row-start-1 @4xl:max-h-dvh @4xl:overflow-y-auto @4xl:py-0"
              >
                <div className="@4xl:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-expanded={!collapsed}
                    aria-controls="preview-body"
                    onClick={() => setCollapsed((value) => !value)}
                  >
                    {collapsed ? shell.showPreview : shell.hidePreview}
                  </Button>
                </div>
                <div
                  id="preview-body"
                  className={
                    collapsed
                      ? "@max-4xl:hidden"
                      : "@max-4xl:max-h-[40dvh] @max-4xl:overflow-y-auto"
                  }
                >
                  <Preview theme={view.state.start} vars={vars} />
                </div>
              </section>
              <nav
                id="steps"
                tabIndex={-1}
                aria-label={shell.stepListLabel}
                className="@4xl:col-start-1 @4xl:row-start-1"
              >
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
                              ) : step === "shape" ? (
                                <ShapeStep
                                  state={view.state}
                                  vars={resolved.vars as VarRecord}
                                />
                              ) : step === "spacing" ? (
                                <SpacingStep
                                  state={view.state}
                                  vars={resolved.vars as VarRecord}
                                />
                              ) : step === "depth" ? (
                                <DepthStep
                                  state={view.state}
                                  vars={resolved.vars as VarRecord}
                                />
                              ) : step === "check" ? (
                                <CheckStep
                                  state={view.state}
                                  report={report}
                                  resolved={resolved}
                                />
                              ) : step === "use" ? (
                                <UseStep
                                  state={view.state}
                                  resolved={resolved}
                                  failing={failing}
                                  name={
                                    view.projects.find(
                                      (project) =>
                                        project.id === view.currentId,
                                    )?.name ?? ""
                                  }
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
            </div>
          </div>
        </Stack>
      </Container>
    </main>
  );
};
