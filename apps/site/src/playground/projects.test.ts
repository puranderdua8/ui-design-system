import { describe, expect, it } from "vitest";
import {
  canRedo,
  canUndo,
  createHistory,
  historyLimit,
  record,
  redo,
  undo,
} from "./history";
import {
  addProject,
  deleteProject,
  duplicateProject,
  initialProjects,
  migrateDraft,
  projectsKey,
  readProjects,
  renameProject,
  sanitiseName,
  serialiseProjects,
} from "./projects";
import { createProjectsStore, type StorageLike } from "./projects-store";
import { startFrom, storageKey, withKnobs } from "./state";

const fakeStorage = (initial: Record<string, string> = {}) => {
  const items = new Map(Object.entries(initial));
  const storage: StorageLike = {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
  return { storage, items };
};

const idMaker = () => {
  let n = 0;
  return () => `id${++n}`;
};

const draft = {
  start: "nature",
  knobs: { brand: "#1762b6", radiusScale: 2 },
  overrides: { "--ds-action-primary-bg": "#112233" },
};

describe("history", () => {
  const a = startFrom("base");
  const b = withKnobs(a, { density: 1.25 });
  const c = withKnobs(b, { radiusScale: 2 });

  it("undo and redo round-trip to the same states", () => {
    let h = createHistory(a);
    h = record(record(h, b), c);
    expect(canUndo(h)).toBe(true);
    expect(canRedo(h)).toBe(false);
    const back = undo(undo(h));
    expect(back.present).toBe(a);
    expect(canUndo(back)).toBe(false);
    expect(canRedo(back)).toBe(true);
    const forward = redo(redo(back));
    expect(forward.present).toBe(c);
    expect(forward.past).toEqual(h.past);
    // Nothing to undo or redo changes nothing.
    expect(undo(createHistory(a)).present).toBe(a);
    expect(redo(h)).toBe(h);
  });

  it("a new change after an undo drops the redo steps", () => {
    const h = record(undo(record(createHistory(a), b)), c);
    expect(h.future).toEqual([]);
    expect(undo(h).present).toBe(a);
  });

  it("a drag with one group is one step", () => {
    let h = createHistory(a);
    for (const density of [1.1, 1.2, 1.3, 1.4]) {
      h = record(h, withKnobs(a, { density }), "drag-density");
    }
    expect(h.past).toEqual([a]);
    expect(h.present.knobs.density).toBe(1.4);
    expect(undo(h).present).toBe(a);
    // A different group, or none, is a new step.
    const next = record(h, withKnobs(a, { brand: "#1762b6" }), "drag-brand");
    expect(next.past).toHaveLength(2);
    expect(record(next, c).past).toHaveLength(3);
  });

  it("keeps a bounded history", () => {
    let h = createHistory(a);
    for (let i = 1; i <= historyLimit + 20; i++)
      h = record(h, withKnobs(a, { density: 1 + i / 1000 }));
    expect(h.past).toHaveLength(historyLimit);
  });
});

describe("project operations", () => {
  it("renames with plain text only", () => {
    const data = initialProjects("a");
    expect(
      renameProject(data, "a", "  Acme <b>site</b>  ").projects[0]?.name,
    ).toBe("Acme bsiteb");
    expect(sanitiseName("")).toBe("My design system");
    expect(sanitiseName("x".repeat(200))).toHaveLength(60);
  });

  it("duplicates next to the original and opens the copy", () => {
    let data = addProject(initialProjects("a"), "b", "Second");
    data = duplicateProject(data, "a", "c");
    expect(data.projects.map((p) => p.name)).toEqual([
      "My design system",
      "My design system copy",
      "Second",
    ]);
    expect(data.currentId).toBe("c");
  });

  it("deleting moves to a neighbour, and the last one leaves a fresh project", () => {
    let data = addProject(initialProjects("a"), "b");
    data = deleteProject(data, "b", "z");
    expect(data.currentId).toBe("a");
    data = deleteProject(data, "a", "z");
    expect(data.projects.map((p) => p.id)).toEqual(["z"]);
    expect(data.currentId).toBe("z");
  });
});

describe("migration of today's draft", () => {
  it("turns the draft into 'My design system', intact", () => {
    const data = migrateDraft(draft, "x");
    expect(data?.projects).toHaveLength(1);
    expect(data?.projects[0]?.name).toBe("My design system");
    expect(data?.projects[0]?.state).toEqual({
      start: "nature",
      mode: "light",
      dims: {},
      fonts: {},
      knobs: { brand: "#1762b6", radiusScale: 2 },
      overrides: { "--ds-action-primary-bg": "#112233" },
    });
  });

  it("returns nothing for a draft it cannot read", () => {
    expect(migrateDraft({ start: "nope" }, "x")).toBeNull();
    expect(migrateDraft(null, "x")).toBeNull();
  });

  it("the store migrates the old key and saves the new one", () => {
    const { storage, items } = fakeStorage({
      [storageKey]: JSON.stringify(draft),
    });
    const store = createProjectsStore(() => storage, idMaker());
    const view = store.getView();
    expect(view.projects.map((p) => p.name)).toEqual(["My design system"]);
    expect(view.state.knobs.brand).toBe("#1762b6");
    expect(view.storage).toBe("ok");
    expect(items.has(projectsKey)).toBe(true);
    // The old draft is left where it was.
    expect(items.get(storageKey)).toBe(JSON.stringify(draft));
  });
});

describe("readProjects", () => {
  it("round-trips, and drops a bad project instead of guessing", () => {
    const data = addProject(initialProjects("a"), "b", "Two");
    const stored = JSON.parse(JSON.stringify(serialiseProjects(data)));
    expect(readProjects(stored)).toEqual({ kind: "ok", data });
    stored.projects.push({ id: "c", name: "Bad", state: { start: "nope" } });
    stored.projects.push({
      id: "a",
      name: "Duplicate id",
      state: stored.projects[0].state,
    });
    stored.projects.push({
      id: "bad id!",
      name: "x",
      state: stored.projects[0].state,
    });
    expect(readProjects(stored)).toEqual({ kind: "ok", data });
  });

  it("falls back to the first project when currentId is unknown", () => {
    const stored = serialiseProjects(addProject(initialProjects("a"), "b"));
    const read = readProjects({ ...stored, currentId: "nope" });
    expect(read.kind === "ok" && read.data.currentId).toBe("a");
  });

  it.each([null, 3, [], {}, { version: 1 }, { version: 1, projects: [] }])(
    "finds nothing in %j",
    (input) => {
      expect(readProjects(input)).toEqual({ kind: "none" });
    },
  );
});

describe("a version newer than the code", () => {
  it("is not read and not overwritten", () => {
    const newer = JSON.stringify({
      version: 99,
      currentId: "a",
      projects: [{ id: "a", name: "From the future", state: { version: 99 } }],
    });
    const { storage, items } = fakeStorage({ [projectsKey]: newer });
    const store = createProjectsStore(() => storage, idMaker());
    const view = store.getView();
    expect(view.storage).toBe("newer");
    expect(view.projects.map((p) => p.name)).toEqual(["My design system"]);
    // Edits work in memory but never replace what the newer site wrote.
    store.setState(withKnobs(view.state, { density: 1.2 }));
    store.newProject("Another");
    expect(items.get(projectsKey)).toBe(newer);
    expect(store.getView().storage).toBe("newer");
  });
});

describe("the projects store", () => {
  it("undoes and redoes a change per project", () => {
    const { storage } = fakeStorage();
    const store = createProjectsStore(() => storage, idMaker());
    const first = store.getSnapshot();
    store.setState(withKnobs(first, { density: 1.25 }));
    store.newProject("Second");
    expect(store.getView().canUndo).toBe(false); // the new project's own history
    store.setState(withKnobs(store.getSnapshot(), { brand: "#1762b6" }));
    store.undo();
    expect(store.getSnapshot().knobs).toEqual({});
    store.redo();
    expect(store.getSnapshot().knobs.brand).toBe("#1762b6");
    // Back to the first project: its own history is still there.
    store.openProject("id1");
    expect(store.getView().canUndo).toBe(true);
    store.undo();
    expect(store.getSnapshot()).toBe(first);
  });

  it("saves a shared design as a new project and never changes an existing one", () => {
    const { storage } = fakeStorage();
    const store = createProjectsStore(() => storage, idMaker());
    const mine = withKnobs(store.getSnapshot(), { brand: "#112233" });
    store.setState(mine);
    const shared = withKnobs(startFrom("nature"), { brand: "#1762b6" });
    expect(store.saveCopy("Shared", shared)).toBe(true);
    // The copy is the open project; the first one is exactly as it was.
    expect(store.getView().projects.map((p) => p.name)).toEqual([
      "My design system",
      "Shared",
    ]);
    expect(store.getSnapshot()).toBe(shared);
    store.openProject("id1");
    expect(store.getSnapshot()).toBe(mine);
    // Saving again adds another; it never overwrites the first copy.
    expect(store.saveCopy("Shared", shared)).toBe(true);
    expect(store.getView().projects).toHaveLength(3);
  });

  it("does not save a copy when the list is full", () => {
    const { storage } = fakeStorage();
    const store = createProjectsStore(() => storage, idMaker());
    for (let i = 0; i < 49; i++) store.newProject(`P${i}`);
    expect(store.getView().projects).toHaveLength(50);
    expect(store.saveCopy("One too many", startFrom("base"))).toBe(false);
    expect(store.getView().projects).toHaveLength(50);
  });

  it("keeps a snapshot stable until something changes", () => {
    const { storage } = fakeStorage();
    const store = createProjectsStore(() => storage, idMaker());
    expect(store.getView()).toBe(store.getView());
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    let calls = 0;
    const off = store.subscribe(() => calls++);
    store.setState(withKnobs(store.getSnapshot(), { density: 1.1 }));
    expect(calls).toBe(1);
    off();
    store.setState(withKnobs(store.getSnapshot(), { density: 1.2 }));
    expect(calls).toBe(1);
  });

  it("saves, and a second store reads it back", () => {
    const { storage } = fakeStorage();
    const one = createProjectsStore(() => storage, idMaker());
    one.setState(withKnobs(one.getSnapshot(), { brand: "#1762b6" }));
    one.rename("id1", "Acme");
    const two = createProjectsStore(() => storage, idMaker());
    expect(two.getView().projects).toEqual([{ id: "id1", name: "Acme" }]);
    expect(two.getSnapshot().knobs.brand).toBe("#1762b6");
  });

  it("does not throw when storage is blocked", () => {
    const blocked = createProjectsStore(() => {
      throw new DOMException("denied", "SecurityError");
    }, idMaker());
    expect(blocked.getView().storage).toBe("blocked");
    blocked.setState(withKnobs(blocked.getSnapshot(), { density: 1.2 }));
    expect(blocked.getSnapshot().knobs.density).toBe(1.2);
    blocked.undo();
    expect(blocked.getSnapshot().knobs).toEqual({});

    const noStorage = createProjectsStore(() => null, idMaker());
    expect(() => noStorage.newProject("x")).not.toThrow();
    expect(noStorage.getView().storage).toBe("blocked");
  });

  it("does not throw when storage reads or writes fail", () => {
    const throwingRead: StorageLike = {
      getItem: () => {
        throw new Error("read failed");
      },
      setItem: () => {},
    };
    const store = createProjectsStore(() => throwingRead, idMaker());
    expect(store.getView().storage).toBe("blocked");

    const full: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("full", "QuotaExceededError");
      },
    };
    const filled = createProjectsStore(() => full, idMaker());
    filled.setState(withKnobs(filled.getSnapshot(), { density: 1.2 }));
    expect(filled.getView().storage).toBe("full");
    expect(filled.getSnapshot().knobs.density).toBe(1.2);
  });

  it("starts fresh from corrupt storage", () => {
    const { storage } = fakeStorage({
      [projectsKey]: "{not json",
      [storageKey]: "also not json",
    });
    const store = createProjectsStore(() => storage, idMaker());
    expect(store.getView().projects).toHaveLength(1);
    expect(store.getSnapshot()).toEqual(startFrom("base"));
  });
});
