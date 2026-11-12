import * as React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from "./card";
import { cardVariants } from "./card.styles";

const themeCss = readFileSync(
  resolve(__dirname, "../styles/theme.css"),
  "utf8",
);

// Compile-time checks (tsc, via `pnpm typecheck`).
const refChecks = () => {
  const div = React.createRef<HTMLDivElement>();
  const article = React.createRef<HTMLElement>();
  const heading = React.createRef<HTMLHeadingElement>();

  <Card ref={div} />;
  <Card as="article" ref={article} />;
  <CardTitle ref={heading} />;

  // @ts-expect-error a callback ref for a div on an article (D-034)
  <Card as="article" ref={(el: HTMLDivElement | null) => void el} />;
  // @ts-expect-error a closed set of elements
  <Card as="button" />;
  // @ts-expect-error a closed set of variants
  <Card variant="filled" />;
  // @ts-expect-error a callback ref for a button on a heading (D-034)
  <CardTitle ref={(el: HTMLButtonElement | null) => void el} />;
};
void refChecks;

const Sample = ({ variant }: { variant?: "outline" | "raised" }) => (
  <Card variant={variant ?? "outline"} aria-label="Plan">
    <CardMedia>
      <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" />
    </CardMedia>
    <CardHeader>
      <CardTitle>Team plan</CardTitle>
      <CardDescription>For small groups.</CardDescription>
    </CardHeader>
    <CardContent>Everything in Free, plus shared projects.</CardContent>
    <CardFooter>
      <a href="#buy">Choose plan</a>
    </CardFooter>
  </Card>
);

describe("Card", () => {
  it("defaults to an outline div with the card radius", () => {
    render(<Sample />);
    const card = screen.getByLabelText("Plan");
    expect(card.tagName).toBe("DIV");
    expect(card.getAttribute("data-slot")).toBe("card");
    expect(card.className).toContain("rounded-ds-card");
    expect(card.className).toContain("border-ds-border");
    expect(card.className).not.toContain("shadow-ds-raised");
    expect(card.className).not.toContain("ds-tone-raised");
  });

  it("raised uses the raised tone recipe, which exists in theme.css, and the elevation", () => {
    render(<Sample variant="raised" />);
    const cls = screen.getByLabelText("Plan").className;
    expect(cls).toContain("ds-tone-raised");
    expect(cls).toContain("shadow-ds-raised");
    expect(themeCss).toContain(".ds-tone-raised {");
    expect(themeCss).toContain("--shadow-ds-raised");
    expect(themeCss).toContain("--radius-ds-card");
  });

  it("every variant class is static, never built from the prop", () => {
    expect(cardVariants({ variant: "outline" })).toContain("ds-border");
    expect(cardVariants({ variant: "raised" })).toContain("ds-tone-raised");
    expect(cardVariants()).toBe(cardVariants({ variant: "outline" }));
  });

  it("renders as an article and keeps its ref and className", () => {
    const ref = React.createRef<HTMLElement>();
    render(
      <Card as="article" ref={ref} className="max-w-ds-sm">
        x
      </Card>,
    );
    expect(ref.current?.tagName).toBe("ARTICLE");
    expect(ref.current?.className).toContain("max-w-ds-sm");
  });

  it("a ds-tone from className replaces the raised tone", () => {
    render(
      <Card variant="raised" className="ds-tone-subtle" aria-label="t">
        x
      </Card>,
    );
    const cls = screen.getByLabelText("t").className;
    expect(cls).toContain("ds-tone-subtle");
    expect(cls).not.toContain("ds-tone-raised");
  });

  it("CardTitle is an h3 by default and the level is configurable", () => {
    render(
      <>
        <CardTitle>One</CardTitle>
        <CardTitle as="h2">Two</CardTitle>
      </>,
    );
    expect(screen.getByRole("heading", { name: "One", level: 3 })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Two", level: 2 })).toBeTruthy();
  });

  it("CardDescription is a muted paragraph", () => {
    render(<CardDescription>Hint</CardDescription>);
    const p = screen.getByText("Hint");
    expect(p.tagName).toBe("P");
    expect(p.className).toContain("text-ds-text-muted");
  });

  it("CardMedia bleeds to the card edge and clips to its radius", () => {
    render(<Sample />);
    const media = document.querySelector("[data-slot=card-media]");
    expect(media?.className).toContain("overflow-hidden");
    expect(media?.className).toContain("first:rounded-t-ds-card");
  });

  it.each(["outline", "raised"] as const)(
    "%s card has no axe violations",
    async (variant) => {
      const { container } = render(
        <main>
          <Sample variant={variant} />
        </main>,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
