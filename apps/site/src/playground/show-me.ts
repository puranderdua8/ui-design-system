// "Show me" (S56, spec 4.5): outline the places in the preview where a failing pair is
// used. The preview's pages carry no role markers, so a place is found by what the browser
// draws: an element whose text, border or background is the pair's front colour on the
// pair's back colour. Both are compared as the browser computes them (`rgb()`), so any
// notation in the theme (hex, eight-digit hex) matches.
import type { ContrastResult } from "./types";

/** The attribute `globals.css` outlines. */
const flagAttribute = "data-check-flag";

const clear = "rgba(0, 0, 0, 0)";

export const clearFlags = (root: HTMLElement): void => {
  for (const el of root.querySelectorAll(`[${flagAttribute}]`))
    el.removeAttribute(flagAttribute);
};

/** How the browser writes a colour, so two notations of one colour compare equal. */
const computed = (probe: HTMLElement, value: string): string => {
  probe.style.color = "";
  probe.style.color = value;
  return getComputedStyle(probe).color;
};

/** The first background that is not see-through, from `start` up to and past `root`. */
const backdrop = (start: Element | null): string => {
  for (let el = start; el; el = el.parentElement) {
    const colour = getComputedStyle(el).backgroundColor;
    if (colour !== clear && colour !== "transparent") return colour;
  }
  return "rgb(255, 255, 255)";
};

const hasOwnText = (el: Element): boolean =>
  Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );

/**
 * Clears the old outlines, outlines every place in `root` that uses one of `results`, and
 * returns how many places that is.
 */
export const flagPlaces = (
  root: HTMLElement,
  results: readonly ContrastResult[],
): number => {
  clearFlags(root);
  const probe = document.createElement("span");
  probe.hidden = true;
  root.append(probe);
  const pairs = results.map((result) => ({
    fg: computed(probe, result.fgValue),
    bg: computed(probe, result.bgValue),
  }));
  probe.remove();

  let count = 0;
  for (const el of root.querySelectorAll("*")) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") continue;
    const own = backdrop(el);
    const behind = backdrop(el.parentElement);
    const text = hasOwnText(el) ? style.color : null;
    const border =
      Number.parseFloat(style.borderTopWidth) > 0 ? style.borderTopColor : null;
    const fill = style.backgroundColor === clear ? null : style.backgroundColor;
    const hit = pairs.some(
      (pair) =>
        (text === pair.fg && own === pair.bg) ||
        (border === pair.fg && behind === pair.bg) ||
        (fill === pair.fg && behind === pair.bg),
    );
    if (hit) {
      el.setAttribute(flagAttribute, "");
      count++;
    }
  }
  return count;
};
