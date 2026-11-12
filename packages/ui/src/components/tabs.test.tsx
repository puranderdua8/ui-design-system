import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import {
  tabsContentClasses,
  tabsListClasses,
  tabsTriggerClasses,
} from "./tabs.styles";

const Sample = (props: Partial<React.ComponentProps<typeof Tabs>>) => (
  <Tabs defaultValue="a" {...props}>
    <TabsList aria-label="Plans">
      <TabsTrigger value="a">Free</TabsTrigger>
      <TabsTrigger value="b" disabled>
        Team
      </TabsTrigger>
      <TabsTrigger value="c">Enterprise</TabsTrigger>
      <TabsTrigger value="d">Custom</TabsTrigger>
    </TabsList>
    <TabsContent value="a">Free panel</TabsContent>
    <TabsContent value="b">Team panel</TabsContent>
    <TabsContent value="c">Enterprise panel</TabsContent>
    <TabsContent value="d">Custom panel</TabsContent>
  </Tabs>
);

const tab = (name: string) => screen.getByRole("tab", { name });

describe("Tabs", () => {
  it("renders a tablist, tabs and the active panel with the ARIA wiring", () => {
    render(<Sample />);
    expect(screen.getByRole("tablist", { name: "Plans" })).toBeTruthy();
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    const free = tab("Free");
    expect(free.getAttribute("aria-selected")).toBe("true");
    const panel = screen.getByRole("tabpanel", { name: "Free" });
    expect(panel.textContent).toBe("Free panel");
    expect(free.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(free.id);
    expect(screen.queryByText("Enterprise panel")).toBeNull();
  });

  it("only the active tab is in the tab order (roving focus)", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>before</button>
        <Sample />
        <button>after</button>
      </>,
    );
    // The other tabs are not tab stops; Tab from the page lands on the active one.
    expect(tab("Enterprise").tabIndex).toBe(-1);
    expect(tab("Custom").tabIndex).toBe(-1);
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(tab("Free"));
    // The next Tab leaves the list for the panel (focusable, no content inside).
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("tabpanel", { name: "Free" }),
    );
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "after" }),
    );
  });

  it("arrow keys move focus, skip a disabled tab and wrap (automatic activation)", async () => {
    const user = userEvent.setup();
    render(<Sample />);
    await user.tab();
    expect(document.activeElement).toBe(tab("Free"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tab("Enterprise"));
    expect(tab("Enterprise").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Enterprise panel")).toBeTruthy();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tab("Custom"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tab("Free"));
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(tab("Custom"));
  });

  it("Home and End go to the first and last enabled tab", async () => {
    const user = userEvent.setup();
    render(<Sample defaultValue="c" />);
    await user.tab();
    expect(document.activeElement).toBe(tab("Enterprise"));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(tab("Custom"));
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(tab("Free"));
  });

  it('activationMode="manual" moves focus on arrows and selects on Enter or Space', async () => {
    const user = userEvent.setup();
    render(<Sample activationMode="manual" />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tab("Enterprise"));
    expect(tab("Enterprise").getAttribute("aria-selected")).toBe("false");
    expect(tab("Free").getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{Enter}");
    expect(tab("Enterprise").getAttribute("aria-selected")).toBe("true");
    await user.keyboard("{ArrowRight}");
    await user.keyboard(" ");
    expect(tab("Custom").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByText("Custom panel")).toBeTruthy();
  });

  it("a click selects a tab; a disabled tab cannot be selected", async () => {
    const user = userEvent.setup();
    render(<Sample />);
    await user.click(tab("Custom"));
    expect(screen.getByText("Custom panel")).toBeTruthy();
    await user.click(tab("Team"));
    expect(tab("Team").getAttribute("aria-selected")).toBe("false");
    expect(tab("Team").hasAttribute("disabled")).toBe(true);
  });

  it("is controllable", async () => {
    const user = userEvent.setup();
    const seen: string[] = [];
    const Controlled = () => {
      const [value, setValue] = React.useState("a");
      return (
        <Sample
          defaultValue={undefined}
          value={value}
          onValueChange={(v) => {
            seen.push(v);
            setValue(v);
          }}
        />
      );
    };
    render(<Controlled />);
    await user.click(tab("Enterprise"));
    // Radix selects on mouse down and again on focus, both with the same value.
    expect([...new Set(seen)]).toEqual(["c"]);
    expect(screen.getByText("Enterprise panel")).toBeTruthy();
  });

  it("vertical orientation uses Up and Down and sets aria-orientation", async () => {
    const user = userEvent.setup();
    render(<Sample orientation="vertical" />);
    expect(screen.getByRole("tablist").getAttribute("aria-orientation")).toBe(
      "vertical",
    );
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(tab("Enterprise"));
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(tab("Free"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(tab("Free"));
  });

  it("forwards refs and merges className", () => {
    const root = React.createRef<HTMLDivElement>();
    const list = React.createRef<HTMLDivElement>();
    let trigger: HTMLButtonElement | null = null;
    render(
      <Tabs defaultValue="a" ref={root} className="max-w-ds-md">
        <TabsList ref={list} className="gap-ds-gap-md">
          <TabsTrigger
            value="a"
            ref={(el) => {
              trigger = el;
            }}
          >
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">a</TabsContent>
      </Tabs>,
    );
    expect(root.current?.className).toContain("max-w-ds-md");
    expect(list.current?.className).toContain("gap-ds-gap-md");
    expect(list.current?.className).not.toContain("gap-ds-gap-xs");
    expect((trigger as HTMLButtonElement | null)?.tagName).toBe("BUTTON");
  });

  it("uses token-only classes, with triggers of at least the target size", () => {
    const all = [tabsListClasses, tabsTriggerClasses, tabsContentClasses].join(
      " ",
    );
    expect(tabsTriggerClasses).toContain("min-h-ds-control-sm");
    expect(tabsTriggerClasses).toContain("ds-focus-ring");
    expect(tabsTriggerClasses).toContain("after:bg-ds-border-control");
    expect(tabsContentClasses).toContain("ds-focus-ring");
    // No raw colour, arbitrary value, or primitive reference.
    expect(all).not.toMatch(/\[#|\[\d+px\]|(neutral|brand|red)-\d{2,3}/);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <main>
        <Sample />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
