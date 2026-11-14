"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from "@puranderdua/ui";
import {
  activateTheme,
  defaultTheme,
  getServerThemeSnapshot,
  getThemeSnapshot,
  isThemeName,
  readStoredTheme,
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
  }, []);

  return (
    <div className="flex items-center gap-ds-gap-sm">
      <Text as="span" variant="caption">
        Theme
      </Text>
      <Select
        value={theme}
        onValueChange={(value) => {
          if (isThemeName(value)) void activateTheme(value).catch(() => {});
        }}
      >
        <SelectTrigger size="sm" aria-label="Theme">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {themeNames.map((name) => (
            <SelectItem key={name} value={name}>
              {themeLabels[name]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
