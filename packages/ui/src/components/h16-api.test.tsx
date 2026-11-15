import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { render, screen } from "@testing-library/react";
import { resetRenamedPropWarnings } from "@/lib/deprecate";
import { Banner } from "./banner";
import { Card, CardDescription, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Section } from "./section";
import { Select, SelectGroup, SelectValue } from "./select";
import { Sidebar } from "./sidebar";

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  resetRenamedPropWarnings();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe("H16: D-089 renames keep the old names for one release", () => {
  it("Section `contentWidth` wraps in a Container; `container` still works and warns once", () => {
    const { rerender } = render(
      <Section contentWidth="md" contentProps={{ id: "inner" }}>
        x
      </Section>,
    );
    const inner = screen.getByText("x");
    expect(inner.dataset.slot).toBe("container");
    expect(inner.id).toBe("inner");
    expect(inner.className).toContain("max-w-ds-md");
    expect(warn).not.toHaveBeenCalled();

    rerender(<Section container="sm">x</Section>);
    expect(screen.getByText("x").className).toContain("max-w-ds-sm");
    rerender(<Section container="sm">x</Section>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("contentWidth");
  });

  it("Sidebar `sidebarSide` and the deprecated `side` both put the aside last for `end`", () => {
    const { rerender } = render(
      <Sidebar sidebar="aside" sidebarSide="end" data-testid="row">
        content
      </Sidebar>,
    );
    expect(screen.getByTestId("row").dataset.side).toBe("end");
    expect(warn).not.toHaveBeenCalled();

    rerender(
      <Sidebar sidebar="aside" side="end" data-testid="row">
        content
      </Sidebar>,
    );
    expect(screen.getByTestId("row").dataset.side).toBe("end");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("sidebarSide");
  });

  it("Banner `justify` and `contentWidth`; `align` and `container` still work and warn", () => {
    const { container, rerender } = render(
      <Banner justify="start" contentWidth="sm" aria-label="b">
        x
      </Banner>,
    );
    const banner = container.querySelector('[data-slot="banner"]');
    expect(banner?.className).toContain("justify-start");
    expect(screen.getByText("x").className).toContain("max-w-ds-sm");
    expect(warn).not.toHaveBeenCalled();

    rerender(
      <Banner align="start" container="md" aria-label="b">
        x
      </Banner>,
    );
    expect(
      container.querySelector('[data-slot="banner"]')?.className,
    ).toContain("justify-start");
    expect(screen.getByText("x").className).toContain("max-w-ds-md");
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("the new name wins when both are given", () => {
    render(
      <Section contentWidth="sm" container="xl">
        x
      </Section>,
    );
    expect(screen.getByText("x").className).toContain("max-w-ds-sm");
  });
});

describe("H16: inner elements take props (R11)", () => {
  it("Sidebar contentProps reach the content column", () => {
    render(
      <Sidebar
        sidebar="a"
        contentProps={{ id: "col", className: "p-3", "data-x": "1" } as never}
      >
        x
      </Sidebar>,
    );
    const column = screen.getByText("x");
    expect(column.id).toBe("col");
    expect(column.className).toContain("p-3");
    expect(column.className).toContain("min-w-1/2");
    expect(column.dataset.slot).toBe("sidebar-content");
  });

  it("Banner layerProps reach the content layer and contentProps its Container", () => {
    render(
      <Banner
        aria-label="b"
        layerProps={{ id: "layer" }}
        contentProps={{ id: "inner", className: "text-center" }}
      >
        x
      </Banner>,
    );
    expect(document.getElementById("layer")?.dataset.slot).toBe(
      "banner-content",
    );
    const inner = document.getElementById("inner");
    expect(inner?.dataset.slot).toBe("container");
    expect(inner?.className).toContain("text-center");
  });

  it("Field rowProps reach the inline row", () => {
    render(
      <Field
        label="Agree"
        layout="inline"
        rowProps={{ id: "row", className: "justify-between" }}
      >
        <Checkbox />
      </Field>,
    );
    const row = document.getElementById("row");
    expect(row?.dataset.slot).toBe("field-row");
    expect(row?.className).toContain("justify-between");
    expect(row?.className).toContain("items-center");
  });
});

describe("H16: data-slot values (R11)", () => {
  it("CardTitle and CardDescription have their own slots and keep their styles", () => {
    render(
      <Card>
        <CardTitle>Title</CardTitle>
        <CardDescription>Text</CardDescription>
      </Card>,
    );
    const title = screen.getByRole("heading", { name: "Title" });
    expect(title.dataset.slot).toBe("card-title");
    expect(title.tagName).toBe("H3");
    expect(title.className).toContain("ds-type-h3");
    const description = screen.getByText("Text");
    expect(description.dataset.slot).toBe("card-description");
    expect(description.tagName).toBe("P");
    expect(description.className).toContain("ds-type-caption");
  });

  it("a caller cannot overwrite data-slot on SelectGroup and SelectValue", () => {
    render(
      <Select open>
        <SelectValue data-slot="mine" data-testid="value" />
        <SelectGroup data-slot="mine" data-testid="group" />
      </Select>,
    );
    expect(screen.getByTestId("value").dataset.slot).toBe("select-value");
  });
});
