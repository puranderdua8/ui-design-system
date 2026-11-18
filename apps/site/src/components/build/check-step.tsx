"use client";

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { Button, Cluster, Heading, Stack, Text } from "@puranderdua/ui";
import { builderContent as content, type StepId } from "@/content/builder";
import {
  detailsLine,
  fixable,
  fixAll,
  checkedCount,
  shownText,
} from "@/playground/check";
import { contrastSpec, themeMaps } from "@/playground/data";
import { explain, type CauseId, type Explanation } from "@/playground/explain";
import { fix, type FixResult } from "@/playground/fix";
import { clearFlags, flagPlaces } from "@/playground/show-me";
import { currentChoice, getStep, stepHref } from "@/playground/steps";
import { setState, undo } from "@/playground/store";
import type {
  ContrastReport,
  PlaygroundState,
  ResolvedTheme,
} from "@/playground/types";

const { check, buttons, status } = content;

/** Every decision before Check, each linked to its step. */
const decisions: readonly StepId[] = [
  "start",
  "colour",
  "typography",
  "shape",
  "spacing",
  "depth",
];

type Done = { key: string; fixes: FixResult[]; remaining: number };

const fill = (text: string, values: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

const Swatch = ({ colour }: { colour: string }) => (
  <span
    aria-hidden="true"
    className="ds-border inline-block size-5 rounded-ds-control border-ds-border align-middle"
    style={{ backgroundColor: colour }}
  />
);

/** The exact pair of one failing result, drawn as it is. The sentence says it in words. */
const Sample = ({ example }: { example: Explanation["example"] }) => (
  <span
    aria-hidden="true"
    data-testid="check-sample"
    className="ds-border inline-block rounded-ds-control border-ds-border px-ds-gap-md py-ds-gap-sm"
    style={{ color: example.fgValue, backgroundColor: example.bgValue }}
  >
    {check.sampleText}
  </span>
);

/**
 * Check (spec 4.5): what is hard to read, by cause, with a sample, "Show me" and "Fix it
 * for me"; "Fix all"; the numbers for people who want them; and every decision made,
 * each with a link to its step. A fix is one `setState`, so Undo takes it back whole.
 */
export const CheckStep = ({
  state,
  report,
  resolved,
}: {
  state: PlaygroundState;
  report: ContrastReport;
  resolved: ResolvedTheme;
}) => {
  const explanations = useMemo(
    () => explain(report, resolved, state),
    [report, resolved, state],
  );
  const [showing, setShowing] = useState<CauseId | null>(null);
  const [places, setPlaces] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [noFix, setNoFix] = useState<CauseId | null>(null);

  const stateKey = JSON.stringify(state);
  const active =
    showing && explanations.some((e) => e.cause === showing) ? showing : null;

  // "Show me": outline the places; keep them outlined as the example page changes.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-testid="preview"]');
    if (!root || active === null) return;
    const results = explanations.find((e) => e.cause === active)?.results ?? [];
    let frame = 0;
    const apply = () => setPlaces(flagPlaces(root, results));
    apply();
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearFlags(root);
    };
  }, [active, explanations]);

  const context = { themes: themeMaps, spec: contrastSpec };

  const fixOne = (cause: CauseId) => {
    const result = fix(cause, state, context);
    if (!result || !result.changed) {
      setNoFix(cause);
      return;
    }
    setNoFix(null);
    setState(result.state);
    setDone({
      key: JSON.stringify(result.state),
      fixes: [result],
      remaining: result.totalAfter,
    });
  };

  const fixEverything = () => {
    const result = fixAll(state, context);
    if (!result.changed) {
      setNoFix("other");
      return;
    }
    setNoFix(null);
    setState(result.state);
    setDone({
      key: JSON.stringify(result.state),
      fixes: result.fixes,
      remaining: result.totalAfter,
    });
  };

  // A result is shown only while the project is still the one the fix made.
  const fixed = done && done.key === stateKey ? done : null;
  const canFix = explanations.some((e) => fixable(e.cause));
  const ordered = [...report.results].sort(
    (a, b) => Number(a.ok) - Number(b.ok) || (a.ratio ?? 0) - (b.ratio ?? 0),
  );

  return (
    <Stack gap="md">
      {fixed ? (
        <div
          data-testid="check-fixed"
          className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
        >
          <Stack gap="sm">
            <Heading as="h3" variant="h3">
              {check.fixedTitle}
            </Heading>
            <Text>{status.fixed}</Text>
            {fixed.fixes.map((result) => (
              <Cluster key={result.cause} gap="md" align="center">
                <Text as="span" variant="caption">
                  {check.before}
                </Text>
                <Swatch colour={result.before.colour} />
                <Text as="span" variant="caption">
                  {check.after}
                </Text>
                <Swatch colour={result.after.colour} />
              </Cluster>
            ))}
            <Text variant="caption">
              {fixed.remaining === 0
                ? check.allFixed
                : fill(check.fixedSummary, { count: fixed.remaining })}
            </Text>
            <Cluster>
              <Button variant="secondary" size="sm" onClick={undo}>
                {buttons.undo}
              </Button>
            </Cluster>
          </Stack>
        </div>
      ) : null}

      {explanations.length === 0 ? (
        <Text data-testid="check-all-readable" className="font-semibold">
          {fill(status.allReadable, { count: checkedCount(report.results) })}
        </Text>
      ) : (
        <Stack gap="md">
          <ul
            aria-label={getStep("check").question}
            className="m-0 flex list-none flex-col gap-ds-gap-md p-0"
          >
            {explanations.map((item) => {
              const isShowing = active === item.cause;
              return (
                <li
                  key={item.cause}
                  data-testid={`cause-${item.cause}`}
                  className="ds-border rounded-ds-card border-ds-border p-ds-gap-md"
                >
                  <Stack gap="sm">
                    <Text>{item.sentence}</Text>
                    <Cluster gap="sm" align="center">
                      <Sample example={item.example} />
                      <Text as="span" variant="caption">
                        {check.sampleLabel}
                      </Text>
                    </Cluster>
                    <Cluster gap="md">
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-pressed={isShowing}
                        onClick={() =>
                          setShowing(isShowing ? null : item.cause)
                        }
                      >
                        {isShowing ? check.hideIt : buttons.showMe}
                      </Button>
                      {fixable(item.cause) ? (
                        <Button size="sm" onClick={() => fixOne(item.cause)}>
                          {buttons.fixIt}
                        </Button>
                      ) : null}
                    </Cluster>
                    {isShowing ? (
                      <Text variant="caption" data-testid="check-shown">
                        {shownText(places)}
                      </Text>
                    ) : null}
                    {noFix === item.cause ? (
                      <Text variant="caption" data-testid="check-no-fix">
                        {check.noFix}
                      </Text>
                    ) : null}
                  </Stack>
                </li>
              );
            })}
          </ul>
          {canFix && explanations.length > 1 ? (
            <Cluster>
              <Button onClick={fixEverything}>{check.fixAll}</Button>
            </Cluster>
          ) : null}
          {noFix === "other" ? (
            <Text variant="caption" data-testid="check-no-fix">
              {check.noFix}
            </Text>
          ) : null}
        </Stack>
      )}

      <details data-testid="check-details">
        <summary className="ds-focus-ring ds-hit-area cursor-pointer font-semibold">
          {getStep("check").fineTune}
        </summary>
        <ul className="m-0 max-h-64 list-none overflow-y-auto p-0 pt-ds-gap-sm">
          {report.failing === 0 ? (
            <li>
              <Text variant="caption">{check.detailsNone}</Text>
            </li>
          ) : null}
          {ordered.map((result, index) => (
            <li key={index}>
              <Text variant="caption">{detailsLine(result)}</Text>
            </li>
          ))}
        </ul>
      </details>

      <Stack gap="sm">
        <Heading as="h3" variant="h3">
          {check.builtTitle}
        </Heading>
        <Text>{check.builtLead}</Text>
        <ul className="m-0 flex list-none flex-col gap-ds-gap-sm p-0">
          {decisions.map((id) => (
            <li key={id} data-testid={`built-${id}`}>
              <NextLink
                href={stepHref(id)}
                className="ds-focus-ring ds-hit-area text-ds-link font-semibold underline underline-offset-4"
              >
                {getStep(id).name}
              </NextLink>
              : {currentChoice(id, state).lines.join(", ")}
            </li>
          ))}
        </ul>
      </Stack>
    </Stack>
  );
};
