// The four shipped theme maps and the contrast spec, imported statically so the
// playground has them all at once (it switches the starting theme without a request).
import base from "@puranderdua/ui/themes/base.json";
import corporate from "@puranderdua/ui/themes/corporate.json";
import nature from "@puranderdua/ui/themes/nature.json";
import quirky from "@puranderdua/ui/themes/quirky.json";
import pairs from "@puranderdua/ui/contrast-pairs.json";
import type { ContrastPairsSpec, ThemeJson, ThemeName } from "./types";

export const themeMaps: Record<ThemeName, ThemeJson> = {
  base,
  corporate,
  nature,
  quirky,
};

export const contrastSpec = pairs as ContrastPairsSpec;
