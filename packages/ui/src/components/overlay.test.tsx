import * as React from "react";
import { renderToString } from "react-dom/server";
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
import {
  DirectionProvider,
  ScopedPortal,
  ThemeScope,
  usePortalContainer,
} from "./theme-scope";

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

  it("sets dir and tells Radix components which way to read", () => {
    render(
      <ThemeScope theme="nature" vars={vars} dir="rtl" data-testid="scope">
        x
      </ThemeScope>,
    );
    expect(screen.getByTestId("scope").getAttribute("dir")).toBe("rtl");
  });

  it("writes no dir attribute unless one is given", () => {
    render(
      <ThemeScope theme="nature" vars={vars} data-testid="scope">
        x
      </ThemeScope>,
    );
    expect(screen.getByTestId("scope").hasAttribute("dir")).toBe(false);
  });

  it("renders its children once on mount (R08)", () => {
    let renders = 0;
    const Probe = () => {
      renders += 1;
      return null;
    };
    render(
      <ThemeScope theme="nature" vars={vars}>
        <Probe />
      </ThemeScope>,
    );
    expect(renders).toBe(1);
  });
});

describe("usePortalContainer", () => {
  it("is document.body in the browser, scope or not", () => {
    const bare = renderHook(() => usePortalContainer());
    expect(bare.result.current).toBe(document.body);
    const scoped = renderHook(() => usePortalContainer(), {
      wrapper: ({ children }) => (
        <ThemeScope theme="nature" vars={vars}>
          {children}
        </ThemeScope>
      ),
    });
    expect(scoped.result.current).toBe(document.body);
  });

  it("is null while rendering on the server, never an ambiguous first value", () => {
    const html = renderToString(<Server />);
    expect(html).toBe("<p>no portal</p>");
  });
});

const Server = () => {
  const container = usePortalContainer();
  return <p>{container ? "portal" : "no portal"}</p>;
};

describe("ScopedPortal", () => {
  it("portals to body and re-applies theme, vars, direction and the raised tone", () => {
    render(
      <ThemeScope theme="nature" vars={vars} dir="rtl" data-testid="scope">
        <ScopedPortal>
          <span data-testid="inside">in</span>
        </ScopedPortal>
      </ThemeScope>,
    );
    const inside = screen.getByTestId("inside");
    const portal = inside.closest<HTMLElement>("[data-slot=scoped-portal]");
    expect(screen.getByTestId("scope").contains(inside)).toBe(false);
    expect(portal?.parentElement).toBe(document.body);
    expect(portal?.getAttribute("data-ds-theme")).toBe("nature");
    expect(portal?.getAttribute("dir")).toBe("rtl");
    expect(portal?.style.getPropertyValue("--ds-color-surface-raised")).toBe(
      "rgb(1, 2, 3)",
    );
    expect(portal?.className).toContain("ds-tone-raised");
  });

  it("puts the scope on its single child with asChild, without a wrapper", () => {
    render(
      <ThemeScope theme="nature" vars={vars}>
        <ScopedPortal asChild>
          <p data-testid="surface" className="own">
            in
          </p>
        </ScopedPortal>
      </ThemeScope>,
    );
    const surface = screen.getByTestId("surface");
    expect(surface.parentElement).toBe(document.body);
    expect(surface.getAttribute("data-ds-theme")).toBe("nature");
    expect(surface.className).toContain("own");
    expect(surface.className).toContain("ds-tone-raised");
  });

  it("outside any scope it writes no theme or dir, and a container wins", () => {
    const other = document.createElement("div");
    document.body.append(other);
    render(
      <ScopedPortal container={other}>
        <span data-testid="inside">in</span>
      </ScopedPortal>,
    );
    const portal = screen
      .getByTestId("inside")
      .closest<HTMLElement>("[data-slot=scoped-portal]");
    expect(portal?.parentElement).toBe(other);
    expect(portal?.hasAttribute("data-ds-theme")).toBe(false);
    expect(portal?.hasAttribute("dir")).toBe(false);
    other.remove();
  });

  it("takes the direction from a DirectionProvider", () => {
    render(
      <DirectionProvider dir="rtl">
        <ScopedPortal>
          <span data-testid="inside">in</span>
        </ScopedPortal>
      </DirectionProvider>,
    );
    expect(
      screen
        .getByTestId("inside")
        .closest("[data-slot=scoped-portal]")
        ?.getAttribute("dir"),
    ).toBe("rtl");
  });

  it("keeps a portalled child's state when the scope re-renders (R08)", () => {
    let mounts = 0;
    const Child = () => {
      React.useEffect(() => {
        mounts += 1;
      }, []);
      return null;
    };
    const { rerender } = render(
      <ThemeScope theme="nature" vars={vars}>
        <ScopedPortal>
          <Child />
        </ScopedPortal>
      </ThemeScope>,
    );
    rerender(
      <ThemeScope theme="nature" vars={{ ...vars }}>
        <ScopedPortal>
          <Child />
        </ScopedPortal>
      </ThemeScope>,
    );
    expect(mounts).toBe(1);
  });
});

describe("Select portal", () => {
  it("opens on body with the scope re-applied, not inside the scope", async () => {
    render(
      <ThemeScope theme="nature" vars={vars} dir="rtl" data-testid="scope">
        <Fruit />
      </ThemeScope>,
    );
    const list = await open();
    expect(screen.getByTestId("scope").contains(list)).toBe(false);
    expect(list.getAttribute("data-ds-theme")).toBe("nature");
    expect(list.getAttribute("dir")).toBe("rtl");
    expect(list.style.getPropertyValue("--ds-color-surface-raised")).toBe(
      "rgb(1, 2, 3)",
    );
    expect(list.className).toContain("ds-tone-raised");
  });

  it("highlights an option with the menu role, not surface.subtle", async () => {
    render(<Fruit />);
    await open();
    const cls = screen.getByRole("option", { name: "Apple" }).className;
    expect(cls).toContain("data-[highlighted]:bg-ds-menu-highlight");
    expect(cls).toContain("data-[highlighted]:text-ds-menu-highlight-fg");
    expect(cls).not.toContain("surface-subtle");
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
