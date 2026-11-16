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
import { resetWarnings } from "@/lib/deprecate";
import { Banner } from "./banner";
import { Card, CardDescription, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Section } from "./section";
import { Select, SelectGroup, SelectValue } from "./select";
import { Sidebar } from "./sidebar";

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  resetWarnings();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

describe("1.0.0: the D-089 names are `contentWidth`, `sidebarSide` and `justify`", () => {
  it("Section `contentWidth` wraps in a Container", () => {
    render(
      <Section contentWidth="md" contentProps={{ id: "inner" }}>
        x
      </Section>,
    );
    const inner = screen.getByText("x");
    expect(inner.dataset.slot).toBe("container");
    expect(inner.id).toBe("inner");
    expect(inner.className).toContain("max-w-ds-md");
    expect(warn).not.toHaveBeenCalled();
  });

  it("Sidebar `sidebarSide=end` puts the aside last", () => {
    render(
      <Sidebar sidebar="aside" sidebarSide="end" data-testid="row">
        content
      </Sidebar>,
    );
    expect(screen.getByTestId("row").dataset.side).toBe("end");
    expect(warn).not.toHaveBeenCalled();
  });

  it("Banner `justify` and `contentWidth`", () => {
    const { container } = render(
      <Banner justify="start" contentWidth="sm" aria-label="b">
        x
      </Banner>,
    );
    const banner = container.querySelector('[data-slot="banner"]');
    expect(banner?.className).toContain("justify-start");
    expect(screen.getByText("x").className).toContain("max-w-ds-sm");
    expect(warn).not.toHaveBeenCalled();
  });

  it("the 0.9.0 names are gone: a type error, and no longer read", () => {
    const { container } = render(
      <>
        {/* @ts-expect-error `container` was removed in 1.0.0; use `contentWidth` */}
        <Section container="sm">a</Section>
        {/* @ts-expect-error `side` was removed in 1.0.0; use `sidebarSide` */}
        <Sidebar sidebar="s" side="end" data-testid="row">
          b
        </Sidebar>
        {/* @ts-expect-error `align` and `container` were removed in 1.0.0 */}
        <Banner align="start" container="md" aria-label="b">
          c
        </Banner>
      </>,
    );
    // Not wrapped in a Container, not moved to the end, not justified.
    expect(screen.getByText("a").dataset.slot).toBe("section");
    expect(screen.getByTestId("row").dataset.side).toBe("start");
    expect(
      container.querySelector('[data-slot="banner"]')?.className,
    ).not.toContain("justify-start");
    expect(warn).not.toHaveBeenCalled();
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
