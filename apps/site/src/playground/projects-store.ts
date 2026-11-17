// The projects store (S45): the list of projects, which one is open, and undo/redo for
// each, with the same subscribe/snapshot shape `useSyncExternalStore` wants. Storage is
// passed in, so tests use a fake one. Nothing here throws on blocked or full storage.
import {
  canRedo,
  canUndo,
  createHistory,
  record,
  redo as redoHistory,
  undo as undoHistory,
  type History,
} from "./history";
import {
  addProject,
  currentProject,
  deleteProject,
  duplicateProject,
  initialProjects,
  migrateDraft,
  projectsKey,
  readProjects,
  renameProject,
  selectProject,
  serialiseProjects,
  withProjectState,
  type Projects,
} from "./projects";
import { parseState, storageKey } from "./state";
import type { PlaygroundState } from "./types";

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

/**
 * - `ok`: remembered.
 * - `blocked`: the browser will not let the site keep anything (private mode, settings).
 * - `full`: there is no room left.
 * - `newer`: saved by a newer version of the site; it is left untouched and edits are not saved.
 */
type StorageStatus = "ok" | "blocked" | "full" | "newer";

export type StoreView = {
  state: PlaygroundState;
  projects: { id: string; name: string }[];
  currentId: string;
  canUndo: boolean;
  canRedo: boolean;
  storage: StorageStatus;
};

const isQuotaError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED");

const parseJson = (raw: string | null): unknown => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const createProjectsStore = (
  getStorage: () => StorageLike | null,
  makeId: () => string,
) => {
  let data: Projects | null = null;
  let status: StorageStatus = "ok";
  let histories = new Map<string, History>();
  let view: StoreView | null = null;
  const listeners = new Set<() => void>();

  const emit = () => {
    view = null;
    for (const listener of listeners) listener();
  };

  const persist = (storage: StorageLike | null) => {
    if (status === "newer") return;
    if (!storage) {
      status = "blocked";
      return;
    }
    try {
      storage.setItem(
        projectsKey,
        JSON.stringify(serialiseProjects(data as Projects)),
      );
      status = "ok";
    } catch (error) {
      status = isQuotaError(error) ? "full" : "blocked";
    }
  };

  const safeStorage = (): StorageLike | null => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };

  const load = (): Projects => {
    const storage = safeStorage();
    status = "ok";
    if (!storage) {
      status = "blocked";
      return initialProjects(makeId());
    }
    try {
      const stored = readProjects(parseJson(storage.getItem(projectsKey)));
      if (stored.kind === "ok") return stored.data;
      if (stored.kind === "newer") {
        // Keep what a newer site wrote: show a default, never overwrite.
        status = "newer";
        return initialProjects(makeId());
      }
      const draft = parseJson(storage.getItem(storageKey));
      const migrated = parseState(draft) ? migrateDraft(draft, makeId()) : null;
      if (migrated) {
        data = migrated;
        // The old draft stays where it is, so rolling back the site loses nothing.
        persist(storage);
        return migrated;
      }
    } catch {
      status = "blocked";
    }
    return initialProjects(makeId());
  };

  const ensure = (): Projects => (data ??= load());

  const historyFor = (): History => {
    const project = currentProject(ensure());
    const existing = histories.get(project.id);
    if (existing && existing.present === project.state) return existing;
    const fresh = createHistory(project.state);
    histories.set(project.id, fresh);
    return fresh;
  };

  /** Applies a change to the projects list, then saves and notifies. */
  const commit = (next: Projects) => {
    data = next;
    histories = new Map(
      [...histories].filter(([id]) =>
        next.projects.some((project) => project.id === id),
      ),
    );
    persist(safeStorage());
    emit();
  };

  const getView = (): StoreView => {
    if (view) return view;
    const current = currentProject(ensure());
    const history = historyFor();
    view = {
      state: current.state,
      projects: ensure().projects.map(({ id, name }) => ({ id, name })),
      currentId: current.id,
      canUndo: canUndo(history),
      canRedo: canRedo(history),
      storage: status,
    };
    return view;
  };

  return {
    getView,
    getSnapshot: (): PlaygroundState => getView().state,
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    /**
     * Replaces the open project's state. Changes that share a `group` (one slider
     * drag) are a single undo step.
     */
    setState: (next: PlaygroundState, group?: string): void => {
      const project = currentProject(ensure());
      const history = record(historyFor(), next, group);
      histories.set(project.id, history);
      commit(withProjectState(ensure(), project.id, history.present));
    },

    undo: (): void => {
      const project = currentProject(ensure());
      const history = undoHistory(historyFor());
      histories.set(project.id, history);
      commit(withProjectState(ensure(), project.id, history.present));
    },

    redo: (): void => {
      const project = currentProject(ensure());
      const history = redoHistory(historyFor());
      histories.set(project.id, history);
      commit(withProjectState(ensure(), project.id, history.present));
    },

    newProject: (name?: string): void =>
      commit(addProject(ensure(), makeId(), name)),
    openProject: (id: string): void => commit(selectProject(ensure(), id)),
    rename: (id: string, name: string): void =>
      commit(renameProject(ensure(), id, name)),
    duplicate: (id: string): void =>
      commit(duplicateProject(ensure(), id, makeId())),
    remove: (id: string): void => commit(deleteProject(ensure(), id, makeId())),

    /** Another tab wrote to storage: read it again. Undo history starts over. */
    reload: (): void => {
      data = null;
      histories = new Map();
      emit();
    },
  };
};
