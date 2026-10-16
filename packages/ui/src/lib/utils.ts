import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the `ds` font-size utilities so `text-ds-body` is not
// mistaken for a colour and does not clash with `text-ds-text-muted`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "ds-display",
            "ds-h1",
            "ds-h2",
            "ds-h3",
            "ds-body",
            "ds-lead",
            "ds-caption",
            "ds-label",
            "ds-control-sm",
            "ds-control-md",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
