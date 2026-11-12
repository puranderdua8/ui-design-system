import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Banner } from "./banner";
import { bannerScrimClasses, bannerVariants } from "./banner.styles";

const themeCss = readFileSync(
  resolve(__dirname, "../styles/theme.css"),
  "utf8",
);

// Compile-time checks (tsc, via `pnpm typecheck`).
const typeChecks = () => {
  const section = React.createRef<HTMLElement>();
  const div = React.createRef<HTMLDivElement>();
  const poster = "p.jpg";

  <Banner ref={section} />;
  <Banner as="div" ref={div} />;
  <Banner tone="gradient" media={<img src={poster} alt="" />} scrim="medium" />;
  <Banner video={{ src: "v.mp4", poster }} />;

  // @ts-expect-error a closed set of tones
  <Banner tone="rainbow" />;
  // @ts-expect-error dark text over a scrim is not offered: no canvas tone with media
  <Banner tone="canvas" media={<img src={poster} alt="" />} />;
  // @ts-expect-error a scrim needs something to cover
  <Banner scrim="medium" />;
  // @ts-expect-error a video needs its poster
  <Banner video={{ src: "v.mp4" }} />;
  // @ts-expect-error a closed set of heights
  <Banner height="half" />;
  // @ts-expect-error a callback ref for a div on a header (D-034)
  <Banner as="header" ref={(el: HTMLDivElement | null) => void el} />;
  // @ts-expect-error a closed set of elements
  <Banner as="article" />;
};
void typeChecks;

// jsdom has no media playback and no matchMedia: stub both (S27).
const stubMotion = (reduced: boolean) => {
  const listeners = new Set<() => void>();
  const state = { reduced };
  window.matchMedia = vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion") && state.reduced,
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  })) as unknown as typeof window.matchMedia;
  return {
    set: (next: boolean) => {
      state.reduced = next;
      act(() => listeners.forEach((cb) => cb()));
    },
  };
};

const playback = { play: vi.fn(), pause: vi.fn() };
let paused = true;

