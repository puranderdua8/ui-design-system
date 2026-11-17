// Share link codec (S48, spec 5.2 and 5.3). A design is its state: encoded as JSON,
// gzipped with the native `CompressionStream`, then base64url, so it fits in the URL
// hash (which never reaches a server or analytics). Decoding treats the link as
// untrusted: a size cap before and while decompressing, then `parseState`, which drops
// every value the grammar refuses. Pure of React and the DOM; needs `CompressionStream`
// (every current browser and Node 18+).
import { parseState, serialiseState, stateVersion } from "./state";
import type { PlaygroundState } from "./types";

/** Longest encoded text read (about 6 KB of JSON once compressed is far more than a design). */
export const maxEncodedLength = 8_000;
/** Longest JSON read after decompressing: a zip bomb stops here. */
export const maxDecodedLength = 64_000;

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const fromBase64Url = (text: string): Uint8Array | null => {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null;
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
};

const pump = async (
  input: Uint8Array,
  stream: CompressionStream | DecompressionStream,
  limit: number,
): Promise<Uint8Array | null> => {
  const writer = stream.writable.getWriter();
  // Errors surface on the read side; do not leave a rejected write unhandled.
  void writer.write(input as BufferSource).catch(() => undefined);
  void writer.close().catch(() => undefined);
  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } catch {
    return null;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
};

/** The state as base64url text for the URL hash. */
export const encodeShare = async (state: PlaygroundState): Promise<string> => {
  const json = new TextEncoder().encode(JSON.stringify(serialiseState(state)));
  const packed = await pump(
    json,
    new CompressionStream("gzip"),
    maxDecodedLength,
  );
  if (!packed) throw new Error("this design is too large to share as a link");
  return toBase64Url(packed);
};

export type DecodedShare =
  | { kind: "ok"; state: PlaygroundState }
  /** Written by a newer site: not read, so the person is told to update rather than shown a guess. */
  | { kind: "newer" }
  | { kind: "invalid" };

/** Reads share text back into a state. Never throws; everything that is not a design is `invalid`. */
export const decodeShare = async (text: unknown): Promise<DecodedShare> => {
  if (typeof text !== "string" || text.length > maxEncodedLength)
    return { kind: "invalid" };
  const bytes = fromBase64Url(text);
  if (!bytes) return { kind: "invalid" };
  const unpacked = await pump(
    bytes,
    new DecompressionStream("gzip"),
    maxDecodedLength,
  );
  if (!unpacked) return { kind: "invalid" };
  let raw: unknown;
  try {
    raw = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(unpacked),
    );
  } catch {
    return { kind: "invalid" };
  }
  const version =
    raw && typeof raw === "object" ? (raw as { version?: unknown }).version : 0;
  if (typeof version === "number" && version > stateVersion)
    return { kind: "newer" };
  const state = parseState(raw);
  return state ? { kind: "ok", state } : { kind: "invalid" };
};

/** The hash fragment key: `#share=<text>`. */
const hashKey = "share=";

export const shareHash = async (state: PlaygroundState): Promise<string> =>
  `#${hashKey}${await encodeShare(state)}`;

/** The share text in a URL hash (`#share=…`), or `null` if the hash is not a share link. */
export const readShareHash = (hash: string): string | null =>
  hash.startsWith(`#${hashKey}`) ? hash.slice(hashKey.length + 1) : null;
