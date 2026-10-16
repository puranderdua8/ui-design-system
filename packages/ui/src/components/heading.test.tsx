import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Heading, headingDefaultElement, headingVariants } from "./heading";

describe("Heading", () => {
  it.each([
    ["display", "H1"],
    ["h1", "H1"],
    ["h2", "H2"],
    ["h3", "H3"],
  ] as const)("variant %s defaults to %s", (variant, tag) => {
    render(<Heading variant={variant}>t</Heading>);
    expect(screen.getByText("t").tagName).toBe(tag);
  });

  it("defaults to h1 with no props", () => {
    render(<Heading>t</Heading>);
    expect(screen.getByText("t").tagName).toBe("H1");
  });

  it.each(["h1", "h2", "h3", "h4", "h5", "h6"] as const)("as=%s", (as) => {
    render(<Heading as={as}>t</Heading>);
    expect(screen.getByText("t").tagName).toBe(as.toUpperCase());
  });

  it("variant is independent of element", () => {
    render(
      <Heading as="h4" variant="display">
        t
      </Heading>,
    );
    const el = screen.getByText("t");
    expect(el.tagName).toBe("H4");
    expect(el.className).toContain("ds-type-display");
  });

  it("merges className", () => {
    render(<Heading className="mb-4">t</Heading>);
    expect(screen.getByText("t").className).toContain("mb-4");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLHeadingElement>();
    render(<Heading ref={ref}>t</Heading>);
    expect(ref.current?.tagName).toBe("H1");
  });

  it("has no a11y violations", async () => {
    const { container } = render(
      <main>
        <Heading variant="display">Title</Heading>
        <Heading variant="h2">Section</Heading>
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("variant and element maps are static", () => {
    const classes = (["display", "h1", "h2", "h3"] as const).map((v) =>
      headingVariants({ variant: v }),
    );
    for (const c of classes) expect(c).not.toMatch(/\$\{|undefined/);
    expect(classes).toMatchInlineSnapshot(`
      [
        "text-ds-text ds-type-display",
        "text-ds-text ds-type-h1",
        "text-ds-text ds-type-h2",
        "text-ds-text ds-type-h3",
      ]
    `);
    expect(headingDefaultElement).toEqual({
      display: "h1",
      h1: "h1",
      h2: "h2",
      h3: "h3",
    });
  });
});
