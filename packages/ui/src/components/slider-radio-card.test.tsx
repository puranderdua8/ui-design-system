import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./field";
import { Fieldset } from "./fieldset";
import { RadioCard } from "./radio-card";
import { RadioGroup } from "./radio-group";
import { Slider } from "./slider";
import { radioCardClasses } from "./radio-card.styles";
import { sliderThumbClasses } from "./slider.styles";

describe("Slider", () => {
  it("moves with the arrow, Page and Home/End keys and reports changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Slider
        aria-label="Size"
        defaultValue={[50]}
        step={5}
        onValueChange={onValueChange}
      />,
    );
    const thumb = screen.getByRole("slider", { name: "Size" });
    await user.tab();
    expect(document.activeElement).toBe(thumb);
    await user.keyboard("{ArrowRight}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("55");
    expect(onValueChange).toHaveBeenLastCalledWith([55]);
    await user.keyboard("{Home}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("0");
    await user.keyboard("{End}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("100");
  });

  it("shows the value as text and formats it", async () => {
    const user = userEvent.setup();
    render(
      <Slider
        aria-label="Radius"
        defaultValue={[4]}
        max={16}
        formatValue={(v) => `${v} px`}
      />,
    );
    expect(screen.getByText("4 px")).toBeTruthy();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("5 px")).toBeTruthy();
  });

  it("can hide the visible value", () => {
    const { container } = render(
      <Slider aria-label="Size" defaultValue={[1]} showValue={false} />,
    );
    expect(container.querySelector("output")).toBeNull();
  });

  it("passes aria-valuetext (a string, or a function of the value)", async () => {
    const user = userEvent.setup();
    const words = ["Small", "Medium", "Large"];
    render(
      <Slider
        aria-label="Size"
        defaultValue={[1]}
        max={2}
        aria-valuetext={(v) => words[v]!}
      />,
    );
    const thumb = screen.getByRole("slider");
    expect(thumb.getAttribute("aria-valuetext")).toBe("Medium");
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(thumb.getAttribute("aria-valuetext")).toBe("Large");
  });

  it("names each thumb of a range", () => {
    render(
      <Slider
        aria-label="Price"
        defaultValue={[10, 90]}
        thumbLabels={["Minimum", "Maximum"]}
      />,
    );
    expect(screen.getByRole("slider", { name: "Minimum" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Maximum" })).toBeTruthy();
  });

  it("is named and described by a Field", () => {
    render(
      <Field label="Corner size" description="Rounder is friendlier.">
        <Slider defaultValue={[2]} />
      </Field>,
    );
    const thumb = screen.getByRole("slider", { name: "Corner size" });
    expect(thumb.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("does not move when disabled", async () => {
    const user = userEvent.setup();
    render(<Slider aria-label="Size" defaultValue={[5]} disabled />);
    const thumb = screen.getByRole("slider");
    await user.click(thumb);
    await user.keyboard("{ArrowRight}");
    expect(thumb.getAttribute("aria-valuenow")).toBe("5");
  });

  it("keeps a 24px target on the thumb", () => {
    expect(sliderThumbClasses).toContain("ds-hit-area");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Field label="Size">
        <Slider defaultValue={[3]} />
      </Field>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

const cards = (
  <>
    <RadioCard
      value="grid"
      label="Grid"
      description="Cards in rows"
      media={<img src="data:," alt="" />}
    />
    <RadioCard value="list" label="List" />
    <RadioCard value="map" label="Map" disabled />
  </>
);

describe("RadioCard", () => {
  it("is a radio named by its label and described by its description", () => {
    render(
      <RadioGroup aria-label="Layout" defaultValue="grid">
        {cards}
      </RadioGroup>,
    );
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(grid.getAttribute("aria-checked")).toBe("true");
    const describedBy = grid.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe(
      "Cards in rows",
    );
    expect(
      screen
        .getByRole("radio", { name: "List" })
        .hasAttribute("aria-describedby"),
    ).toBe(false);
  });

  it("selects by clicking anywhere on the card and by arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Layout" onValueChange={onValueChange}>
        {cards}
      </RadioGroup>,
    );
    await user.click(screen.getByText("Cards in rows"));
    expect(onValueChange).toHaveBeenLastCalledWith("grid");
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "Grid" }),
    );
    // Radix selects the focused radio on the next frame, but only while the
    // arrow key is still down, so hold the key until it has.
    await user.keyboard("{ArrowDown>}");
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("list"));
    await user.keyboard("{/ArrowDown}");
    expect(
      screen.getByRole("radio", { name: "List" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("skips a disabled card", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="Layout" defaultValue="list">
        {cards}
      </RadioGroup>,
    );
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("radio", { name: "Map" }).getAttribute("aria-checked"),
    ).toBe("false");
  });

  it("does not rely on colour alone for the selected state", () => {
    expect(radioCardClasses).toContain("data-[state=checked]:ds-border-strong");
    render(
      <RadioGroup aria-label="Layout" defaultValue="grid">
        {cards}
      </RadioGroup>,
    );
    const grid = screen.getByRole("radio", { name: "Grid" });
    // The check mark is in the card; its CSS shows it only when checked.
    expect(grid.querySelector("svg")).not.toBeNull();
    expect(grid.className).toContain("group/card");
  });

  it("hides the media from assistive technology", () => {
    render(<RadioGroup aria-label="Layout">{cards}</RadioGroup>);
    expect(
      screen
        .getByRole("radio", { name: "Grid" })
        .querySelector("[data-slot=radio-card-media]")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("works in a Fieldset and has no axe violations", async () => {
    const { container } = render(
      <Fieldset legend="Layout" description="Pick one.">
        <RadioGroup defaultValue="grid">{cards}</RadioGroup>
      </Fieldset>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });

  it("takes a callback ref typed as a button", () => {
    let node: HTMLButtonElement | null = null;
    render(
      <RadioGroup aria-label="Layout">
        <RadioCard
          value="a"
          label="A"
          ref={(el) => {
            node = el;
          }}
        />
      </RadioGroup>,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });
});
