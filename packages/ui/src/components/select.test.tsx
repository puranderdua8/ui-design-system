import * as React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./field";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// jsdom lacks the pointer and layout APIs Radix Select calls.
beforeAll(() => {
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

const Fruit = ({
  triggerProps,
  ...props
}: React.ComponentProps<typeof Select> & {
  triggerProps?: React.ComponentProps<typeof SelectTrigger>;
}) => (
  <Select {...props}>
    <SelectTrigger aria-label="Fruit" {...triggerProps}>
      <SelectValue placeholder="Pick a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruit</SelectLabel>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry" disabled>
          Cherry
        </SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectItem value="date">Date</SelectItem>
    </SelectContent>
  </Select>
);

describe("Select", () => {
  it("shows the placeholder and opens with the keyboard", async () => {
    const user = userEvent.setup();
    render(<Fruit />);
    const trigger = screen.getByRole("combobox", { name: "Fruit" });
    expect(trigger.textContent).toContain("Pick a fruit");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    await user.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(await screen.findByRole("listbox")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("moves with the arrow keys, skips disabled items and selects with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruit onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("option", { name: "Apple" }),
      ),
    );
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: "Banana" }),
    );
    // Cherry is disabled, so the next item is Date.
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: "Date" }),
    );
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("date");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(screen.getByRole("combobox").textContent).toContain("Date");
  });

  it("selects by typeahead", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Fruit onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await user.keyboard("b");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("option", { name: "Banana" }),
      ),
    );
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("banana");
  });

  it("closes with Escape, keeps the value and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Fruit defaultValue="apple" />);
    const trigger = screen.getByRole("combobox");
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toContain("Apple");
    expect(document.activeElement).toBe(trigger);
  });

  it("is named by a Field label and takes description, error and required", () => {
    render(
      <Field label="Fruit" description="Pick one" error="Required" required>
        <Fruit triggerProps={{ "aria-label": undefined }} />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: /Fruit/ });
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(trigger.getAttribute("aria-required")).toBe("true");
    const ids = trigger.getAttribute("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0]!)?.textContent).toBe("Pick one");
    expect(document.getElementById(ids[1]!)?.textContent).toBe("Required");
  });

  it("is named by a plain Label with htmlFor", () => {
    render(
      <>
        <Label htmlFor="fruit">Favourite fruit</Label>
        <Fruit triggerProps={{ id: "fruit", "aria-label": undefined }} />
      </>,
    );
    expect(
      screen.getByRole("combobox", { name: "Favourite fruit" }),
    ).toBeTruthy();
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Fruit disabled />);
    const trigger = screen.getByRole<HTMLButtonElement>("combobox");
    expect(trigger.disabled).toBe(true);
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("portals the list into `container`", async () => {
    const user = userEvent.setup();
    const scope = document.createElement("div");
    scope.setAttribute("data-testid", "scope");
    document.body.appendChild(scope);
    render(
      <Select>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent container={scope}>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>,
    );
    await user.click(screen.getByRole("combobox"));
    const list = await screen.findByRole("listbox");
    expect(scope.contains(list)).toBe(true);
    scope.remove();
  });

  it("sizes the trigger and uses token classes only", async () => {
    const user = userEvent.setup();
    render(<Fruit triggerProps={{ size: "sm" }} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("data-size")).toBe("sm");
    expect(trigger.className).toContain("h-ds-control-sm");
    expect(trigger.className).toContain("ds-focus-ring");
    expect(trigger.className).toContain("aria-invalid:border-ds-danger-border");
    expect(trigger.className).toContain("disabled:bg-ds-disabled");
    await user.click(trigger);
    const content = (await screen.findByRole("listbox")).closest(
      "[data-slot=select-content]",
    )!;
    expect(content.className).toContain("bg-ds-surface-raised");
    expect(content.className).toContain("shadow-ds-overlay");
  });

  it("has no axe violations (closed and open)", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Fruit" description="Pick one">
        <Fruit
          triggerProps={{ "aria-label": undefined }}
          defaultValue="apple"
        />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("combobox"));
    await screen.findByRole("listbox");
    // The test page has no landmarks, so the page-level "region" rule is off.
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } }),
    ).toHaveNoViolations();
  });
});
