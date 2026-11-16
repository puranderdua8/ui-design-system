import * as React from "react";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { act } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Banner } from "./banner";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Fieldset } from "./fieldset";
import { Input } from "./input";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { DirectionProvider, ThemeScope } from "./theme-scope";

// A client component is rendered on the server and hydrated in the browser
// (Next does both). Each case renders to a string, hydrates that markup in
// StrictMode, and fails on any hydration error or warning, and when React
// rebuilds a server node instead of reusing it (R37). The markup itself may
// change after mount (Radix Select fills its value text), so it is not compared
// as a string. `check:rsc` covers the real Next build; this runs in `pnpm test`
// and so on every PR.

beforeAll(() => {
  // BannerVideo reads `prefers-reduced-motion`; jsdom has no matchMedia.
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  // Radix Select calls these while it mounts.
  const proto = Element.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const field = (
  <Field
    label="Email"
    description="We never share it."
    error="Enter a valid email."
    required
  >
    <Input defaultValue="a@b.c" />
  </Field>
);

const fieldset = (
  <Fieldset legend="Contact" description="How we reach you." error="Pick one.">
    <Checkbox aria-label="Newsletter" defaultChecked />
  </Fieldset>
);

const select = (
  <Select defaultValue="b">
    <SelectTrigger aria-label="Letter">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="a">A</SelectItem>
      <SelectItem value="b">B</SelectItem>
    </SelectContent>
  </Select>
);

/** One entry per file under `src/components` that starts with "use client". */
const cases: Record<string, Record<string, React.ReactNode>> = {
  "banner-video": {
    "Banner with a video": (
      <Banner
        aria-label="Hero"
        video={{ src: "/clip.mp4", poster: "/poster.jpg" }}
      >
        Hello
      </Banner>
    ),
  },
  checkbox: {
    "Checkbox (unchecked, checked, disabled)": (
      <>
        <Checkbox aria-label="One" />
        <Checkbox aria-label="Two" defaultChecked />
        <Checkbox aria-label="Three" disabled />
      </>
    ),
  },
  field: { "Field with description and error": field },
  fieldset: { "Fieldset with legend, description and error": fieldset },
  input: {
    "Input (sizes, invalid, disabled)": (
      <>
        <Input aria-label="Small" size="sm" />
        <Input aria-label="Invalid" aria-invalid defaultValue="x" />
        <Input aria-label="Disabled" disabled />
      </>
    ),
  },
  "radio-group": {
    RadioGroup: (
      <RadioGroup defaultValue="a" aria-label="Choice">
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>
    ),
  },
  select: { "Select, closed": select },
  tabs: {
    "Tabs (horizontal and vertical)": (
      <>
        <Tabs defaultValue="one">
          <TabsList aria-label="Horizontal">
            <TabsTrigger value="one">One</TabsTrigger>
            <TabsTrigger value="two">Two</TabsTrigger>
          </TabsList>
          <TabsContent value="one">First</TabsContent>
          <TabsContent value="two">Second</TabsContent>
        </Tabs>
        <Tabs defaultValue="a" orientation="vertical">
          <TabsList aria-label="Vertical">
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel</TabsContent>
        </Tabs>
      </>
    ),
  },
  "theme-scope": {
    "ThemeScope with a Select and a direction": (
      <ThemeScope theme="nature" vars={{ "--ds-radius-md": "1rem" }} dir="rtl">
        {select}
      </ThemeScope>
    ),
    DirectionProvider: <DirectionProvider dir="rtl">{field}</DirectionProvider>,
  },
};

let mounted: { root: Root; container: HTMLElement } | undefined;

afterEach(() => {
  if (mounted) {
    act(() => mounted!.root.unmount());
    mounted.container.remove();
    mounted = undefined;
  }
  vi.restoreAllMocks();
});

const hydrate = async (ui: React.ReactNode) => {
  const html = renderToString(ui);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  const serverNodes = [...container.querySelectorAll("*")];

  const problems: unknown[] = [];
  vi.spyOn(console, "error").mockImplementation((...args) => {
    problems.push(args);
  });
  vi.spyOn(console, "warn").mockImplementation((...args) => {
    problems.push(args);
  });

  let root!: Root;
  act(() => {
    root = hydrateRoot(container, <React.StrictMode>{ui}</React.StrictMode>, {
      onRecoverableError: (error) => problems.push(error),
    });
  });
  mounted = { root, container };
  return { container, serverNodes, problems };
};

describe("client components hydrate without errors (R37)", () => {
  for (const [file, variants] of Object.entries(cases))
    for (const [name, ui] of Object.entries(variants))
      it(`${file}: ${name}`, async () => {
        const { container, serverNodes, problems } = await hydrate(ui);
        expect(problems).toEqual([]);
        // The first node of each server element is still in the document: React
        // adopted it. A discarded subtree would have replaced it.
        const adopted = serverNodes.filter((node) => container.contains(node));
        expect(adopted.length).toBeGreaterThan(0);
        expect(container.firstElementChild).toBe(serverNodes[0]);
      });

  it("every file that starts with 'use client' has a case here", () => {
    const dir = resolve(__dirname);
    const clientFiles = readdirSync(dir)
      .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
      .filter((file) =>
        /^\s*["']use client["']/.test(readFileSync(resolve(dir, file), "utf8")),
      )
      .map((file) => file.replace(/\.tsx$/, ""))
      .sort();
    expect(Object.keys(cases).sort()).toEqual(clientFiles);
  });
});
