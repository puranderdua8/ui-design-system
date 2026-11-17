// Check, in plain words (S47, spec 4.5). Failing contrast results are grouped by what
// caused them, so the person sees "Your brand colour is too light for white text. 14 places
// are affected, for example main buttons." instead of a list of pairs. The cause is found
// by tracing each side of a pair back through its aliases to the colour it came from:
//   a hand-set colour (an override) > the brand colour > the highlight colour > the
//   background feel (the neutral scale). A pair with none of those is "other".
// Pure data in, pure data out: the sentences come from the content file.
import { builderContent } from "../content/builder";
import { evaluateContrast } from "./contrast";
import { resolveState } from "./engine";
import { read } from "./ramps";
import type {
  ContrastPairsSpec,
  ContrastReport,
  ContrastResult,
  PlaygroundState,
  ResolvedTheme,
  ThemeJson,
  ThemeName,
} from "./types";

export type CauseId =
  "handSet" | "brand" | "highlight" | "background" | "other";

/** Order used to pick the cause when both sides of a pair have one. */
const priority: CauseId[] = [
  "handSet",
  "brand",
  "highlight",
  "background",
  "other",
];

export type Explanation = {
  cause: CauseId;
  /** The plain sentences, ready to show. */
  sentence: string;
  /** How many failing combinations this cause is behind. */
  count: number;
  /** One failing result for the cause, and the plain name of where it shows up. */
  example: ContrastResult;
  exampleName: string;
  results: ContrastResult[];
  /** The override keys involved (only for `handSet`). */
  keys: string[];
};

export type Analysis = {
  resolved: ResolvedTheme;
  report: ContrastReport;
  explanations: Explanation[];
};

const prefix = "--ds-";

/** A var and every var it aliases, ending at the one that holds the value. */
const chainOf = (name: string, refs: Record<string, string>): string[] => {
  const out: string[] = [];
  let key: string | undefined = `${prefix}${name}`;
  while (key && !out.includes(key)) {
    out.push(key);
    key = refs[key];
  }
  return out;
};

type Side = { cause: CauseId | null; keys: string[] };

const sideOf = (
  name: string,
  refs: Record<string, string>,
  overrides: Record<string, string>,
): Side => {
  const chain = chainOf(name, refs);
  const keys = chain.filter((key) => key in overrides);
  if (keys.length > 0) return { cause: "handSet", keys };
  const end = chain[chain.length - 1]!;
  if (end.startsWith(`${prefix}color-brand-`)) return { cause: "brand", keys };
  if (end.startsWith(`${prefix}color-accent-`))
    return { cause: "highlight", keys };
  if (end.startsWith(`${prefix}color-neutral-`))
    return { cause: "background", keys };
  return { cause: null, keys };
};

/** The cause of one failing result, and the override keys behind it. */
const causeOf = (
  result: ContrastResult,
  refs: Record<string, string>,
  overrides: Record<string, string>,
): { cause: CauseId; keys: string[] } => {
  const sides = [result.fg, result.bg]
    .filter((name) => !name.startsWith("scrim "))
    .map((name) => sideOf(name, refs, overrides));
  for (const cause of priority) {
    const found = sides.filter((side) => side.cause === cause);
    if (found.length > 0)
      return { cause, keys: found.flatMap((side) => side.keys) };
  }
  return { cause: "other", keys: [] };
};

const names: Record<string, string> = builderContent.check.roleNames;

/** The plain name of a colour's role. A dark-section role uses its plain role's name. */
export const roleName = (name: string): string | undefined => {
  const plain = name.replace(/^on-(raised|inverse|brand|gradient)-/, "");
  return names[plain] ?? names[`text-${plain}`];
};

const exampleName = (result: ContrastResult): string =>
  roleName(result.fg) ??
  roleName(result.bg) ??
  builderContent.check.unnamedPlace;

const fill = (text: string, values: Record<string, string | number>): string =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

const sentenceFor = (
  cause: CauseId,
  count: number,
  example: string,
  resolved: ResolvedTheme,
): string => {
  const { causes, affectedOne, affectedMany } = builderContent.check;
  const say =
    cause === "brand"
      ? read(String(resolved.vars["--ds-color-brand-600"])).l > 0.6
        ? causes.brandLight
        : causes.brandDark
      : causes[cause];
  const affected = fill(count === 1 ? affectedOne : affectedMany, {
    count,
    example,
  });
  return `${say} ${affected}`;
};

/** Groups the failing results of a report by cause, largest group first. */
export const explain = (
  report: ContrastReport,
  resolved: ResolvedTheme,
  state: Pick<PlaygroundState, "overrides">,
): Explanation[] => {
  const groups = new Map<CauseId, Explanation>();
  for (const result of report.results) {
    if (result.ok) continue;
    const { cause, keys } = causeOf(result, resolved.refs, state.overrides);
    const group = groups.get(cause);
    if (group) {
      group.results.push(result);
      group.count++;
      for (const key of keys)
        if (!group.keys.includes(key)) group.keys.push(key);
    } else {
      groups.set(cause, {
        cause,
        sentence: "",
        count: 1,
        example: result,
        exampleName: exampleName(result),
        results: [result],
        keys: [...keys],
      });
    }
  }
  const out = [...groups.values()];
  for (const group of out)
    group.sentence = sentenceFor(
      group.cause,
      group.count,
      group.exampleName,
      resolved,
    );
  return out.sort(
    (a, b) =>
      b.count - a.count ||
      priority.indexOf(a.cause) - priority.indexOf(b.cause),
  );
};

/** Resolves a state, checks it, and explains what fails. */
export const analyse = (
  state: PlaygroundState,
  themes: Record<ThemeName, ThemeJson>,
  spec: ContrastPairsSpec,
): Analysis => {
  const resolved = resolveState(state, themes);
  const report = evaluateContrast(resolved.vars, spec);
  return { resolved, report, explanations: explain(report, resolved, state) };
};
