import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Container, containerSizeClasses } from "./container";
import { Grid, gridColsClasses, gridFitClasses } from "./grid";
import { Stack, stackAlignClasses } from "./stack";
import { Cluster, clusterAlignClasses, clusterJustifyClasses } from "./cluster";
import { gapClasses } from "@/lib/layout";

const themeCss = readFileSync(
  resolve(__dirname, "../styles/theme.css"),
  "utf8",
);

// Compile-time checks (tsc, via `pnpm typecheck`).
const refChecks = () => {
  const div = React.createRef<HTMLDivElement>();
  const ul = React.createRef<HTMLUListElement>();
  const main = React.createRef<HTMLElement>();
  const onDiv = (el: HTMLDivElement | null) => void el;

  <Container ref={div} />;
  <Container as="main" ref={main} />;
  <Grid as="ul" ref={ul} />;
  <Stack ref={div} />;
  <Cluster as="ul" ref={ul} />;

  // @ts-expect-error a ul ref on the default div
  <Stack ref={ul} />;
  // @ts-expect-error a callback ref for a div on a ul
  <Cluster as="ul" ref={onDiv} />;
  // @ts-expect-error `as` is a closed union
  <Grid as="table" />;
  // @ts-expect-error `cols` is a closed union
  <Grid cols={5} />;
};
void refChecks;

describe("Container", () => {
  it("renders a div by default and the chosen element via as", () => {
    render(
      <>
        <Container>a</Container>
        <Container as="main">b</Container>
      </>,
    );
    expect(screen.getByText("a").tagName).toBe("DIV");
    expect(screen.getByText("b").tagName).toBe("MAIN");
  });

  it("uses the container token for each size, gutter and centring", () => {
    render(
      <>
        <Container size="sm">sm</Container>
        <Container size="full">full</Container>
        <Container>default</Container>
      </>,
    );
    expect(screen.getByText("sm").className).toContain("max-w-ds-sm");
    expect(screen.getByText("full").className).toContain("max-w-none");
    const def = screen.getByText("default").className;
    expect(def).toContain("max-w-ds-lg");
    expect(def).toContain("px-ds-gutter");
    expect(def).toContain("mx-auto");
  });

  it("lets className override and forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Container ref={ref} className="max-w-ds-xl">
        x
      </Container>,
    );
    expect(ref.current?.className).toContain("max-w-ds-xl");
    expect(ref.current?.className).not.toContain("max-w-ds-lg");
  });
});

describe("Grid", () => {
  it("defaults to one column and a medium gap", () => {
    render(<Grid>x</Grid>);
    const cls = screen.getByText("x").className;
    expect(cls).toContain("grid");
    expect(cls).toContain("grid-cols-1");
    expect(cls).toContain("gap-ds-gap-md");
  });

  it.each([2, 3, 4, 6, 12] as const)(
    "cols=%s starts at one column and widens with the container, not the viewport",
    (cols) => {
      render(<Grid cols={cols}>x{cols}</Grid>);
      const cls = screen.getByText(`x${cols}`).className;
      expect(cls).toContain("grid-cols-1");
      expect(cls).toMatch(new RegExp(`@[a-z0-9]+:grid-cols-${cols}\\b`));
      expect(cls).not.toMatch(/(^| )(sm|md|lg|xl):grid-cols/);
    },
  );

  it("wraps a column-count grid in an @container; as, role and data-slot stay on the grid", () => {
    render(
      <Grid as="ul" cols={3} aria-label="list">
        <li>item</li>
      </Grid>,
    );
    const grid = screen.getByRole("list");
    expect(grid.dataset.slot).toBe("grid");
    expect(grid.parentElement?.dataset.slot).toBe("grid-container");
    expect(grid.parentElement?.className).toContain("@container");
    expect(grid.className).not.toContain("@container");
  });

  it("auto-fit mode needs no wrapper", () => {
    render(<Grid minItemWidth="md">x</Grid>);
    expect(screen.getByText("x").parentElement?.dataset.slot).not.toBe(
      "grid-container",
    );
  });

  it("minItemWidth switches to the auto-fit recipe and drops the column map", () => {
    render(
      <Grid cols={3} minItemWidth="md">
        x
      </Grid>,
    );
    const cls = screen.getByText("x").className;
    expect(cls).toContain("ds-grid-fit-md");
    expect(cls).not.toContain("grid-cols");
  });

  it("renders list elements", () => {
    render(
      <Grid as="ul">
        <li>item</li>
      </Grid>,
    );
    expect(screen.getByRole("list").tagName).toBe("UL");
  });
});

