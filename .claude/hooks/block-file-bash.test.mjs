// Run: node --test .claude/hooks/
import assert from "node:assert/strict";
import { test } from "node:test";
import { check } from "./block-file-bash.mjs";

const blocked = [
  "cat package.json",
  "cat <<'EOF' > file.txt",
  "head -20 README.md",
  "tail -n 5 log.txt",
  "sed -i 's/a/b/' file",
  "sed -n 1,5p file",
  "awk '{print $1}' file",
  "python3 -c 'print(1)'",
  "python3 - <<EOF",
  "echo hi > file.txt",
  "echo hi >> file.txt",
  "printf 'x' >out.txt",
  "echo x | tee file.txt",
  "cd packages/ui && cat src/index.ts",
  "pnpm check && cat package.json",
  "FOO=1 cat file",
  "xargs cat < list.txt",
  "node -e 'require(\"fs\").writeFileSync(\"a\",\"b\")'",
  "ls | head -3 file",
];

const allowed = [
  "pnpm check",
  "pnpm check 2>&1 | tail -20",
  "pnpm --filter site test:e2e 2>&1 | head -40",
  "git status --short",
  "git commit -m \"H1: cat and sed mentioned in the message\"",
  "git log --oneline | head -5",
  "gh pr create --title 'x' --body 'uses cat | sed'",
  "node scripts/build-tokens.mjs",
  "node -e 'console.log(1+1)'",
  "cd apps/site && pnpm exec tsc --noEmit 2>&1 | grep -c error",
  "pnpm lint > /dev/null 2>&1",
  "ls packages/ui/src",
  "grep -rn Comp packages/ui/src",
  "rm -rf apps/site/.next",
  "echo done",
];

test("blocks commands that read or edit files", () => {
  for (const command of blocked)
    assert.notEqual(check(command), null, `should block: ${command}`);
});

test("allows project commands and pipe filters", () => {
  for (const command of allowed)
    assert.equal(check(command), null, `should allow: ${command}`);
});
