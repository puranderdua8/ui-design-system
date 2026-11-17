// Named projects (S45, spec 4.9). Pure: no React, no DOM, no storage access, so it is
// unit tested. `store.ts` owns the storage and the subscribers.
import {
  defaultState,
  parseState,
  sanitiseText,
  serialiseState,
  startFrom,
} from "./state";
import type { PlaygroundState } from "./types";

/** localStorage key for the projects list. The old single draft lives under `storageKey`. */
export const projectsKey = "ds-projects";

/** Version of the stored projects file. A newer one is left alone (see `readProjects`). */
const projectsVersion = 1;

const defaultProjectName = "My design system";
const maxProjects = 50;
const maxNameLength = 60;

export type Project = { id: string; name: string; state: PlaygroundState };

export type Projects = { currentId: string; projects: Project[] };

/** A project name: plain text, a length limit and a strict character set. */
export const sanitiseName = (input: unknown): string =>
  sanitiseText(input, maxNameLength) || defaultProjectName;

const createProject = (
  id: string,
  name: string = defaultProjectName,
  state: PlaygroundState = defaultState,
): Project => ({ id, name: sanitiseName(name), state });

export const initialProjects = (id: string): Projects => ({
  currentId: id,
  projects: [createProject(id)],
});

export const currentProject = (data: Projects): Project =>
  data.projects.find((project) => project.id === data.currentId) ??
  data.projects[0] ??
  createProject(data.currentId);

/** Adds a project (a fresh one unless `state` is given) and makes it the current one. */
export const addProject = (
  data: Projects,
  id: string,
  name?: string,
  state: PlaygroundState = startFrom("base"),
): Projects =>
  data.projects.length >= maxProjects
    ? data
    : {
        currentId: id,
        projects: [...data.projects, createProject(id, name, state)],
      };

export const selectProject = (data: Projects, id: string): Projects =>
  data.projects.some((project) => project.id === id)
    ? { ...data, currentId: id }
    : data;

export const renameProject = (
  data: Projects,
  id: string,
  name: string,
): Projects => ({
  ...data,
  projects: data.projects.map((project) =>
    project.id === id ? { ...project, name: sanitiseName(name) } : project,
  ),
});

/** A copy right after the original, named "<name> copy" and made current. */
export const duplicateProject = (
  data: Projects,
  id: string,
  newId: string,
): Projects => {
  const index = data.projects.findIndex((project) => project.id === id);
  const original = data.projects[index];
  if (!original || data.projects.length >= maxProjects) return data;
  const copy = createProject(
    newId,
    sanitiseText(`${original.name} copy`, maxNameLength),
    original.state,
  );
  const projects = [...data.projects];
  projects.splice(index + 1, 0, copy);
  return { currentId: newId, projects };
};

/**
 * Removes a project. The current one moves to its neighbour. Deleting the last
 * project leaves one fresh project (`freshId`), so there is always something to edit.
 */
export const deleteProject = (
  data: Projects,
  id: string,
  freshId: string,
): Projects => {
  const index = data.projects.findIndex((project) => project.id === id);
  if (index === -1) return data;
  const projects = data.projects.filter((project) => project.id !== id);
  if (projects.length === 0) return initialProjects(freshId);
  if (data.currentId !== id) return { ...data, projects };
  const next = projects[Math.min(index, projects.length - 1)];
  return { currentId: (next ?? projects[0]!).id, projects };
};

/** Replaces the state of one project. */
export const withProjectState = (
  data: Projects,
  id: string,
  state: PlaygroundState,
): Projects => ({
  ...data,
  projects: data.projects.map((project) =>
    project.id === id ? { ...project, state } : project,
  ),
});

/** The stored form. */
export const serialiseProjects = (data: Projects) => ({
  version: projectsVersion,
  currentId: data.currentId,
  projects: data.projects.map((project) => ({
    id: project.id,
    name: project.name,
    state: serialiseState(project.state),
  })),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const idPattern = /^[A-Za-z0-9_-]{1,64}$/;

export type ReadProjects =
  /** Stored data was understood (a project with a bad state is dropped, not guessed). */
  | { kind: "ok"; data: Projects }
  /** Written by a newer site: do not read it and do not overwrite it. */
  | { kind: "newer" }
  /** Nothing usable. */
  | { kind: "none" };

/** Reads the stored projects file, treating every field as untrusted. */
export const readProjects = (raw: unknown): ReadProjects => {
  if (!isRecord(raw)) return { kind: "none" };
  const version = raw.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1)
    return { kind: "none" };
  if (version > projectsVersion) return { kind: "newer" };
  if (!Array.isArray(raw.projects)) return { kind: "none" };
  const seen = new Set<string>();
  const projects: Project[] = [];
  for (const item of raw.projects.slice(0, maxProjects)) {
    if (!isRecord(item) || typeof item.id !== "string") continue;
    if (!idPattern.test(item.id) || seen.has(item.id)) continue;
    const state = parseState(item.state);
    if (!state) continue;
    seen.add(item.id);
    projects.push({ id: item.id, name: sanitiseName(item.name), state });
  }
  const first = projects[0];
  if (!first) return { kind: "none" };
  const currentId =
    typeof raw.currentId === "string" && seen.has(raw.currentId)
      ? raw.currentId
      : first.id;
  return { kind: "ok", data: { currentId, projects } };
};

/**
 * Turns today's single `ds-playground` draft into a project named "My design
 * system". Returns `null` if there is no usable draft (the caller starts fresh).
 */
export const migrateDraft = (draft: unknown, id: string): Projects | null => {
  const state = parseState(draft);
  if (!state) return null;
  return {
    currentId: id,
    projects: [createProject(id, defaultProjectName, state)],
  };
};
