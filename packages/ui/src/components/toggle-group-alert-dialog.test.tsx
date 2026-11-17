import * as React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { ThemeScope } from "./theme-scope";
import { toggleGroupItemClasses } from "./toggle-group.styles";
import { alertDialogContentClasses } from "./alert-dialog.styles";

beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
});

const Align = (props: React.ComponentProps<typeof ToggleGroup>) => (
  <ToggleGroup aria-label="Alignment" {...props}>
    <ToggleGroupItem value="left">Left</ToggleGroupItem>
    <ToggleGroupItem value="center">Centre</ToggleGroupItem>
    <ToggleGroupItem value="right">Right</ToggleGroupItem>
  </ToggleGroup>
);

describe("ToggleGroup", () => {
  it("single: one item is pressed at a time and onValueChange reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Align type="single" onValueChange={onValueChange} />);
    const left = screen.getByRole("radio", { name: "Left" });
    const right = screen.getByRole("radio", { name: "Right" });
    await user.click(left);
    expect(left.getAttribute("data-state")).toBe("on");
    await user.click(right);
    expect(left.getAttribute("data-state")).toBe("off");
    expect(right.getAttribute("data-state")).toBe("on");
    expect(onValueChange).toHaveBeenLastCalledWith("right");
  });

  it("multiple: several items can be pressed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Align type="multiple" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Left" }));
    await user.click(screen.getByRole("button", { name: "Right" }));
    expect(
      screen.getByRole("button", { name: "Left" }).getAttribute("aria-pressed"),
    ).toBe("true");
    expect(onValueChange).toHaveBeenLastCalledWith(["left", "right"]);
  });

  it("arrow keys move focus between items and Space presses", async () => {
    const user = userEvent.setup();
    render(<Align type="single" defaultValue="left" />);
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "Left" }),
    );
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "Centre" }),
    );
    await user.keyboard(" ");
    expect(
      screen.getByRole("radio", { name: "Centre" }).getAttribute("data-state"),
    ).toBe("on");
  });

  it("a pressed item is not shown by colour alone", () => {
    // Heavier border (recipe) plus a fill; forced colours keep an outline.
    expect(toggleGroupItemClasses).toContain("ds-border-selected");
    expect(toggleGroupItemClasses).toContain("data-[state=on]:bg-ds-primary");
    expect(toggleGroupItemClasses).toContain(
      "forced-colors:data-[state=on]:outline-solid",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<Align type="single" defaultValue="left" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

const Confirm = ({
  container,
  onAction,
}: {
  container?: HTMLElement | null;
  onAction?: () => void;
}) => (
  <AlertDialog>
    <AlertDialogTrigger>Delete project</AlertDialogTrigger>
    <AlertDialogContent {...(container !== undefined ? { container } : {})}>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction onClick={onAction}>Delete</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const vars = { "--ds-color-surface-raised": "rgb(1, 2, 3)" };

describe("AlertDialog", () => {
  it("opens with a name and description, and focuses Cancel", async () => {
    const user = userEvent.setup();
    render(<Confirm />);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Delete this project?",
    });
    expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Keep it" }),
      ),
    );
  });

  it("traps Tab inside and returns focus to the trigger on close", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Confirm />
        <button type="button">Outside</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Delete project" });
    await user.click(trigger);
    await screen.findByRole("alertdialog");
    for (let i = 0; i < 4; i += 1) {
      await user.tab();
      expect(
        screen.getByRole("alertdialog").contains(document.activeElement),
      ).toBe(true);
    }
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it("runs the action and closes; a click outside does not dismiss", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<Confirm onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    await screen.findByRole("alertdialog");
    // The scrim is the only thing outside the panel; clicking it must not dismiss.
    const overlay = document.querySelector<HTMLElement>(
      "[data-slot=alert-dialog-overlay]",
    )!;
    await user.pointer({ target: overlay, keys: "[MouseLeft]" });
    expect(screen.queryByRole("alertdialog")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
  });

  it("carries a ThemeScope's theme, vars and direction, outside the scope", async () => {
    const user = userEvent.setup();
    render(
      <ThemeScope theme="nature" vars={vars} dir="rtl" data-testid="scope">
        <Confirm />
      </ThemeScope>,
    );
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog");
    const portal = dialog.closest<HTMLElement>("[data-slot=scoped-portal]");
    expect(screen.getByTestId("scope").contains(dialog)).toBe(false);
    expect(portal?.parentElement).toBe(document.body);
    expect(portal?.getAttribute("data-ds-theme")).toBe("nature");
    expect(portal?.getAttribute("dir")).toBe("rtl");
    expect(portal?.style.getPropertyValue("--ds-color-surface-raised")).toBe(
      "rgb(1, 2, 3)",
    );
    expect(portal?.className).toContain("ds-tone-raised");
  });

  it("an explicit container wins over the ThemeScope", async () => {
    const user = userEvent.setup();
    const other = document.createElement("div");
    document.body.append(other);
    render(
      <ThemeScope theme="nature" vars={vars} data-testid="scope">
        <Confirm container={other} />
      </ThemeScope>,
    );
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(other.contains(dialog)).toBe(true);
    expect(screen.getByTestId("scope").contains(dialog)).toBe(false);
    await user.keyboard("{Escape}");
    other.remove();
  });

  it("uses the layer and scrim tokens, not a raw z-index or colour", async () => {
    const user = userEvent.setup();
    render(<Confirm />);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog");
    const overlay = document.querySelector("[data-slot=alert-dialog-overlay]");
    expect(overlay?.className).toContain("ds-layer-overlay");
    expect(overlay?.className).toContain("bg-ds-scrim");
    expect(dialog.className).toContain("ds-layer-modal");
    expect(`${alertDialogContentClasses}`).not.toMatch(/(^|\s)z-\d+|\[#/);
  });

  it("has no axe violations when open", async () => {
    const user = userEvent.setup();
    render(<Confirm />);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    const dialog = await screen.findByRole("alertdialog");
    expect(await axe(dialog)).toHaveNoViolations();
  });
});
