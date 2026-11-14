"use client";

import { Button, Heading, Input, Stack, Text } from "@puranderdua/ui";
import { themeMaps } from "@/playground/data";
import {
  asPickerColour,
  groupSemantic,
  semanticKeys,
  withOverride,
} from "@/playground/state";
import { setState } from "@/playground/store";
import type { PlaygroundState, ResolvedTheme } from "@/playground/types";

type AdvancedPanelProps = { state: PlaygroundState; resolved: ResolvedTheme };

const shortName = (key: string) => key.replace(/^--ds-/, "");

const TokenRow = ({
  tokenKey,
  value,
  overridden,
  state,
}: {
  tokenKey: string;
  value: string;
  overridden: boolean;
  state: PlaygroundState;
}) => {
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
          onChange={(event) =>
            setState(withOverride(state, tokenKey, event.target.value))
          }
        />
      ) : null}
      <Input
        size="sm"
        aria-label={`${name} value`}
        value={value}
        onChange={(event) =>
          setState(withOverride(state, tokenKey, event.target.value))
        }
      />
      {overridden ? (
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Reset ${name}`}
          onClick={() => setState(withOverride(state, tokenKey, ""))}
        >
          Reset
        </Button>
      ) : null}
    </li>
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
          <details
            key={group.id}
            className="ds-border rounded-ds-card border-ds-border p-ds-gap-sm"
          >
            <summary className="ds-focus-ring cursor-pointer font-semibold">
              {group.id} ({group.keys.length})
            </summary>
            <ul
              className="mt-ds-gap-sm flex flex-col gap-ds-gap-sm"
              role="list"
            >
              {group.keys.map((key) => (
                <TokenRow
                  key={key}
                  tokenKey={key}
                  value={String(resolved.vars[key] ?? "")}
                  overridden={key in state.overrides}
                  state={state}
                />
              ))}
            </ul>
          </details>
        ))}
      </Stack>
    </Stack>
  );
};
