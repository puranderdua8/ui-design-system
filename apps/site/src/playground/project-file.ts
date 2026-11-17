// Project file (S48, spec 4.9, 5.3): a project as a JSON file a person can save and
// open again. Importing treats the file as untrusted: a size cap, a format and version
// check, the name through `sanitiseName` and the state through `parseState` (the
// grammar). Nothing in it is ever written as HTML. Pure: no React, no DOM.
import { sanitiseName } from "./projects";
import type { Project } from "./projects";
import { parseState, serialiseState, stateVersion } from "./state";
import type { PlaygroundState } from "./types";

const format = "ds-project";
/** Version of the file shape. Bump it, and add a step in `readProjectFile`, when it changes. */
export const projectFileVersion = 1;
/** Largest file read, in characters. A real project is a few KB. */
export const maxProjectFileLength = 100_000;

/** The file text for a project (2-space JSON and a final newline). */
export const writeProjectFile = (project: Pick<Project, "name" | "state">) =>
  `${JSON.stringify(
    {
      format,
      version: projectFileVersion,
      name: sanitiseName(project.name),
      state: serialiseState(project.state),
    },
    null,
    2,
  )}\n`;

export type ReadProjectFile =
  | { kind: "ok"; name: string; state: PlaygroundState }
  /** Written by a newer site: not read, so nothing is guessed. */
  | { kind: "newer" }
  | { kind: "invalid"; reason: "too-large" | "not-json" | "not-a-project" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/** Reads the text of a project file. Never throws. */
export const readProjectFile = (text: unknown): ReadProjectFile => {
  if (typeof text !== "string") return { kind: "invalid", reason: "not-json" };
  if (text.length > maxProjectFileLength)
    return { kind: "invalid", reason: "too-large" };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { kind: "invalid", reason: "not-json" };
  }
  if (!isRecord(raw) || raw.format !== format || !isRecord(raw.state))
    return { kind: "invalid", reason: "not-a-project" };
  const version = raw.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1)
    return { kind: "invalid", reason: "not-a-project" };
  const stateVersionRead = raw.state.version;
  if (
    version > projectFileVersion ||
    (typeof stateVersionRead === "number" && stateVersionRead > stateVersion)
  )
    return { kind: "newer" };
  const state = parseState(raw.state);
  if (!state) return { kind: "invalid", reason: "not-a-project" };
  return { kind: "ok", name: sanitiseName(raw.name), state };
};
