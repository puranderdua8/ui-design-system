import { cva, type VariantProps } from "class-variance-authority";

// Plain module, no "use client": Server Components can call this (D-065, D-070).

export type BannerTone = "canvas" | "brand" | "inverse" | "gradient";
export type BannerScrim = "strong" | "medium";

export const bannerVariants = cva(
  "relative flex w-full flex-col overflow-hidden",
  {
    variants: {
      // Banner height recipes (theme.css): min-height in svh, so text can grow it.
      height: { screen: "ds-banner-screen", tall: "ds-banner-tall" },
      align: { start: "justify-start", center: "justify-center" },
      // Tone recipes (theme.css, contexts in contrast-pairs.json).
      tone: {
        canvas: "ds-tone-canvas",
        brand: "ds-tone-brand",
        inverse: "ds-tone-inverse",
        gradient: "ds-tone-gradient",
      },
    },
    defaultVariants: { height: "screen", align: "center", tone: "canvas" },
  },
);

export type BannerVariantProps = VariantProps<typeof bannerVariants>;

/**
 * Background layer for an image or video: fills the band, `object-cover` on
 * the direct child (img, picture, video). The root clips any overflow.
 */
export const bannerMediaClasses = "absolute inset-0 *:size-full *:object-cover";

/**
 * Scrim layer: `overlay.scrim` at a fixed strength (the layer's opacity).
 * Light text stays at 4.5:1 or better over the lightest possible pixel; the
 * strengths are verified per theme by scripts/contrast.mjs (`scrim` in
 * contrast-pairs.json). Keep this map in step with `scrim.strengths` there.
 */
export const bannerScrimClasses: Record<BannerScrim, string> = {
  strong: "absolute inset-0 bg-ds-scrim opacity-100",
  medium: "absolute inset-0 bg-ds-scrim opacity-85",
};

/** Content layer: above the media, inside the page container. */
export const bannerContentClasses = "relative w-full py-ds-section-md";

/** Pause / play button, bottom end corner, above the content. */
export const bannerVideoControlClasses =
  "absolute bottom-ds-gap-md end-ds-gap-md";
