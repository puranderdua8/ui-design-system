import { beforeAll, describe, expect, it } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { ThemeScope, usePortalContainer } from "./theme-scope";

// jsdom lacks the pointer and layout APIs Radix Select calls.
beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const vars = { "--ds-color-surface-raised": "rgb(1, 2, 3)" };

const Fruit = ({ container }: { container?: HTMLElement | null }) => (
  <Select>
    <SelectTrigger aria-label="Fruit">
      <SelectValue placeholder="Pick a fruit" />
    </SelectTrigger>
    <SelectContent {...(container !== undefined ? { container } : {})}>
      <SelectItem value="apple">Apple</SelectItem>
    </SelectContent>
  </Select>
);

const open = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Fruit" }));
  return screen.findByRole("listbox");
};

describe("ThemeScope", () => {
  it("applies the theme name and the var map to its element", () => {
    render(
      <ThemeScope theme="nature" vars={vars} data-testid="scope">
        x
      </ThemeScope>,
    );
    const scope = screen.getByTestId("scope");
    expect(scope.getAttribute("data-ds-theme")).toBe("nature");
    expect(scope.style.getPropertyValue("--ds-color-surface-raised")).toBe(
      "rgb(1, 2, 3)",
    );
  });

  it("lets a caller style win over a var and forwards the ref", () => {
    let node: HTMLDivElement | null = null;
    render(
      <ThemeScope
        theme="nature"
        vars={{ "--a": "1", "--b": "2" }}
        style={{ "--b": "3" } as React.CSSProperties}
        ref={(el) => {
          node = el;
        }}
        data-testid="scope"
      />,
    );
    const scope = screen.getByTestId("scope");
    expect(node).toBe(scope);
    expect(scope.style.getPropertyValue("--a")).toBe("1");
    expect(scope.style.getPropertyValue("--b")).toBe("3");
  });

  it("provides itself as the portal container", () => {
    const { result } = renderHook(() => usePortalContainer(), {
      wrapper: ({ children }) => (
        <ThemeScope theme="nature" vars={vars} data-testid="scope">
          {children}
        </ThemeScope>
      ),
    });
    expect(result.current).toBe(screen.getByTestId("scope"));
  });

  it("returns null with no scope", () => {
    const { result } = renderHook(() => usePortalContainer());
    expect(result.current).toBeNull();
  });
});

describe("Select portal container", () => {
  it("portals into the ThemeScope, so the list sits under the scoped vars", async () => {
    render(
      <ThemeScope theme="nature" vars={vars} data-testid="scope">
        <Fruit />
      </ThemeScope>,
    );
    const list = await open();
    const scope = screen.getByTestId("scope");
    expect(scope.contains(list)).toBe(true);
    expect(list.closest("[data-ds-theme]")).toBe(scope);
    expect(
      list
        .closest<HTMLElement>("[data-ds-theme]")
        ?.style.getPropertyValue("--ds-color-surface-raised"),
    ).toBe("rgb(1, 2, 3)");
  });

  it("an explicit container wins over the ThemeScope", async () => {
    const other = document.createElement("div");
    document.body.append(other);
    render(
      <ThemeScope theme="nature" vars={vars} data-testid="scope">
        <Fruit container={other} />
      </ThemeScope>,
    );
    const list = await open();
    expect(other.contains(list)).toBe(true);
    expect(screen.getByTestId("scope").contains(list)).toBe(false);
    other.remove();
  });

  it("falls back to document.body with no scope", async () => {
    const { container } = render(<Fruit />);
    const list = await open();
    expect(document.body.contains(list)).toBe(true);
    expect(container.contains(list)).toBe(false);
  });

  it("uses the dropdown layer recipe, not a raw z-index", async () => {
    render(<Fruit />);
    const list = await open();
    expect(list.className).toContain("ds-layer-dropdown");
    expect(list.className).not.toMatch(/(^|\s)z-\d+/);
  });
});

describe("cn and layers", () => {
  it("a layer recipe replaces an earlier one and a raw z-*", () => {
    expect(cn("z-50 ds-layer-dropdown")).toBe("ds-layer-dropdown");
    expect(cn("ds-layer-dropdown", "ds-layer-modal")).toBe("ds-layer-modal");
  });
});
