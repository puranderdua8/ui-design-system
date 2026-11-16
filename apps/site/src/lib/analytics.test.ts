import { describe, expect, it } from "vitest";
import { stripHash } from "./analytics";

describe("stripHash", () => {
  it("removes the hash and keeps path and query", () => {
    expect(
      stripHash({ type: "pageview", url: "https://x.app/build?a=1#d=abc123" })
        .url,
    ).toBe("https://x.app/build?a=1");
  });

  it("removes a bare trailing hash", () => {
    expect(stripHash({ url: "https://x.app/#" }).url).toBe("https://x.app/");
  });

  it("returns the same event when there is no hash", () => {
    const event = { url: "https://x.app/about" };
    expect(stripHash(event)).toBe(event);
  });

  it("keeps other fields", () => {
    expect(stripHash({ type: "pageview", url: "/a#b" })).toEqual({
      type: "pageview",
      url: "/a",
    });
  });
});
