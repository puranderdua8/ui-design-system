import type * as React from "react";
import { cn } from "@/lib/utils";
import { renderAs } from "@/lib/render-as";
import type { AsProps } from "@/lib/types";
import { Container, type ContainerSize } from "./container";
import { BannerVideo, type BannerVideoSource } from "./banner-video";
import {
  bannerContentClasses,
  bannerMediaClasses,
  bannerScrimClasses,
  bannerVariants,
  type BannerHeight,
  type BannerJustify,
  type BannerScrim,
  type BannerTone,
} from "./banner.styles";

export type BannerElement = "section" | "div" | "header";

type BannerCommon = {
  /** `screen`: at least the full small viewport (100svh). `tall`: at least 75svh. */
  height?: BannerHeight;
  /** Vertical position of the content (main axis of the column, like `Cluster`'s `justify`). */
  justify?: BannerJustify;
  /** Width of the content column (a `Container` size). Default `lg`. */
  contentWidth?: ContainerSize;
  /** Props for the content layer, the element above the media: `className`, `id`, `data-*`. */
  layerProps?: Omit<React.ComponentPropsWithoutRef<"div">, "children">;
  /** Props for the `Container` that holds the children: `className`, `id`, `data-*`. */
  contentProps?: Omit<React.ComponentPropsWithoutRef<"div">, "children">;
};

type BannerPlain = {
  tone?: BannerTone;
  media?: undefined;
  video?: undefined;
  scrim?: undefined;
};

type BannerWithMedia = {
  /**
   * Over media the text is light (the scrim darkens the image), so `canvas`,
   * whose text is dark, is not offered.
   */
  tone?: Exclude<BannerTone, "canvas">;
  /**
   * Strength of the `overlay.scrim` layer between the media and the content.
   * `strong` keeps light text at 7:1 over a white pixel, `medium` at 4.5:1
   * (checked per theme by `tokens:check`). Default `strong`.
   */
  scrim?: BannerScrim;
} & (
  | {
      /** An `<img>`, `<picture>` or `next/image` (with `fill`); covered with `object-cover`. */
      media: React.ReactNode;
      video?: BannerVideoSource;
    }
  | { media?: React.ReactNode; video: BannerVideoSource }
);

export type BannerProps = BannerCommon &
  (BannerPlain | BannerWithMedia) &
  AsProps<"section", Exclude<BannerElement, "section">>;

/**
 * Full-screen hero band. The content (Heading, Text, Button) sits in a
 * `Container` over a tone, an optional image (`media`) or a looping muted
 * `video`, with a scrim between them. Use one Banner per page, with the page's
 * `h1` inside, and give it an accessible name (`aria-label`) if it should be a
 * landmark. Media must be decorative: give an image `alt=""`.
 *
 * Contrast: text over media is light and is only guaranteed on the scrim, so
 * pick `inverse`, `brand` or `gradient` (the default over media is `inverse`);
 * the scrim strengths are verified against the lightest possible pixel.
 */
export const Banner = ({
  as = "section",
  tone,
  height,
  justify,
  contentWidth,
  layerProps,
  contentProps,
  media,
  video,
  scrim = "strong",
  className,
  children,
  ...props
}: BannerProps) => {
  const hasMedia = media != null || video != null;
  const body = (
    <>
      {hasMedia ? (
        <div data-slot="banner-scrim" className={bannerScrimClasses[scrim]} />
      ) : null}
      <div
        {...layerProps}
        data-slot="banner-content"
        className={cn(bannerContentClasses, layerProps?.className)}
      >
        <Container {...contentProps} size={contentWidth ?? "lg"}>
          {children}
        </Container>
      </div>
    </>
  );

  return renderAs(as, {
    ...props,
    className: cn(
      bannerVariants({
        height,
        justify,
        tone: tone ?? (hasMedia ? "inverse" : "canvas"),
      }),
      className,
    ),
    "data-slot": "banner",
    children: (
      <>
        {media != null ? (
          <div data-slot="banner-media" className={bannerMediaClasses}>
            {media}
          </div>
        ) : null}
        {video ? <BannerVideo {...video}>{body}</BannerVideo> : body}
      </>
    ),
  });
};