beforeEach(() => {
  paused = true;
  playback.play = vi.fn(function (this: HTMLVideoElement) {
    paused = false;
    this.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  playback.pause = vi.fn(function (this: HTMLVideoElement) {
    paused = true;
    this.dispatchEvent(new Event("pause"));
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(
    playback.play,
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    playback.pause,
  );
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(
    () => paused,
  );
});

afterEach(() => vi.restoreAllMocks());

const getBanner = () => screen.getByLabelText("Welcome");

describe("Banner structure", () => {
  it("renders a section with the content in a container", () => {
    stubMotion(false);
    render(
      <Banner aria-label="Welcome">
        <h1>Build faster</h1>
      </Banner>,
    );
    const banner = getBanner();
    expect(banner.tagName).toBe("SECTION");
    expect(banner.getAttribute("data-slot")).toBe("banner");
    const content = banner.querySelector('[data-slot="banner-content"]');
    expect(content?.querySelector('[data-slot="container"]')).not.toBeNull();
    expect(content?.querySelector("h1")?.textContent).toBe("Build faster");
  });

  it("defaults to a full-screen, centred canvas band", () => {
    stubMotion(false);
    render(<Banner aria-label="Welcome" />);
    const cls = getBanner().className;
    expect(cls).toContain("ds-banner-screen");
    expect(cls).toContain("justify-center");
    expect(cls).toContain("ds-tone-canvas");
  });

  it("maps height, align and tone to static classes", () => {
    stubMotion(false);
    expect(bannerVariants({ height: "tall" })).toContain("ds-banner-tall");
    expect(bannerVariants({ align: "start" })).toContain("justify-start");
    expect(bannerVariants({ tone: "brand" })).toContain("ds-tone-brand");
    expect(bannerVariants({ tone: "inverse" })).toContain("ds-tone-inverse");
    expect(bannerVariants({ tone: "gradient" })).toContain("ds-tone-gradient");
  });

  it("renders the element given by `as` and merges className", () => {
    stubMotion(false);
    render(<Banner as="header" aria-label="Welcome" className="extra" />);
    expect(getBanner().tagName).toBe("HEADER");
    expect(getBanner().className).toContain("extra");
  });

  it("passes a callback ref the rendered element", () => {
    stubMotion(false);
    const seen: Array<HTMLElement | null> = [];
    render(<Banner aria-label="Welcome" ref={(el) => void seen.push(el)} />);
    expect(seen[0]).toBe(getBanner());
  });

  it("has no scrim without media", () => {
    stubMotion(false);
    render(<Banner aria-label="Welcome" />);
    expect(getBanner().querySelector('[data-slot="banner-scrim"]')).toBeNull();
    expect(getBanner().querySelector('[data-slot="banner-media"]')).toBeNull();
  });

  it("uses classes that exist in the stylesheet", () => {
    for (const cls of [
      ".ds-banner-screen",
      ".ds-banner-tall",
      ".ds-tone-gradient",
    ])
      expect(themeCss).toContain(cls);
  });
});

describe("Banner media", () => {
  it("renders the media under a scrim, before the content, and defaults to the inverse tone", () => {
    stubMotion(false);
    render(
      <Banner aria-label="Welcome" media={<img src="a.jpg" alt="" />}>
        <h1>Hello</h1>
      </Banner>,
    );
    const banner = getBanner();
    const slots = [...banner.children].map((el) =>
      el.getAttribute("data-slot"),
    );
    expect(slots).toEqual(["banner-media", "banner-scrim", "banner-content"]);
    expect(banner.className).toContain("ds-tone-inverse");
    expect(banner.className).not.toContain("ds-tone-canvas");
    const media = banner.querySelector('[data-slot="banner-media"]');
    expect(media?.className).toContain("*:object-cover");
    expect(media?.querySelector("img")?.getAttribute("src")).toBe("a.jpg");
  });

  it("keeps an explicit tone and sets the scrim strength", () => {
    stubMotion(false);
    render(
      <Banner
        aria-label="Welcome"
        tone="gradient"
        scrim="medium"
        media={<img src="a.jpg" alt="" />}
      />,
    );
    expect(getBanner().className).toContain("ds-tone-gradient");
    const scrim = getBanner().querySelector('[data-slot="banner-scrim"]');
    expect(scrim?.className).toContain("bg-ds-scrim");
    expect(scrim?.className).toContain("opacity-85");
    expect(bannerScrimClasses.strong).toContain("opacity-100");
  });

  it("is axe-clean with an image, a heading and an action", async () => {
    stubMotion(false);
    const { container } = render(
      <main>
        <Banner aria-label="Welcome" media={<img src="a.jpg" alt="" />}>
          <h1>Build faster</h1>
          <a href="#start">Get started</a>
        </Banner>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Banner video", () => {
  const video = { src: "hero.mp4", poster: "hero.jpg" };

  it("plays a muted, looping, inline video that assistive technology skips", () => {
    stubMotion(false);
    render(<Banner aria-label="Welcome" video={video} />);
    const el = getBanner().querySelector("video");
    expect(el).not.toBeNull();
    expect(el?.muted).toBe(true);
    expect(el?.loop).toBe(true);
    expect(el?.hasAttribute("playsinline")).toBe(true);
    expect(el?.getAttribute("poster")).toBe("hero.jpg");
    expect(el?.getAttribute("src")).toBe("hero.mp4");
    expect(el?.getAttribute("aria-hidden")).toBe("true");
    expect(el?.tabIndex).toBe(-1);
    expect(playback.play).toHaveBeenCalledTimes(1);
  });

  it("uses a <source> with its type when a type is given", () => {
    stubMotion(false);
    render(
      <Banner aria-label="Welcome" video={{ ...video, type: "video/mp4" }} />,
    );
    const el = getBanner().querySelector("video");
    expect(el?.hasAttribute("src")).toBe(false);
    expect(el?.querySelector("source")?.getAttribute("type")).toBe("video/mp4");
  });

  it("layers video, scrim, content, then the button", () => {
    stubMotion(false);
    render(
      <Banner aria-label="Welcome" video={video}>
        <h1>Hello</h1>
      </Banner>,
    );
    const slots = [...getBanner().children].map(
      (el) => el.getAttribute("data-slot") ?? el.tagName,
    );
    expect(slots).toEqual([
      "banner-video",
      "banner-scrim",
      "banner-content",
      "button",
    ]);
  });

  it("offers a visible pause button that pauses and resumes the video", async () => {
    stubMotion(false);
    const user = userEvent.setup();
    render(<Banner aria-label="Welcome" video={video} />);
    const pause = screen.getByRole("button", { name: "Pause video" });
    await user.click(pause);
    expect(playback.pause).toHaveBeenCalledTimes(1);
    const play = screen.getByRole("button", { name: "Play video" });
    await user.click(play);
    expect(playback.play).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Pause video" })).not.toBeNull();
  });

  it("can be operated from the keyboard", async () => {
    stubMotion(false);
    const user = userEvent.setup();
    render(<Banner aria-label="Welcome" video={video} />);
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Pause video" }),
    );
    await user.keyboard("{Enter}");
    expect(playback.pause).toHaveBeenCalledTimes(1);
  });

  it("takes the button labels as props", () => {
    stubMotion(false);
    render(
      <Banner
        aria-label="Welcome"
        video={{ ...video, pauseLabel: "Video anhalten" }}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Video anhalten" }),
    ).not.toBeNull();
  });

  it("shows Play when the browser blocks autoplay", async () => {
    stubMotion(false);
    playback.play = vi.fn(() => Promise.reject(new Error("NotAllowedError")));
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(
      playback.play,
    );
    render(<Banner aria-label="Welcome" video={video} />);
    expect(
      await screen.findByRole("button", { name: "Play video" }),
    ).not.toBeNull();
  });

  it("shows only the poster, with no video and no button, under prefers-reduced-motion", () => {
    stubMotion(true);
    render(<Banner aria-label="Welcome" video={video} />);
    expect(getBanner().querySelector("video")).toBeNull();
    expect(
      getBanner()
        .querySelector('[data-slot="banner-video"] img')
        ?.getAttribute("src"),
    ).toBe("hero.jpg");
    expect(screen.queryByRole("button")).toBeNull();
    expect(playback.play).not.toHaveBeenCalled();
  });

  it("follows a change of the reduced-motion preference", () => {
    const motion = stubMotion(false);
    render(<Banner aria-label="Welcome" video={video} />);
    expect(getBanner().querySelector("video")).not.toBeNull();
    motion.set(true);
    expect(getBanner().querySelector("video")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    motion.set(false);
    expect(getBanner().querySelector("video")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Pause video" })).not.toBeNull();
  });

  it("is axe-clean while playing and under reduced motion", async () => {
    stubMotion(false);
    const playing = render(
      <main>
        <Banner aria-label="Welcome" video={video}>
          <h1>Build faster</h1>
        </Banner>
      </main>,
    );
    expect(await axe(playing.container)).toHaveNoViolations();
    playing.unmount();
    stubMotion(true);
    const still = render(
      <main>
        <Banner aria-label="Welcome" video={video}>
          <h1>Build faster</h1>
        </Banner>
      </main>,
    );
    expect(await axe(still.container)).toHaveNoViolations();
  });
});
