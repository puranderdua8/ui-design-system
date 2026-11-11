import * as React from "react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Fieldset } from "./fieldset";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import * as api from "../index";

const here = dirname(fileURLToPath(import.meta.url));
const source = (name: string) => readFileSync(resolve(here, name), "utf8");

describe("H3: server-safe style exports (F01)", () => {
  it.each([
    "input.styles.ts",
    "checkbox.styles.ts",
    "radio-group.styles.ts",
    "select.styles.ts",
  ])("%s has no client directive and no React import", (file) => {
    const text = source(file);
    expect(text).not.toMatch(/^\s*["']use client["']/m);
    expect(text).not.toMatch(/from ["']react["']/);
  });

  it("the client component files no longer export style values", () => {
    for (const file of [
      "input.tsx",
      "checkbox.tsx",
      "radio-group.tsx",
      "select.tsx",
    ]) {
      expect(source(file)).not.toMatch(
        /export const (inputVariants|checkboxClasses|radioGroupItemClasses|selectTriggerVariants)/,
      );
    }
  });

  it("the public API still exports the style helpers", () => {
    expect(typeof api.inputVariants).toBe("function");
    expect(typeof api.selectTriggerVariants).toBe("function");
    expect(typeof api.checkboxClasses).toBe("string");
    expect(typeof api.radioGroupItemClasses).toBe("string");
  });
});

describe("H3: radio invalid style via the group (F13)", () => {
  it("the group is a `group` and the item reads group aria-invalid", () => {
    render(
      <Fieldset legend="Contact" error="Pick one">
        <RadioGroup>
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>
      </Fieldset>,
    );
    const group = screen.getByRole("radiogroup");
    expect(group.getAttribute("aria-invalid")).toBe("true");
    expect(group.className).toMatch(/(^| )group( |$)/);
    expect(screen.getByRole("radio").className).toContain(
      "group-aria-invalid:enabled:border-ds-danger-border",
    );
  });
});

describe("H3: checkbox icons follow data-state (F14)", () => {
  it("uncontrolled defaultChecked=indeterminate renders the minus icon path", () => {
    render(<Checkbox aria-label="All" defaultChecked="indeterminate" />);
    const box = screen.getByRole("checkbox");
    expect(box.getAttribute("aria-checked")).toBe("mixed");
    expect(box.getAttribute("data-state")).toBe("indeterminate");
    const icons = box.querySelectorAll("svg");
    expect(icons).toHaveLength(2);
    // The check hides under an indeterminate root, the minus shows.
    expect(icons[0]?.getAttribute("class")).toContain(
      "group-data-[state=indeterminate]/checkbox:hidden",
    );
    expect(icons[1]?.getAttribute("class")).toContain(
      "group-data-[state=indeterminate]/checkbox:block",
    );
    expect(box.className).toContain("group/checkbox");
  });
});

describe("H3: empty description (F27)", () => {
  it('description="" renders no paragraph and no aria-describedby', () => {
    render(
      <Field label="Email" description="">
        <input />
      </Field>,
    );
    const field = document.querySelector('[data-slot="field"]');
    expect(field?.querySelector("p")).toBeNull();
    expect(screen.getByRole("textbox").getAttribute("aria-describedby")).toBe(
      null,
    );
  });
});

describe("H3: disabled wins over invalid (F28)", () => {
  it("no control uses a bare aria-invalid: border class", () => {
    for (const file of [
      "input.styles.ts",
      "checkbox.styles.ts",
      "radio-group.styles.ts",
      "select.styles.ts",
    ]) {
      expect(source(file)).not.toMatch(/(^|[\s"])aria-invalid:border-/);
      expect(source(file)).toContain("aria-invalid:enabled:border-");
    }
  });
});

describe("H3: public API (F18, F19)", () => {
  it("exports useFieldContext", () => {
    expect(typeof api.useFieldContext).toBe("function");
  });

  it('package exports["."] has a default condition after import', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(here, "../../package.json"), "utf8"),
    ) as { exports: Record<string, Record<string, string>> };
    const keys = Object.keys(pkg.exports["."] ?? {});
    expect(keys).toEqual(["types", "import", "default"]);
  });
});
