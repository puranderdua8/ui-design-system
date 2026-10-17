import * as React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Heading } from "./heading";
import { Text } from "./text";

// Compile-time checks (tsc, via `pnpm typecheck`): `@ts-expect-error` fails
// the build if a wrong ref is ever accepted. TypeScript cannot tell p/span/div
// apart (identical DOM interfaces) and treats object refs covariantly, so the
// cases below are the mismatches it can express.
const checks = () => {
  const label = React.createRef<HTMLLabelElement>();
  const input = React.createRef<HTMLInputElement>();
  const span = React.createRef<HTMLSpanElement>();
  const heading = React.createRef<HTMLHeadingElement>();
  const onButton = (el: HTMLButtonElement | null) => void el;

  // Correct pairs compile.
  <Text ref={React.createRef<HTMLParagraphElement>()} />;
  <Text as="span" ref={span} />;
  <Text as="div" ref={React.createRef<HTMLDivElement>()} />;
  <Text as="label" ref={label} />;
  <Heading ref={heading} />;

  // @ts-expect-error a span ref on a label
  <Text as="label" ref={span} />;
  // @ts-expect-error an input ref on a label
  <Text as="label" ref={input} />;
  // @ts-expect-error a callback ref for the wrong element (p)
  <Text ref={onButton} />;
  // @ts-expect-error a callback ref for the wrong element (span)
  <Text as="span" ref={onButton} />;
  // @ts-expect-error a callback ref for the wrong element (label)
  <Text as="label" ref={onButton} />;
  // @ts-expect-error a callback ref for the wrong element (heading)
  <Heading ref={onButton} />;
  // @ts-expect-error a label ref on a heading
  <Heading ref={label} />;
  // @ts-expect-error htmlFor only exists on as="label"
  <Text as="span" htmlFor="x" />;
  // @ts-expect-error Heading only allows h1-h6
  <Heading as="p" />;
};

describe("ref typing", () => {
  it("is enforced at compile time (see checks above)", () => {
    expect(checks).toBeTypeOf("function");
  });

  it("delivers the right element at runtime", () => {
    const text = React.createRef<HTMLSpanElement>();
    const head = React.createRef<HTMLHeadingElement>();
    render(
      <>
        <Text as="span" ref={text} />
        <Heading as="h4" ref={head} />
      </>,
    );
    expect(text.current?.tagName).toBe("SPAN");
    expect(head.current?.tagName).toBe("H4");
  });
});
