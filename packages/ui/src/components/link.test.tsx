import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Link, linkVariants } from "./link";

describe("Link", () => {
  it("renders an anchor, inline by default, underlined", () => {
    render(<Link href="/a">Docs</Link>);
    const el = screen.getByRole("link", { name: "Docs" });
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("data-variant")).toBe("inline");
    expect(el.className).toContain("underline");
    expect(el.className).toContain("text-ds-link");
    expect(el.className).toContain("ds-focus-ring");
  });

  it("standalone is not underlined at rest but underlines on hover and focus", () => {
    render(
      <Link href="/a" variant="standalone">
        Docs
      </Link>,
    );
    const el = screen.getByRole("link");
    expect(el.getAttribute("data-variant")).toBe("standalone");
    expect(el.className).toContain("no-underline");
    expect(el.className).toContain("hover:underline");
    expect(el.className).toContain("focus-visible:underline");
  });

  it("does not add target, rel or an icon unless external", () => {
    render(<Link href="/a">Docs</Link>);
    const el = screen.getByRole("link");
    expect(el.getAttribute("target")).toBeNull();
    expect(el.getAttribute("rel")).toBeNull();
    expect(el.querySelector("svg")).toBeNull();
  });

  it("external adds target, rel, a hidden icon and a screen-reader hint", () => {
    render(
      <Link href="https://example.com" external>
        Example
      </Link>,
    );
    const el = screen.getByRole("link", {
      name: "Example (opens in a new tab)",
    });
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.getAttribute("rel")).toBe("noopener noreferrer");
    const icon = el.querySelector("svg");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    expect(el.querySelector(".sr-only")?.textContent).toContain(
      "opens in a new tab",
    );
  });

  it("externalLabel replaces the screen-reader hint (F30) and the icon has no focusable attribute (F37)", () => {
    render(
      <Link
        href="https://example.com"
        external
        externalLabel="(öffnet in neuem Tab)"
      >
        Beispiel
      </Link>,
    );
    const el = screen.getByRole("link", {
      name: "Beispiel (öffnet in neuem Tab)",
    });
    expect(el.textContent).not.toContain("opens in a new tab");
    expect(el.querySelector("svg")?.hasAttribute("focusable")).toBe(false);
  });

  it("external keeps the caller's rel tokens and does not repeat its own", () => {
    render(
      <Link href="https://example.com" external rel="nofollow noopener">
        Example
      </Link>,
    );
    const rel = screen.getByRole("link").getAttribute("rel")!.split(" ");
    expect(rel.sort()).toEqual(["nofollow", "noopener", "noreferrer"]);
  });

  it("a non-external link keeps its own rel", () => {
    render(
      <Link href="/a" rel="nofollow">
        Go
      </Link>,
    );
    expect(screen.getByRole("link").getAttribute("rel")).toBe("nofollow");
  });

  it("uses the motion recipe, not a fixed transition", () => {
    render(<Link href="/a">Go</Link>);
    const cls = screen.getByRole("link").className;
    expect(cls).toContain("ds-transition");
    expect(cls).not.toContain("transition-colors");
  });

  it("asChild merges props onto the child element", () => {
    const Custom = ({
      to,
      children,
      ...props
    }: { to: string } & React.ComponentProps<"a">) => (
      <a data-custom="yes" href={to} {...props}>
        {children}
      </a>
    );
    render(
      <Link asChild>
        <Custom to="/next">Next</Custom>
      </Link>,
    );
    const el = screen.getByRole("link", { name: "Next" });
    expect(el.getAttribute("data-custom")).toBe("yes");
    expect(el.getAttribute("href")).toBe("/next");
    expect(el.getAttribute("data-slot")).toBe("link");
    expect(el.className).toContain("text-ds-link");
  });

  it("asChild with external keeps the child's text and adds the icon inside it", () => {
    render(
      <Link asChild external>
        <a href="https://example.com">Example</a>
      </Link>,
    );
    const el = screen.getByRole("link", {
      name: "Example (opens in a new tab)",
    });
    expect(el.tagName).toBe("A");
    expect(el.getAttribute("target")).toBe("_blank");
    expect(el.querySelector("svg")).not.toBeNull();
  });

  it("is reachable by Tab and activates with Enter", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <Link href="/a" onClick={onClick}>
        Go
      </Link>,
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link"));
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges a caller className", () => {
    render(
      <Link href="/a" className="font-bold">
        Go
      </Link>,
    );
    expect(screen.getByRole("link").className).toContain("font-bold");
  });

  it("variant class maps are static", () => {
    expect(linkVariants({ variant: "inline" })).toContain("underline");
    expect(linkVariants({ variant: "standalone" })).toContain("font-medium");
  });

  it("types a ref from the anchor element", () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Link href="/a" ref={ref}>
        Go
      </Link>,
    );
    expect(ref.current?.tagName).toBe("A");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <p>
        Read the <Link href="/docs">docs</Link>, the{" "}
        <Link href="https://example.com" external>
          spec
        </Link>{" "}
        or{" "}
        <Link href="/more" variant="standalone">
          more
        </Link>
        .
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
