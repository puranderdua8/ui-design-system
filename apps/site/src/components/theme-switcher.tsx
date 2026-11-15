"use client";

import { useEffect, useSyncExternalStore } from "react";
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

export const ThemeSwitcher = () => {
  // The applied theme is <html data-ds-theme>; the head script may have set it from
  // the cache before React ran, so the label is right on the first client render.
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    // Re-import the stored theme's chunk so a package upgrade refreshes a stale
    // cache; with nothing stored this marks Base as applied. A failed import leaves
    // whatever the head script applied.
    void activateTheme(readStoredTheme()?.name ?? defaultTheme).catch(() => {});
    // Another tab chose a theme: follow it, without writing it back (R33).
    return subscribeStoredTheme(() => {
      void activateTheme(readStoredTheme()?.name ?? defaultTheme, {
        remember: false,
      }).catch(() => {});
    });
  }, []);

  return (
    <div className="flex items-center gap-ds-gap-sm">
      <Text as="span" variant="caption">
        Theme
      </Text>
      {/* A native select (R30): the Radix Select, Floating UI and scroll lock
          were a 31 KB chunk on every route for a list that is closed. */}
      <select
        aria-label="Theme"
        className={inputVariants({ size: "sm" })}
        value={theme}
        onChange={(event) => {
          const { value } = event.target;
          if (isThemeName(value)) void activateTheme(value).catch(() => {});
        }}
      >
        {themeNames.map((name) => (
          <option key={name} value={name}>
            {themeLabels[name]}
          </option>
        ))}
      </select>
    </div>
  );
};
