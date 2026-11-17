import { describe, expect, it } from "vitest";
import { bannedWords, builderContent, maxSentenceWords } from "./builder";

/** Every string in the content, with the path it was found at. */
const collect = (
  value: unknown,
  path: string,
  out: { path: string; text: string }[] = [],
) => {
  if (typeof value === "string") out.push({ path, text: value });
  else if (Array.isArray(value))
    value.forEach((v, i) => collect(v, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value))
      collect(v, path ? `${path}.${k}` : k, out);
  }
  return out;
};

const strings = collect(builderContent, "");
const sentences = (text: string) =>
  text
    .replace(/\{\w+\}/g, "1")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
const words = (sentence: string) => sentence.split(/\s+/).filter(Boolean);

describe("Builder content (spec 4.10)", () => {
  it("has strings to check", () => {
    expect(strings.length).toBeGreaterThan(150);
  });

  it("has no empty string", () => {
    expect(
      strings.filter((s) => s.text.trim() === "").map((s) => s.path),
    ).toEqual([]);
  });

  it("uses no banned word in any Guided string", () => {
    const found = strings.flatMap(({ path, text }) =>
      bannedWords
        .filter((w) => new RegExp(`\\b${w}\\b`, "i").test(text))
        .map((w) => `${path}: "${w}" in "${text}"`),
    );
    expect(found).toEqual([]);
  });

  it("keeps every sentence within the length rule", () => {
    const tooLong = strings.flatMap(({ path, text }) =>
      sentences(text)
        .filter((s) => words(s).length > maxSentenceWords)
        .map((s) => `${path}: ${words(s).length} words: "${s}"`),
    );
    expect(tooLong).toEqual([]);
  });

  it("catches a banned word and a long sentence (the checks can fail)", () => {
    expect(
      bannedWords.some((w) =>
        new RegExp(`\\b${w}\\b`, "i").test("Pick a hue."),
      ),
    ).toBe(true);
    const long =
      Array.from({ length: maxSentenceWords + 1 }, () => "word").join(" ") +
      ".";
    expect(words(sentences(long)[0]!).length).toBeGreaterThan(maxSentenceWords);
  });

  it("only uses known placeholders", () => {
    const known = new Set(["step", "count"]);
    const unknown = strings.flatMap(({ path, text }) =>
      [...text.matchAll(/\{(\w+)\}/g)]
        .filter((m) => !known.has(m[1]!))
        .map((m) => `${path}: {${m[1]}}`),
    );
    expect(unknown).toEqual([]);
  });
});

describe("Builder steps (spec 4.4)", () => {
  const { steps } = builderContent;

  it("has the eight steps in order", () => {
    expect(steps.map((s) => s.id)).toEqual([
      "start",
      "colour",
      "typography",
      "shape",
      "spacing",
      "depth",
      "check",
      "use",
    ]);
  });

  it("gives every step a question, a what-it-is, a where-it-shows and a why-it-matters", () => {
    for (const s of steps) {
      expect(s.name, s.id).toBeTruthy();
      expect(s.question, s.id).toMatch(/[?]$|[^.]$/);
      expect(s.whatItIs, s.id).toBeTruthy();
      expect(s.whereItShows, s.id).toBeTruthy();
      expect(s.whyItMatters, s.id).toBeTruthy();
    }
  });

  it("gives every picture choice a name and a hint, unique within its group", () => {
    for (const s of steps) {
      for (const g of s.groups) {
        expect(g.choices.length, `${s.id}/${g.label}`).toBeGreaterThanOrEqual(
          2,
        );
        const names = g.choices.map((c) => c.name);
        expect(new Set(names).size, `${s.id}/${g.label}`).toBe(names.length);
        for (const c of g.choices)
          expect(c.hint, `${s.id}/${c.name}`).toBeTruthy();
      }
    }
  });

  it("has the choices the spec lists", () => {
    const names = (id: string, group: number) =>
      steps.find((s) => s.id === id)!.groups[group]!.choices.map((c) => c.name);
    expect(names("start", 0)).toHaveLength(4);
    expect(names("shape", 0)).toEqual([
      "Sharp",
      "Soft",
      "Rounded",
      "Extra round",
    ]);
    expect(names("spacing", 0)).toEqual(["Compact", "Comfortable", "Spacious"]);
    expect(names("depth", 0)).toEqual(["Flat", "Crisp", "Soft", "Hard"]);
    expect(names("depth", 1)).toEqual(["Quick", "Standard", "Calm", "Bouncy"]);
    expect(names("typography", 1)).toEqual(["Compact", "Standard", "Large"]);
  });

  it("says where each next button goes", () => {
    expect(builderContent.buttons.next.replace("{step}", steps[2]!.name)).toBe(
      "Next: Typography",
    );
  });
});
