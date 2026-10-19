import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("Checkbox", () => {
  it("toggles with Space and reports the change", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Agree" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "Agree" });
    expect(box.getAttribute("aria-checked")).toBe("false");
    await user.tab();
    expect(document.activeElement).toBe(box);
    await user.keyboard(" ");
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(" ");
    expect(box.getAttribute("aria-checked")).toBe("false");
  });

  it("is toggled by clicking its Label", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox id="news" />
        <Label htmlFor="news">Newsletter</Label>
      </>,
    );
    await user.click(screen.getByText("Newsletter"));
    expect(
      screen
        .getByRole("checkbox", { name: "Newsletter" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("supports the indeterminate state", () => {
    render(<Checkbox aria-label="All" checked="indeterminate" />);
    expect(screen.getByRole("checkbox").getAttribute("aria-checked")).toBe(
      "mixed",
    );
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="Off" disabled />);
    const box = screen.getByRole("checkbox");
    await user.click(box);
    expect(box.getAttribute("aria-checked")).toBe("false");
    expect((box as HTMLButtonElement).disabled).toBe(true);
  });

  it("takes id, description, error and invalid state from a Field", () => {
    render(
      <Field label="Terms" description="Read first" error="Required" required>
        <Checkbox />
      </Field>,
    );
    const box = screen.getByRole("checkbox", { name: /Terms/ });
    expect(box.getAttribute("aria-invalid")).toBe("true");
    expect(box.getAttribute("aria-required")).toBe("true");
    const ids = box.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0]!)?.textContent).toBe("Read first");
    expect(document.getElementById(ids[1]!)?.textContent).toBe("Required");
  });

  it("uses token classes only for state", () => {
    render(<Checkbox aria-label="x" />);
    const cls = screen.getByRole("checkbox").className;
    expect(cls).toContain("border-ds-border-control");
    expect(cls).toContain("data-[state=checked]:bg-ds-primary");
    expect(cls).toContain("ds-focus-ring");
    expect(cls).toContain("disabled:bg-ds-disabled");
    expect(cls).toContain("aria-invalid:border-ds-danger-border");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Field label="Terms" description="Read first">
        <Checkbox defaultChecked />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

const Group = (props: React.ComponentProps<typeof RadioGroup>) => (
  <RadioGroup {...props}>
    <div>
      <RadioGroupItem value="a" id="r-a" />
      <Label htmlFor="r-a">Alpha</Label>
    </div>
    <div>
      <RadioGroupItem value="b" id="r-b" />
      <Label htmlFor="r-b">Beta</Label>
    </div>
    <div>
      <RadioGroupItem value="c" id="r-c" disabled />
      <Label htmlFor="r-c">Gamma</Label>
    </div>
  </RadioGroup>
);

describe("RadioGroup", () => {
  it("moves selection with the arrow keys and skips disabled items", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Group
        aria-label="Letters"
        defaultValue="a"
        onValueChange={onValueChange}
      />,
    );
    const alpha = screen.getByRole("radio", { name: "Alpha" });
    const beta = screen.getByRole("radio", { name: "Beta" });
    expect(alpha.getAttribute("aria-checked")).toBe("true");
    alpha.focus();
    // Radix selects the focused radio on the next animation frame, but only
    // while the arrow key is still down, so hold the key until it has.
    await user.keyboard("{ArrowDown>}");
    expect(document.activeElement).toBe(beta);
    await waitFor(() => expect(beta.getAttribute("aria-checked")).toBe("true"));
    await user.keyboard("{/ArrowDown}");
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    // Gamma is disabled, so the next radio wraps back to Alpha.
    await user.keyboard("{ArrowDown>}");
    expect(document.activeElement).toBe(alpha);
    await waitFor(() =>
      expect(alpha.getAttribute("aria-checked")).toBe("true"),
    );
    await user.keyboard("{/ArrowDown}");
  });

  it("selects by clicking a Label", async () => {
    const user = userEvent.setup();
    render(<Group aria-label="Letters" />);
    await user.click(screen.getByText("Beta"));
    expect(
      screen.getByRole("radio", { name: "Beta" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("does not select a disabled item", async () => {
    const user = userEvent.setup();
    render(<Group aria-label="Letters" />);
    await user.click(screen.getByRole("radio", { name: "Gamma" }));
    expect(
      screen.getByRole("radio", { name: "Gamma" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("is named, described and marked invalid by a Field", () => {
    render(
      <Field label="Letter" description="Pick one" error="Choose a letter">
        <Group />
      </Field>,
    );
    const group = screen.getByRole("radiogroup", { name: "Letter" });
    expect(group.getAttribute("aria-invalid")).toBe("true");
    const ids = group.getAttribute("aria-describedby")!.split(" ");
    expect(document.getElementById(ids[0]!)?.textContent).toBe("Pick one");
    expect(document.getElementById(ids[1]!)?.textContent).toBe(
      "Choose a letter",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Field label="Letter" description="Pick one">
        <Group defaultValue="b" />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