describe("Stack", () => {
  it("is a vertical flex column with gap and alignment", () => {
    render(
      <Stack gap="lg" align="center">
        x
      </Stack>,
    );
    const cls = screen.getByText("x").className;
    expect(cls).toContain("flex-col");
    expect(cls).toContain("gap-ds-gap-lg");
    expect(cls).toContain("items-center");
  });

  it("stretches by default and renders as the chosen element", () => {
    render(<Stack as="section">x</Stack>);
    const el = screen.getByText("x");
    expect(el.tagName).toBe("SECTION");
    expect(el.className).toContain("items-stretch");
  });
});

describe("Cluster", () => {
  it("wraps and applies gap, justify and align", () => {
    render(
      <Cluster gap="xs" justify="between" align="baseline">
        x
      </Cluster>,
    );
    const cls = screen.getByText("x").className;
    expect(cls).toContain("flex-wrap");
    expect(cls).toContain("gap-ds-gap-xs");
    expect(cls).toContain("justify-between");
    expect(cls).toContain("items-baseline");
  });

  it("defaults to start / centre", () => {
    render(<Cluster>x</Cluster>);
    const cls = screen.getByText("x").className;
    expect(cls).toContain("justify-start");
    expect(cls).toContain("items-center");
  });
});

describe("list semantics", () => {
  it.each([
    ["Grid", <Grid as="ul" key="g" />],
    ["Stack", <Stack as="ol" key="s" />],
    ["Cluster", <Cluster as="ul" key="c" />],
  ])("%s as a list keeps its role after the list reset", (_name, el) => {
    const { container } = render(el);
    // Grid with a column count has an @container wrapper; the list is inside it.
    expect(container.querySelector("ul, ol")?.getAttribute("role")).toBe(
      "list",
    );
  });

  it("adds no role to other elements and lets the caller override it", () => {
    const { container } = render(
      <>
        <Stack />
        <Stack as="nav" />
        <Stack as="ul" role="presentation" />
      </>,
    );
    const roles = Array.from(container.children).map((el) =>
      el.getAttribute("role"),
    );
    expect(roles).toEqual([null, null, "presentation"]);
  });
});

describe("static class maps", () => {
  const maps = [
    ...Object.values(gapClasses),
    ...Object.values(containerSizeClasses),
    ...Object.values(gridColsClasses),
    ...Object.values(gridFitClasses),
    ...Object.values(stackAlignClasses),
    ...Object.values(clusterJustifyClasses),
    ...Object.values(clusterAlignClasses),
  ];

  it("contain only literal class names (no template placeholders)", () => {
    for (const value of maps) expect(value).not.toMatch(/[${}[\]]/);
  });

  it("only use ds tokens for gap, container and grid-fit classes", () => {
    for (const v of Object.values(gapClasses))
      expect(v).toMatch(/^gap-ds-gap-(xs|sm|md|lg|xl)$/);
    for (const v of Object.values(gridFitClasses))
      expect(themeCss).toContain(`.${v} {`);
  });

  it("gap, container and sidebar tokens exist in the bridge", () => {
    for (const size of ["xs", "sm", "md", "lg", "xl"])
      expect(themeCss).toContain(`--spacing-ds-gap-${size}:`);
    for (const size of ["sm", "md", "lg", "xl"])
      expect(themeCss).toContain(`--container-ds-${size}:`);
    expect(themeCss).toContain("--spacing-ds-gutter:");
  });
});

describe("a11y", () => {
  it("has no violations when composed", async () => {
    const { container } = render(
      <main>
        <Container as="section" aria-label="demo">
          <Stack>
            <Grid as="ul" cols={2}>
              <li>one</li>
              <li>two</li>
            </Grid>
            <Cluster as="ul">
              <li>a</li>
              <li>b</li>
            </Cluster>
          </Stack>
        </Container>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
