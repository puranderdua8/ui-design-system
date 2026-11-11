import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./field";
import { Input } from "./input";
import { inputVariants } from "./input.styles";
import { Label } from "./label";

describe("Label", () => {
  it("is a <label> with the label role and activates its control", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="x">Name</Label>
        <input id="x" />
      </>,
    );
    const label = screen.getByText("Name");
    expect(label.tagName).toBe("LABEL");
    expect(label.className).toContain("ds-type-label");
    await user.click(label);
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
  });

  it("hides the required marker from assistive technology", () => {
    render(
      <Label htmlFor="x" required>
        Name
      </Label>,
    );
    const marker = screen.getByText("*");
    expect(marker.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("Input", () => {
  it("defaults to type=text, md", () => {
    render(<Input aria-label="Name" />);
    const el = screen.getByRole("textbox", { name: "Name" });
    expect(el.getAttribute("type")).toBe("text");
    expect(el.getAttribute("data-size")).toBe("md");
  });

  it("supports sizes from the control tokens", () => {
    expect(inputVariants({ size: "sm" })).toContain("h-ds-control-sm");
    expect(inputVariants({ size: "md" })).toContain("h-ds-control-md");
  });

  it("takes typed text and blocks input when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <>
        <Input aria-label="A" onChange={onChange} />
        <Input aria-label="B" disabled />
      </>,
    );
    await user.type(screen.getByRole("textbox", { name: "A" }), "hi");
    await user.type(screen.getByRole("textbox", { name: "B" }), "hi");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "B" }).value,
    ).toBe("");
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "B" }).disabled,
    ).toBe(true);
  });

  it("styles invalid from aria-invalid and keeps a caller's aria-describedby", () => {
    render(<Input aria-label="A" aria-invalid aria-describedby="note" />);
    const el = screen.getByRole("textbox");
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(el.getAttribute("aria-describedby")).toBe("note");
    expect(el.className).toContain(
      "aria-invalid:enabled:border-ds-danger-border",
    );
  });

  it("types a callback ref as HTMLInputElement", () => {
    let node: HTMLInputElement | null = null;
    render(
      <Input
        aria-label="A"
        ref={(el: HTMLInputElement | null) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLInputElement);
    // @ts-expect-error a callback for the wrong element type is rejected
    <Input ref={(el: HTMLButtonElement | null) => void el} />;
  });
});

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="Email">
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.id).toBeTruthy();
    expect(screen.getByText("Email").getAttribute("for")).toBe(input.id);
  });

  it("gives separate fields separate ids", () => {
    render(
      <>
        <Field label="First">
          <Input />
        </Field>
        <Field label="Second">
          <Input />
        </Field>
      </>,
    );
    expect(screen.getByRole("textbox", { name: "First" }).id).not.toBe(
      screen.getByRole("textbox", { name: "Second" }).id,
    );
  });

  it("announces the description with the control", () => {
    render(
      <Field label="Email" description="We never share it.">
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(
      screen.getByRole("textbox", {
        name: "Email",
        description: "We never share it.",
      }),
    ).toBe(input);
    expect(input.hasAttribute("aria-invalid")).toBe(false);
  });

  it("marks the control invalid and announces the error", () => {
    render(
      <Field
        label="Email"
        description="Work address."
        error="Enter a valid email."
      >
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", {
      name: "Email",
      description: "Work address. Enter a valid email.",
    });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Enter a valid email.");
  });

  it("sets required on the control and shows the marker", () => {
    render(
      <Field label="Email" required>
        <Input />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect((input as HTMLInputElement).required).toBe(true);
    expect(screen.getByText("*")).toBeTruthy();
  });

  it("uses a fixed id and lets the control's own props win", () => {
    render(
      <Field label="Email" id="email" required>
        <Input required={false} />
      </Field>,
    );
    const input = screen.getByRole("textbox");
    expect(input.id).toBe("email");
    expect((input as HTMLInputElement).required).toBe(false);
  });

  it("has no axe violations in each state", async () => {
    const { container } = render(
      <>
        <Field label="Plain">
          <Input />
        </Field>
        <Field label="Described" description="Help" required>
          <Input size="sm" />
        </Field>
        <Field label="Invalid" error="Broken">
          <Input />
        </Field>
        <Field label="Disabled">
          <Input disabled />
        </Field>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
