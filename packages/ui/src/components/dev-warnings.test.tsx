import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { render } from "@testing-library/react";
import { resetWarnings } from "@/lib/deprecate";
import { Grid, type GridProps } from "./grid";
import { Split } from "./split";

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  resetWarnings();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
  vi.unstubAllEnvs();
});

describe("R43: development warnings for misuses TypeScript cannot catch", () => {
  it("Split warns once when it does not get exactly two children", () => {
    const { rerender } = render(
      <Split>
        <p>a</p>
        <p>b</p>
      </Split>,
    );
    expect(warn).not.toHaveBeenCalled();

    rerender(
      <Split>
        <p>a</p>
        <p>b</p>
        <p>c</p>
      </Split>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("exactly two children");
    expect(String(warn.mock.calls[0]?.[0])).toContain("got 3");

    rerender(<Split>{null}</Split>);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("Split counts a fragment as one child and ignores empty nodes", () => {
    render(
      <Split>
        {false}
        <>
          <p>a</p>
          <p>b</p>
        </>
      </Split>,
    );
    expect(String(warn.mock.calls[0]?.[0])).toContain("got 1");
  });

  it("Grid warns once when both `cols` and `minItemWidth` arrive (from JavaScript)", () => {
    // A type error in TypeScript (R07); a JS caller can still do it.
    const both = { cols: 3, minItemWidth: "sm" } as unknown as GridProps;
    const { container } = render(<Grid {...both}>x</Grid>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      "`cols` and `minItemWidth`",
    );
    // `minItemWidth` wins, as documented.
    expect(container.firstElementChild?.getAttribute("data-slot")).toBe("grid");

    render(<Grid {...both}>y</Grid>);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("Grid with only one of the two is silent", () => {
    render(<Grid cols={2}>x</Grid>);
    render(<Grid minItemWidth="md">x</Grid>);
    expect(warn).not.toHaveBeenCalled();
  });

  it("production builds stay silent", () => {
    vi.stubEnv("NODE_ENV", "production");
    render(
      <Split>
        <p>a</p>
      </Split>,
    );
    expect(warn).not.toHaveBeenCalled();
  });
});
