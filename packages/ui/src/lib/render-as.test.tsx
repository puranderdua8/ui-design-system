import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Stack } from "@/components/stack";
import { Text } from "@/components/text";
import { renderAs } from "./render-as";

// Compile-time checks (tsc, via `pnpm typecheck`): `@ts-expect-error` fails
// the build if `renderAs` ever stops constraining its inputs, or if the public
// props types stop being enforced now that components no longer assert.
const checks = () => {
  // Correct calls compile.
  renderAs("section", { className: "x", id: "a", children: "hi" });
  renderAs("button", { type: "button", "data-slot": "x" });

  // @ts-expect-error a tag that is not an HTML or SVG element
  renderAs("not-a-tag", {});
  // @ts-expect-error props must be an object
  renderAs("div", "text");
  // @ts-expect-error className is a string
  renderAs("div", { className: 1 });

  // Components still reject wrong props at the call site.
  // @ts-expect-error htmlFor exists only on as="label"
  <Text as="span" htmlFor="x" />;
  // @ts-expect-error a div ref on a list
  <Stack as="ul" ref={React.createRef<HTMLDivElement>()} />;
};
void checks;

describe("renderAs", () => {
  it("renders the chosen tag with className, children and extra props", () => {
    const { container } = render(
      renderAs("section", {
        className: "a b",
        "data-slot": "demo",
        "aria-label": "Demo",
        children: "Hello",
      }),
    );
    const el = container.firstElementChild;
    expect(el?.tagName).toBe("SECTION");
    expect(el?.className).toBe("a b");
    expect(el?.getAttribute("data-slot")).toBe("demo");
    expect(el?.getAttribute("aria-label")).toBe("Demo");
    expect(el?.textContent).toBe("Hello");
  });

  it("forwards ref as a plain prop (React 19)", () => {
    const ref = React.createRef<HTMLUListElement>();
    render(renderAs("ul", { ref }));
    expect(ref.current?.tagName).toBe("UL");
  });
});
