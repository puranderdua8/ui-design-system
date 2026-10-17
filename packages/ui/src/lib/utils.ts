import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { dsFontSizes, dsTypeRecipes } from "./generated/ds-classes";

// Both lists are generated from theme.css (scripts/build-foundations.mjs).
// - `text-ds-<size>` must count as a font size, not a colour, or it would
//   clash with `text-ds-text`.
// - `ds-type-*` recipes are one group, so a later recipe (e.g. from
//   `className`) replaces the earlier one (e.g. from `variant`), and a recipe
//   replaces earlier loose typography utilities it already sets.
const twMerge = extendTailwindMerge<"ds-type">({
  extend: {
    classGroups: {
      "font-size": [{ text: dsFontSizes }],
      "ds-type": dsTypeRecipes,
    },
    conflictingClassGroups: {
      "ds-type": [
        "font-size",
        "font-weight",
        "leading",
        "tracking",
        "font-family",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
