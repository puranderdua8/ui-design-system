import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as axeMatchers from "vitest-axe/matchers";

expect.extend(axeMatchers);
afterEach(cleanup);

// axe probes canvas in jsdom; stub it to silence "Not implemented" noise.
// Colour contrast is covered by `pnpm tokens:check`, not by jsdom.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as unknown as HTMLCanvasElement["getContext"];
