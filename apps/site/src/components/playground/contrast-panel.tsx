"use client";

import { Heading, Stack, Text } from "@puranderdua/ui";
import type { ContrastReport, ContrastResult } from "@/playground/types";

const Badge = ({ result }: { result: ContrastResult }) => {
  const label = result.error
    ? "Error"
    : result.ok
      ? `Pass ${result.ratio!.toFixed(2)}:1`
      : `Fail ${result.ratio!.toFixed(2)}:1`;
  return (
    <span
      data-result={result.ok ? "pass" : "fail"}
      className={
        result.ok
          ? "ds-border rounded-ds-sm border-ds-border px-ds-gap-xs text-ds-text"
          : "ds-border rounded-ds-sm border-ds-danger-border bg-ds-danger-bg px-ds-gap-xs text-ds-danger-fg"
      }
    >
      {label}
    </span>
  );
};

const describe = (result: ContrastResult): string =>
  result.error
    ? `${result.fg} on ${result.bg}${result.tone}: ${result.error}`
    : `${result.fg} on ${result.bg}${result.tone} (needs ${result.min}:1)`;

const Row = ({ result }: { result: ContrastResult }) => (
  <li className="flex flex-wrap items-baseline gap-ds-gap-sm">
    <Badge result={result} />
    <span className="min-w-0 break-words">{describe(result)}</span>
  </li>
);

export const ContrastPanel = ({ report }: { report: ContrastReport }) => {
  const failing = report.results.filter((result) => !result.ok);
  const passing = report.results.filter((result) => result.ok);

  return (
    <Stack gap="md">
      <Heading as="h2" variant="h3">
        Contrast
      </Heading>
      <Text role="status" data-testid="contrast-summary">
        {failing.length === 0
          ? `All ${report.results.length} pairs pass.`
          : `${failing.length} of ${report.results.length} pairs fail.`}
      </Text>
      {failing.length > 0 ? (
        <ul
          className="flex flex-col gap-ds-gap-sm"
          role="list"
          aria-label="Failing pairs"
        >
          {failing.map((result, index) => (
            <Row key={index} result={result} />
          ))}
        </ul>
      ) : null}
      <details className="ds-border rounded-ds-card border-ds-border p-ds-gap-sm">
        <summary className="ds-focus-ring cursor-pointer font-semibold">
          Passing pairs ({passing.length})
        </summary>
        <ul className="mt-ds-gap-sm flex flex-col gap-ds-gap-sm" role="list">
          {passing.map((result, index) => (
            <Row key={index} result={result} />
          ))}
        </ul>
      </details>
    </Stack>
  );
};
