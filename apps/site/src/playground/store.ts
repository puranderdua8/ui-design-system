// The playground's one piece of state, outside React so it can feed
// `useSyncExternalStore`: the server and the first client render see the default
// state (no hydration mismatch), then the client switches to what localStorage holds.
// Since S45 the state is the open project of a projects store (`projects-store.ts`).
// That store has undo, redo and the project list (tested); this file exposes them to
// the Builder shell (S51) next to the single-state snapshot the playground uses.
import { projectsKey } from "./projects";
import { createProjectsStore, type StoreView } from "./projects-store";
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

export type { StoreView };

const store = createProjectsStore(() => window.localStorage, makeId);

export const getSnapshot = (): PlaygroundState => store.getSnapshot();

export const getServerSnapshot = (): PlaygroundState => defaultState;

// The whole view (S51): the open project, the list, undo and redo, the storage status.
// The server and hydration see one default project, like `getServerSnapshot`.
const serverView: StoreView = {
  state: defaultState,
  projects: [{ id: "server", name: "My design system" }],
  currentId: "server",
  canUndo: false,
  canRedo: false,
  storage: "ok",
};

export const getView = (): StoreView => store.getView();

export const getServerView = (): StoreView => serverView;

export const getProject = (id: string) => store.getProject(id);

export const undo = (): void => store.undo();
export const redo = (): void => store.redo();
export const newProject = (name?: string): void => store.newProject(name);
export const openProject = (id: string): void => store.openProject(id);
export const renameProject = (id: string, name: string): void =>
  store.rename(id, name);
export const duplicateProject = (id: string): void => store.duplicate(id);
export const removeProject = (id: string): void => store.remove(id);

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
