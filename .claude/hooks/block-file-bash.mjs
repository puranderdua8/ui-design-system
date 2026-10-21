#!/usr/bin/env node
// PreToolUse hook for Bash (D-043): files are read and edited with the native
// tools (Read, Edit, Write, Grep, Glob), not with shell commands.
//
// Blocked: cat, head, tail (on files), sed, awk, python/python3, tee, `echo`/
// `printf` writing a file, any other redirect into a file, and `node -e` code
// that touches the file system. Allowed: pnpm, git, gh and node scripts, and
// `head`/`tail` as a pipe filter on another command's output.
//
// Input: the hook JSON on stdin. Output: exit 0 to allow, or a deny decision.

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const ALWAYS_BLOCKED = new Set([
  "cat",
  "sed",
  "awk",
  "gawk",
  "python",
  "python3",
  "tee",
]);
const PIPE_FILTERS = new Set(["head", "tail"]);
const ALLOWED = new Set(["pnpm", "git", "gh", "npm", "npx", "pnpx", "corepack"]);
const WRAPPERS = new Set(["env", "time", "command", "xargs", "sudo", "nohup"]);
const NODE_FS =
  /\b(readFile|writeFile|appendFile|readdir|createWriteStream|createReadStream|copyFile|rename|unlink|rm|mkdir)\w*\b|require\(\s*["'](node:)?fs|from\s+["'](node:)?fs|import\(\s*["'](node:)?fs/;

/**
 * Splits a command line into segments at unquoted `&&`, `||`, `;`, `|`, `&`
 * and newlines, and each segment into words. Quoted text (including `$(...)`
 * inside double quotes) stays inside its word, so a commit message that
 * mentions `cat` is not a `cat` command.
 */
export const parse = (command) => {
  const segments = [];
  let words = [];
  let word = "";
  let hasWord = false;
  let quote = null;
  let after = null; // operator that started the current segment
  const endWord = () => {
    if (hasWord) words.push(word);
    word = "";
    hasWord = false;
  };
  const endSegment = (op) => {
    endWord();
    if (words.length > 0) segments.push({ words, after });
    words = [];
    after = op;
  };
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === "\\" && quote === '"' && i + 1 < command.length)
        word += command[++i];
      else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      hasWord = true;
    } else if (ch === "\\" && i + 1 < command.length) {
      word += command[++i];
      hasWord = true;
    } else if (ch === "&" && command[i + 1] === "&") {
      endSegment("&&");
      i++;
    } else if (ch === "|" && command[i + 1] === "|") {
      endSegment("||");
      i++;
    } else if (ch === "|") {
      endSegment("|");
    } else if (ch === "&" && command[i - 1] !== ">" && command[i + 1] !== ">") {
      endSegment("&");
    } else if (ch === ";" || ch === "\n") {
      endSegment(";");
    } else if (ch === " " || ch === "\t") {
      endWord();
    } else {
      word += ch;
      hasWord = true;
    }
  }
  endSegment(null);
  return segments;
};

/** First real command word: skips `VAR=value` and wrappers such as `env`. */
const commandIndex = (words) => {
  let i = 0;
  while (i < words.length) {
    const w = words[i];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w) || WRAPPERS.has(w)) i++;
    else if (w.startsWith("-") && i > 0 && WRAPPERS.has(words[i - 1])) i++;
    else break;
  }
  return i;
};

/** A `>` or `>>` redirect that writes to a file (not /dev/null or a descriptor). */
const writesFile = (words) =>
  words.some((w, i) => {
    const m = /^(\d*)(>>?)(.*)$/.exec(w);
    if (!m) return false;
    const target = m[3] || words[i + 1] || "";
    return !(target === "/dev/null" || target.startsWith("&"));
  });

/** Returns a reason string if the command should be blocked, else null. */
export const check = (command) => {
  for (const { words, after } of parse(command)) {
    const at = commandIndex(words);
    const first = words[at];
    if (!first) continue;
    const name = first.split("/").pop();
    const args = words.slice(at + 1);

    if (ALLOWED.has(name)) continue;

    if (name === "node") {
      const evalIdx = args.findIndex((a) =>
        ["-e", "-p", "--eval", "--print", "-"].includes(a),
      );
      if (evalIdx !== -1 && NODE_FS.test(args.slice(evalIdx + 1).join(" ")))
        return "`node -e` code that reads or writes files";
      continue;
    }
    if (ALWAYS_BLOCKED.has(name)) return `\`${name}\``;
    if (PIPE_FILTERS.has(name)) {
      const operands = args.filter((a) => !a.startsWith("-") && !/^\d+$/.test(a));
      if (after !== "|" || operands.length > 0) return `\`${name}\` on a file`;
      continue;
    }
    if (writesFile(words)) return `\`${name}\` writing a file with \`>\``;
  }
  return null;
};

const main = () => {
  let input;
  try {
    input = JSON.parse(readFileSync(0, "utf8"));
  } catch {
    return; // not hook JSON: do not interfere
  }
  const command = input?.tool_input?.command;
  if (typeof command !== "string") return;
  const found = check(command);
  if (!found) return;
  const reason =
    `D-043: blocked ${found}. Read files with Read, change them with ` +
    "Edit or Write, and search with Grep or Glob. Bash is for project " +
    "commands (pnpm, git, gh, node scripts).";
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
