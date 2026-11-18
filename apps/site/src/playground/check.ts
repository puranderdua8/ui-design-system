// The Check step's logic (S56, spec 4.5), pure and tested. "Fix all" runs each cause's
// fix in turn on the state the last one made, so the whole thing is one new state (one
// undo step). The words come from the content file; nothing here is shown unchanged.
import { builderContent } from "../content/builder";
import { analyse, type CauseId } from "./explain";
import { fix, type FixResult } from "./fix";
import type {
  ContrastPairsSpec,
  ContrastResult,
  PlaygroundState,
  ThemeJson,
  ThemeName,
} from "./types";

type Context = {
  themes: Record<ThemeName, ThemeJson>;
  spec: ContrastPairsSpec;
};

export type FixAllResult = {
  state: PlaygroundState;
  changed: boolean;
  fixes: FixResult[];
  totalBefore: number;
  totalAfter: number;
};

/** Fixes every cause that can be fixed, in the order the Check step lists them. */
export const fixAll = (
  state: PlaygroundState,
  context: Context,
): FixAllResult => {
  const first = analyse(state, context.themes, context.spec);
  let current = state;
  const fixes: FixResult[] = [];
  for (const { cause } of first.explanations) {
    const result = fix(cause, current, context);
    if (result?.changed) {
      fixes.push(result);
      current = result.state;
    }
  }
  const last =
    current === state ? first : analyse(current, context.themes, context.spec);
  return {
    state: current,
    changed: current !== state,
    fixes,
    totalBefore: first.report.failing,
    totalAfter: last.report.failing,
  };
};

/** Causes the person can fix with one click. "Other" has no colour to move. */
export const fixable = (cause: CauseId): boolean => cause !== "other";

const fill = (text: string, values: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/** One line of the "Technical details" disclosure for a failing pair. */
export const detailsLine = (result: ContrastResult): string =>
  fill(builderContent.check.detailsRow, {
    fg: result.fg,
    bg: result.bg,
    ratio: result.ratio === null ? "?" : result.ratio.toFixed(2),
    min: result.min,
  });

/** How many combinations were checked (the number in "All 202 combinations..."). */
export const checkedCount = (results: readonly ContrastResult[]): number =>
  results.length;

/** The count of places shown, in words. */
export const shownText = (count: number): string =>
  count === 0
    ? builderContent.check.noPlace
    : fill(
        count === 1
          ? builderContent.check.shownOne
          : builderContent.check.shownMany,
        { count },
      );
