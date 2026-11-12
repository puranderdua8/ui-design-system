"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { Button } from "./button";
import { bannerMediaClasses, bannerVideoControlClasses } from "./banner.styles";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribe = (notify: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getSnapshot = () => window.matchMedia(REDUCED_MOTION).matches;
// Before hydration (and with no JavaScript) only the poster is shown, so the
// video never starts for someone who asked for reduced motion.
const getServerSnapshot = () => true;

export type BannerVideoSource = {
  /** Video file URL. Played muted and looped; it must carry no information the page needs. */
  src: string;
  /** Image shown instead of the video under `prefers-reduced-motion`, before hydration and while loading. */
  poster: string;
  /** MIME type of `src`, e.g. `video/mp4`. */
  type?: string;
  /** Accessible name of the button while the video plays. */
  pauseLabel?: string;
  /** Accessible name of the button while the video is paused. */
  playLabel?: string;
};

export type BannerVideoProps = BannerVideoSource & {
  /** Rendered after the video layer: the scrim, the content, and then the button. */
  children?: React.ReactNode;
};

/**
 * Looping background video for `Banner` (client part). Under
 * `prefers-reduced-motion: reduce` it renders the poster only. Otherwise the
 * video autoplays muted and a visible button pauses it (WCAG 2.2.2, Pause,
 * Stop, Hide). The video is decorative: hidden from assistive technology.
 */
export const BannerVideo = ({
  src,
  poster,
  type,
  pauseLabel = "Pause video",
  playLabel = "Play video",
  children,
}: BannerVideoProps) => {
  const reduced = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [video, setVideo] = React.useState<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = React.useState(true);

  // Start on mount. A browser that blocks autoplay rejects: show "Play".
  React.useEffect(() => {
    if (!video) return;
    Promise.resolve(video.play()).catch(() => setPlaying(false));
  }, [video]);

  const toggle = () => {
    if (!video) return;
    if (video.paused) Promise.resolve(video.play()).catch(() => undefined);
    else video.pause();
  };

  return (
    <>
      <div data-slot="banner-video" className={bannerMediaClasses}>
        {reduced ? (
          <img src={poster} alt="" />
        ) : (
          <video
            ref={setVideo}
            src={type ? undefined : src}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            {type ? <source src={src} type={type} /> : null}
          </video>
        )}
      </div>
      {children}
      {reduced ? null : (
        <Button
          variant="secondary"
          size="sm"
          className={bannerVideoControlClasses}
          onClick={toggle}
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {playing ? pauseLabel : playLabel}
        </Button>
      )}
    </>
  );
};
