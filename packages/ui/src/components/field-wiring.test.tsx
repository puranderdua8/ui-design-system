import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";
import { Field, useFieldControlProps } from "./field";
import { describeMessages, joinIds } from "./field.styles";
import { Fieldset } from "./fieldset";
import { Input } from "./input";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./select";

afterEach(() => vi.restoreAllMocks());

// R06: a control's own `id` inside a Field used to unlink its label. The
// Field's id wins everywhere, and the control warns in development.
describe("H14: a control with its own id inside a Field is labelled (R06)", () => {
  it("Input", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field label="Name" description="As on your ID">
        <Input id="name" />
      </Field>,
    );
    const input = screen.getByLabelText("Name");
    expect(input.tagName).toBe("INPUT");
    expect(input.id).not.toBe("name");
    expect(input.getAttribute("aria-describedby")).toBe(
      `${input.id}-description`,
    );
    expect(document.getElementById(`${input.id}-description`)).not.toBeNull();
  });

  it("Checkbox", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field label="Agree" layout="inline">
        <Checkbox id="agree" />
      </Field>,
    );
    expect(screen.getByRole("checkbox", { name: "Agree" })).toBeTruthy();
  });

  it("SelectTrigger", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field label="Country" error="Required">
        <Select>
          <SelectTrigger id="country" />
          <SelectContent>
            <SelectItem value="nl">Netherlands</SelectItem>
          </SelectContent>
        </Select>
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Country" });
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-describedby")).toBe(
      `${trigger.id}-error`,
    );
  });

  it("RadioGroup (wrong parent, still labelled)", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field label="Plan">
        <RadioGroup id="plan">
          <RadioGroupItem value="a" aria-label="A" />
        </RadioGroup>
      </Field>,
    );
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeTruthy();
  });

  it("<Field id> is the control's id", () => {
    render(
      <Field label="Name" id="name">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText("Name").id).toBe("name");
  });

  it("the same id on Field and control is not a conflict", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field label="Name" id="name">
        <Input id="name" />
      </Field>,
    );
    expect(screen.getByLabelText("Name").id).toBe("name");
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns in development and names Field id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Field label="Name">
        <Input id="name" />
      </Field>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('<Field id="name">');
  });

  it("does not warn for a control outside a Field", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Input id="solo" aria-label="Solo" />);
    expect(screen.getByLabelText("Solo").id).toBe("solo");
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("H14: useFieldControlProps (R12)", () => {
  const Probe = (props: Parameters<typeof useFieldControlProps>[0]) => {
    const control = useFieldControlProps(props);
    return <output data-testid="probe">{JSON.stringify(control)}</output>;
  };
  const read = () =>
    JSON.parse(screen.getByTestId("probe").textContent ?? "{}") as Record<
      string,
      unknown
    >;

  it("passes props through outside a Field", () => {
    render(<Probe id="x" required aria-describedby="hint" />);
    expect(read()).toEqual({
      id: "x",
      required: true,
      "aria-describedby": "hint",
    });
  });

  it("takes id, required, invalid and describedBy from the Field and merges the caller's describedBy", () => {
    render(
      <Field label="L" required error="Bad" id="f">
        <Probe aria-describedby="hint" />
      </Field>,
    );
    expect(read()).toEqual({
      id: "f",
      required: true,
      "aria-invalid": true,
      "aria-describedby": "f-error hint",
    });
  });

  it("lets the control's own required and aria-invalid win", () => {
    render(
      <Field label="L" required error="Bad">
        <Probe required={false} aria-invalid={false} />
      </Field>,
    );
    expect(read().required).toBe(false);
    expect(read()["aria-invalid"]).toBe(false);
  });
});

describe("H14: shared description helpers", () => {
  it("joinIds drops empty values", () => {
    expect(joinIds("a", false, null, undefined, "", "b")).toBe("a b");
    expect(joinIds(false, undefined)).toBeUndefined();
  });

  it("describeMessages derives ids and describedBy", () => {
    expect(describeMessages("x", "d", "e")).toMatchObject({
      hasDescription: true,
      hasError: true,
      descriptionId: "x-description",
      errorId: "x-error",
      describedBy: "x-description x-error",
    });
    expect(describeMessages("x", "", false).describedBy).toBeUndefined();
  });

  it("Fieldset id is the fieldset's own id and ids derive from it", () => {
    const { container } = render(
      <Fieldset legend="Group" id="grp" description="Hint" error="Bad">
        <Input aria-label="One" />
      </Fieldset>,
    );
    const fieldset = container.querySelector("fieldset");
    expect(fieldset?.id).toBe("grp");
    expect(fieldset?.getAttribute("aria-describedby")).toBe(
      "grp-description grp-error",
    );
  });
});
