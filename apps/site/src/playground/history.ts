// Undo and redo for one project (S45). Pure: no React, no DOM, so it is unit tested.
// The history holds whole states; a state is small, so no diffing is needed.
import type { PlaygroundState } from "./types";

/** The most steps kept. The oldest fall off first. */
export const historyLimit = 100;

export type History = {
  past: PlaygroundState[];
  present: PlaygroundState;
  future: PlaygroundState[];
  /**
   * Set while one gesture (a slider drag) is in progress. A change with the same
   * `group` replaces the present instead of adding a step, so the whole drag is one
   * undo. Any undo, redo or change without a group ends it.
   */
  group?: string;
};

export const createHistory = (present: PlaygroundState): History => ({
  past: [],
  present,
  future: [],
});

/** Records `next` as the new present. An equal state (same reference) adds nothing. */
export const record = (
  history: History,
  next: PlaygroundState,
  group?: string,
): History => {
  if (next === history.present) return history;
  if (group !== undefined && group === history.group)
    return { ...history, present: next };
  return {
    past: [...history.past, history.present].slice(-historyLimit),
    present: next,
    future: [],
    ...(group !== undefined ? { group } : {}),
  };
};

export const canUndo = (history: History): boolean => history.past.length > 0;
export const canRedo = (history: History): boolean => history.future.length > 0;

export const undo = (history: History): History => {
  const previous = history.past[history.past.length - 1];
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
};

export const redo = (history: History): History => {
  const [next, ...rest] = history.future;
  if (!next) return history;
  return {
    past: [...history.past, history.present],
    present: next,
    future: rest,
  };
};
