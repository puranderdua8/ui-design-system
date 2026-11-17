import { describe, expect, it } from "vitest";
import {
  decodeShare,
  encodeShare,
  maxDecodedLength,
  maxEncodedLength,
  readShareHash,
  shareHash,
} from "./share";
import { parseState, serialiseState, startFrom } from "./state";
import type { PlaygroundState } from "./types";

const state: PlaygroundState = {
  start: "nature",
  mode: "light",
  dims: { spacing: "corporate", shape: "quirky" },
  fonts: { heading: "Space Grotesk" },
  knobs: { brand: "#1762b6", radiusScale: 2, typeScale: 1.1 },
  overrides: { "--ds-action-primary-bg": "#112233" },
};

const gzipBase64Url = async (text: string): Promise<string> => {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

describe("share link", () => {
  it("round-trips a state", async () => {
    const text = await encodeShare(state);
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(await decodeShare(text)).toEqual({ kind: "ok", state });
  });

  it("round-trips the default state, and stays short", async () => {
    const text = await encodeShare(startFrom("base"));
    expect(text.length).toBeLessThan(200);
    expect(await decodeShare(text)).toEqual({
      kind: "ok",
      state: startFrom("base"),
    });
  });

  it("builds and reads a URL hash", async () => {
    const hash = await shareHash(state);
    expect(hash.startsWith("#share=")).toBe(true);
    expect(readShareHash(hash)).toBe(hash.slice(7));
    expect(readShareHash("#other")).toBeNull();
    expect(readShareHash("")).toBeNull();
  });

  it("passes a decoded link through the grammar", async () => {
    const hostile = {
      ...serialiseState(startFrom("base")),
      overrides: {
        "--ds-action-primary-bg": "red; } body { display: none } :root {",
        "--ds-surface-canvas": "#ffffff",
        "--ds-text-primary": "url(https://example.com/x)",
        "--ds-radius-card": "@import 'x'",
        "--ds-surface-subtle": "</style>",
      },
    };
    const result = await decodeShare(
      await gzipBase64Url(JSON.stringify(hostile)),
    );
    expect(result).toEqual({
      kind: "ok",
      state: parseState({
        ...serialiseState(startFrom("base")),
        overrides: { "--ds-surface-canvas": "#ffffff" },
      }),
    });
  });

  it("refuses an unknown (newer) version", async () => {
    const newer = { ...serialiseState(startFrom("base")), version: 99 };
    expect(
      await decodeShare(await gzipBase64Url(JSON.stringify(newer))),
    ).toEqual({ kind: "newer" });
  });

  it("refuses text that is not a design", async () => {
    for (const bad of [
      "",
      "not base64!",
      "AAAA",
      "H4sIAAAAAAAA",
      await gzipBase64Url("not json"),
      await gzipBase64Url("[]"),
      await gzipBase64Url(JSON.stringify({ start: "hacked" })),
      await gzipBase64Url(JSON.stringify({ start: "base", version: "2" })),
      42,
      null,
      undefined,
    ])
      expect(await decodeShare(bad)).toEqual({ kind: "invalid" });
  });

  it("refuses oversized input", async () => {
    expect(await decodeShare("A".repeat(maxEncodedLength + 1))).toEqual({
      kind: "invalid",
    });
    // A small link that expands past the cap (a zip bomb) stops while reading.
    const bomb = await gzipBase64Url(
      JSON.stringify({ start: "base", pad: "x".repeat(maxDecodedLength * 4) }),
    );
    expect(bomb.length).toBeLessThan(maxEncodedLength);
    expect(await decodeShare(bomb)).toEqual({ kind: "invalid" });
  });
});
