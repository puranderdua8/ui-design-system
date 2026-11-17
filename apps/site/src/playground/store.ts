// The playground's one piece of state, outside React so it can feed
// `useSyncExternalStore`: the server and the first client render see the default
// state (no hydration mismatch), then the client switches to what localStorage holds.
// Since S45 the state is the open project of a projects store (`projects-store.ts`).
// That store already has undo, redo and the project list (tested); this file exposes
// only what the site uses today, and S51 adds the rest when the Builder shell needs it.
import { projectsKey } from "./projects";
import { createProjectsStore } from "./projects-store";
import { defaultState, storageKey } from "./state";
import type { PlaygroundState } from "./types";

let counter = 0;
const makeId = (): string => {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  counter += 1;
  return `p${random}${counter.toString(36)}`;
};

const store = createProjectsStore(() => window.localStorage, makeId);

export const getSnapshot = (): PlaygroundState => store.getSnapshot();

export const getServerSnapshot = (): PlaygroundState => defaultState;

// Another tab wrote the state: take its value (R33). The event never fires in
// the tab that wrote, so a write and this cannot loop.
const onStorage = (event: StorageEvent) => {
  if (
    event.key !== null &&
    event.key !== storageKey &&
    event.key !== projectsKey
  )
    return;
  store.reload();
};

let subscribers = 0;
export const subscribe = (listener: () => void): (() => void) => {
  if (subscribers === 0) window.addEventListener("storage", onStorage);
  subscribers += 1;
  const unsubscribe = store.subscribe(listener);
  return () => {
    unsubscribe();
    subscribers -= 1;
    if (subscribers === 0) window.removeEventListener("storage", onStorage);
  };
};

/**
 * Replaces the open project's state, remembers it and tells every subscriber.
 * Pass the same `group` for every change in one drag so undo takes it back in one step.
 */
export const setState = (next: PlaygroundState, group?: string): void =>
  store.setState(next, group);
