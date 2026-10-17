import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("defaults to type=button, primary, md", () => {
    render(<Button>Go</Button>);
    const el = screen.getByRole("button", { name: "Go" });
    expect(el.getAttribute("type")).toBe("button");
    expect(el.getAttribute("data-variant")).toBe("primary");
    expect(el.getAttribute("data-size")).toBe("md");
  });

  it("allows type=submit", () => {
    render(<Button type="submit">Go</Button>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("submit");
  });

  it("activates with Enter and Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("blocks onClick and is announced as disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    const el = screen.getByRole("button", { name: "Go" });
    expect((el as HTMLButtonElement).disabled).toBe(true);
    await user.click(el);
    expect(onClick).not.toHaveBeenCalled();
    expect(el.className).toContain("disabled:bg-ds-disabled");
  });

  it("has the focus-visible ring recipe", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button").className).toContain("ds-focus-ring");
  });

  it("applies hover and active state classes per variant", () => {
    expect(buttonVariants({ variant: "primary" })).toContain(
      "hover:bg-ds-primary-hover",
    );
    expect(buttonVariants({ variant: "secondary" })).toContain(
      "active:bg-ds-secondary-active",
    );
  });

  it("applies size classes", () => {
    const { rerender } = render(<Button size="sm">Go</Button>);
    expect(screen.getByRole("button").className).toContain("h-ds-control-sm");
    rerender(<Button size="md">Go</Button>);
    expect(screen.getByRole("button").className).toContain("h-ds-control-md");
  });

  it("uses no arbitrary values or primitive colours", () => {
    const all = [
      buttonVariants({ variant: "primary", size: "sm" }),
      buttonVariants({ variant: "secondary", size: "md" }),
    ].join(" ");
    expect(all).not.toMatch(/\[#|-\[\d|\$\{/);
    expect(all).not.toMatch(/(brand|neutral)-\d/);
  });

  it("merges className last", () => {
    render(<Button className="w-full">Go</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });

  it("asChild renders the child, keeps styles, no default type", () => {
    render(
      <Button asChild>
        <a href="/x">Link</a>
      </Button>,
    );
    const el = screen.getByRole("link", { name: "Link" });
    expect(el.getAttribute("data-slot")).toBe("button");
    expect(el.hasAttribute("type")).toBe(false);
    expect(el.className).toContain("bg-ds-primary");
  });

  it("forwards a callback ref typed to the button", () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el: HTMLButtonElement | null) => {
          node = el;
        }}
      >
        Go
      </Button>,
    );
    expect(node).toBe(screen.getByRole("button"));
  });

  it.each(["primary", "secondary"] as const)(
    "axe clean: %s",
    async (variant) => {
      const { container } = render(
        <>
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant} size="md">
            Medium
          </Button>
          <Button variant={variant} disabled>
            Off
          </Button>
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
