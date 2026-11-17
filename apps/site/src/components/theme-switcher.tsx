"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { inputVariants, Text } from "@puranderdua/ui";
import {
  activateTheme,
  defaultTheme,
  getServerThemeSnapshot,
  getThemeSnapshot,
  isThemeName,
  readStoredTheme,
  subscribeStoredTheme,
  subscribeTheme,
  themeLabels,
  themeNames,
} from "@/lib/theme";

type ProjectEntry = { id: string; name: string };

const projectPrefix = "project:";
const noopSubscribe = () => () => {};

export const ThemeSwitcher = () => {
  // The chosen look lives in the store (D-128): it reaches examples only, never the
  // chrome. The server and hydration read Base; the cached choice follows at once.
  const look = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  // The person's own projects (S51). They are read after hydration, by a dynamic
  // import, so no page pays for the projects store until the switcher is on screen.
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [groupLabel, setGroupLabel] = useState("");
  // False until the change handler is attached (the e2e tests wait for it).
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    let stopped = false;
    let unsubscribe = () => {};
    // Applies the stored choice: a look by name, or one of the projects as it is now.
    const apply = (remember: boolean) => {
      const stored = readStoredTheme();
      if (stored?.project) {
        void import("@/lib/project-look")
          .then((mod) => mod.activateProject(stored.project!, { remember }))
          .catch(() => {});
        return;
      }
      void activateTheme(stored?.name ?? defaultTheme, { remember }).catch(
        () => {},
      );
    };
    // Re-import the stored theme's chunk so a package upgrade refreshes a stale
    // cache; with nothing stored this marks Base as applied. A failed import leaves
    // whatever the head script applied.
    apply(true);
    // Another tab chose a look: follow it, without writing it back (R33).
    const unsubscribeStored = subscribeStoredTheme(() => apply(false));

    void import("@/lib/project-look")
      .then(async (look) => {
        const store = await import("@/playground/store");
        if (stopped) return;
        setGroupLabel(look.examplesGroupLabel);
        const sync = () => {
          setProjects(store.getView().projects);
          // A project that wears the examples follows its edits.
          const worn = getThemeSnapshot().project;
          if (worn)
            void import("@/lib/project-look")
              .then((mod) => mod.activateProject(worn))
              .catch(() => {});
        };
        unsubscribe = store.subscribe(sync);
        sync();
      })
      .catch(() => {});

    return () => {
      stopped = true;
      unsubscribe();
      unsubscribeStored();
    };
  }, []);

  const value = look.project ? `${projectPrefix}${look.project}` : look.name;

  return (
    <div className="flex items-center gap-ds-gap-sm" data-hydrated={hydrated}>
      <Text as="span" variant="caption" aria-hidden="true">
        Showing examples in
      </Text>
      {/* A native select (R30): the Radix Select, Floating UI and scroll lock
          were a 31 KB chunk on every route for a list that is closed. */}
      <select
        aria-label="Showing examples in"
        className={inputVariants({ size: "sm" })}
        value={value}
        onChange={(event) => {
          const { value: next } = event.target;
          if (next.startsWith(projectPrefix)) {
            void import("@/lib/project-look")
              .then((mod) =>
                mod.activateProject(next.slice(projectPrefix.length)),
              )
              .catch(() => {});
          } else if (isThemeName(next)) {
            void activateTheme(next).catch(() => {});
          }
        }}
      >
        {themeNames.map((name) => (
          <option key={name} value={name}>
            {themeLabels[name]}
          </option>
        ))}
        {projects.length > 0 ? (
          <optgroup label={groupLabel}>
            {projects.map((project) => (
              <option key={project.id} value={`${projectPrefix}${project.id}`}>
                {project.name}
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>
    </div>
  );
};
