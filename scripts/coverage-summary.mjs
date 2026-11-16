// Prints the package's unit-test coverage as a Markdown table (H19). CI appends
// it to the run summary. Coverage is reported, never enforced.
// Run `pnpm --filter @puranderdua/ui test:coverage` first.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(
  import.meta.dirname,
  "../packages/ui/coverage/coverage-summary.json",
);
const { total } = JSON.parse(readFileSync(file, "utf8"));

const rows = ["statements", "branches", "functions", "lines"].map(
  (kind) =>
    `| ${kind} | ${total[kind].pct}% | ${total[kind].covered} of ${total[kind].total} |`,
);

console.log(
  [
    "### Package unit-test coverage (reported, not enforced)",
    "",
    "| Kind | Covered | Count |",
    "| --- | --- | --- |",
    ...rows,
  ].join("\n"),
);
