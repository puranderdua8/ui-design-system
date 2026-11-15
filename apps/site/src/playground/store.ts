// The playground's one piece of state, outside React so it can feed
// `useSyncExternalStore`: the server and the first client render see the default
// state (no hydration mismatch), then the client switches to what localStorage holds.
import { defaultState, parseState, serialiseState, storageKey } from "./state";
import type { PlaygroundState } from "./types";

let current: PlaygroundState | null = null;
const listeners = new Set<() => void>();

const read = (): PlaygroundState => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return (raw ? parseState(JSON.parse(raw)) : null) ?? defaultState;
  } catch {
    // Storage blocked or corrupt: start from the default.
    return defaultState;
  }
};

export const getSnapshot = (): PlaygroundState => (current ??= read());

export const getServerSnapshot = (): PlaygroundState => defaultState;

// Another tab wrote the state: take its value (R33). The event never fires in
// the tab that wrote, so `setState` and this cannot loop.
const onStorage = (event: StorageEvent) => {
  if (event.key !== null && event.key !== storageKey) return;
  current = read();
  for (const listener of listeners) listener();
};

export const subscribe = (listener: () => void): (() => void) => {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
};

/** Replaces the state, remembers it and tells every subscriber. */
export const setState = (next: PlaygroundState): void => {
  current = next;
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(serialiseState(next)),
    );
  } catch {
    // Private mode or quota: the edit just is not remembered.
  }
  for (const listener of listeners) listener();
};
