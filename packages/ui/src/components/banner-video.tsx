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

type BannerVideoProps = BannerVideoSource & {
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
  const [playing, setPlaying] = React.useState(false);
  // True once the user pressed Pause: scrolling back into view must not
  // override that choice.
  const userPausedRef = React.useRef(false);

  // Play only while the video is in view (it downloads nothing before that,
  // `preload="none"`). A browser that blocks autoplay rejects: the button
  // shows "Play".
  React.useEffect(() => {
    if (!video) return;
    if (typeof IntersectionObserver === "undefined") {
      // No observer (an old browser): behave as before and play on mount.
      Promise.resolve(video.play()).catch(() => undefined);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting) {
        if (!userPausedRef.current) {
          Promise.resolve(video.play()).catch(() => undefined);
        }
      } else {
        video.pause();
      }
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [video]);

  const toggle = () => {
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      Promise.resolve(video.play()).catch(() => undefined);
    } else {
      userPausedRef.current = true;
      video.pause();
    }
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
            preload="none"
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
