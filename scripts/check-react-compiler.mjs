// Runs babel-plugin-react-compiler over every component and fails if any file
// cannot be compiled (R15). A component the compiler skips or bails out on is
// usually one that breaks the rules of React, or one it cannot analyse; either
// way a consumer that builds with the compiler would not get it optimised.
//
// Usage: node scripts/check-react-compiler.mjs
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath, URL } from "node:url";
import { transformAsync } from "@babel/core";
import reactCompiler from "babel-plugin-react-compiler";

const root = fileURLToPath(new URL("..", import.meta.url));
const componentsDir = join(root, "packages/ui/src/components");

const files = (await readdir(componentsDir))
  .filter(
    (name) =>
      name.endsWith(".tsx") &&
      !name.endsWith(".test.tsx") &&
      !name.endsWith(".stories.tsx"),
  )
  .sort();

const problems = [];
let compiledFiles = 0;
const skippedFiles = [];

for (const name of files) {
  const filename = join(componentsDir, name);
  const code = await readFile(filename, "utf8");
  const events = [];
  try {
    const result = await transformAsync(code, {
      filename,
      babelrc: false,
      configFile: false,
      parserOpts: { plugins: ["typescript", "jsx"] },
      plugins: [
        [
          reactCompiler,
          {
            target: "19",
            // "infer" silently skips components that `return renderAs(...)`
            // (it only sees a call, not JSX): Text, Container, Stack, Cluster
            // and Split. "all" compiles every top-level function, so those are
            // checked too.
            compilationMode: "all",
            panicThreshold: "all_errors",
            logger: { logEvent: (_file, event) => events.push(event) },
          },
        ],
      ],
    });
    if (result?.code?.includes("react/compiler-runtime")) compiledFiles += 1;
    else skippedFiles.push(name);
    // Files with no component or hook (types, plain helpers) compile to nothing,
    // which is fine; a function the compiler saw but skipped is not.
    for (const event of events) {
      if (event.kind === "CompileSkip" || event.kind === "CompileError") {
        problems.push(
          `${relative(root, filename)}:${event.fnLoc?.start?.line ?? "?"} ${event.kind} ${event.reason ?? event.detail?.reason ?? ""}`,
        );
      }
    }
  } catch (error) {
    problems.push(`${relative(root, filename)}: ${error.message}`);
  }
}

if (problems.length > 0) {
  console.error("React Compiler could not compile:");
  for (const line of problems) console.error(`  ${line}`);
  process.exit(1);
}
console.log(
  `React Compiler: ${compiledFiles} of ${files.length} component files compiled, no bail-outs.`,
);
if (skippedFiles.length > 0)
  console.log(`  Nothing to compile in: ${skippedFiles.join(", ")}`);
