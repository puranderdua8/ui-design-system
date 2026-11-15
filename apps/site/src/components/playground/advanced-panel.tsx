"use client";

import { memo, useState } from "react";
import { Button, Heading, Input, Stack, Text } from "@puranderdua/ui";
import { themeMaps } from "@/playground/data";
import {
  asPickerColour,
  groupSemantic,
  semanticKeys,
  withOverride,
} from "@/playground/state";
import { getSnapshot, setState } from "@/playground/store";
import type { PlaygroundState, ResolvedTheme } from "@/playground/types";

type AdvancedPanelProps = { state: PlaygroundState; resolved: ResolvedTheme };

const shortName = (key: string) => key.replace(/^--ds-/, "");

// Reads the latest state itself, so the handler is stable and a row re-renders
// only when its own value or override changes (R32).
const edit = (key: string, value: string) =>
  setState(withOverride(getSnapshot(), key, value));

const TokenRow = memo(function TokenRow({
  tokenKey,
  value,
  overridden,
}: {
  tokenKey: string;
  value: string;
  overridden: boolean;
}) {
  const name = shortName(tokenKey);
  const picker = asPickerColour(value);
  return (
    <li className="flex flex-wrap items-center gap-ds-gap-sm">
      <code className="min-w-0 flex-1 basis-40 break-words text-ds-text-muted">
        {name}
      </code>
      {picker ? (
        <Input
          type="color"
          size="sm"
          aria-label={`${name} colour`}
          value={picker}
          onChange={(event) => edit(tokenKey, event.target.value)}
        />
      ) : null}
      <Input
        size="sm"
        aria-label={`${name} value`}
        value={value}
        onChange={(event) => edit(tokenKey, event.target.value)}
      />
      {overridden ? (
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Reset ${name}`}
          onClick={() => edit(tokenKey, "")}
        >
          Reset
        </Button>
      ) : null}
    </li>
  );
});

// The rows are mounted only while their group is open: a closed `<details>`
// hides its content but React would still render it (R32).
const Group = ({
  id,
  keys,
  vars,
  overrides,
}: {
  id: string;
  keys: string[];
  vars: ResolvedTheme["vars"];
  overrides: PlaygroundState["overrides"];
}) => {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="ds-border rounded-ds-card border-ds-border p-ds-gap-sm"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="ds-focus-ring cursor-pointer font-semibold">
        {id} ({keys.length})
      </summary>
      {open ? (
        <ul className="mt-ds-gap-sm flex flex-col gap-ds-gap-sm" role="list">
          {keys.map((key) => (
            <TokenRow
              key={key}
              tokenKey={key}
              value={String(vars[key] ?? "")}
              overridden={key in overrides}
            />
          ))}
        </ul>
      ) : null}
    </details>
  );
};

export const AdvancedPanel = ({ state, resolved }: AdvancedPanelProps) => {
  const groups = groupSemantic(semanticKeys(themeMaps[state.start]));
  const count = Object.keys(state.overrides).length;

  return (
    <Stack gap="md">
      <Heading as="h2" variant="h3">
        Advanced
      </Heading>
      <Text variant="caption">
        Every semantic token, by category. Editing one sets a literal value that
        wins over the knobs
        {count > 0 ? ` (${count} overridden)` : ""}. Reset a row to put the
        alias back.
      </Text>
      <Stack gap="sm">
        {groups.map((group) => (
          <Group
            key={group.id}
            id={group.id}
            keys={group.keys}
            vars={resolved.vars}
            overrides={state.overrides}
          />
        ))}
      </Stack>
    </Stack>
  );
};
