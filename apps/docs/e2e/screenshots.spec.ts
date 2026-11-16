import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

// One screenshot per story, read from the built Storybook's index, so a story
// added later is covered without touching this file (R37). A story that should
// not be compared sets `tags: ["!snapshot"]`.

type Entry = { id: string; type: string; tags?: string[] };

const indexFile = resolve(
  import.meta.dirname,
  "../storybook-static/index.json",
);
const stories = Object.values(
  (
    JSON.parse(readFileSync(indexFile, "utf8")) as {
      entries: Record<string, Entry>;
    }
  ).entries,
).filter(
  (entry) => entry.type === "story" && !entry.tags?.includes("!snapshot"),
);

test.skip(
  process.platform !== "linux",
  "baselines are made on Linux (CI); fonts differ on other platforms",
);

for (const story of stories)
  test(story.id, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    // Storybook adds `sb-show-main` once the story has rendered (and
    // `sb-show-errordisplay` if it threw).
    await expect(page.locator("body.sb-show-main")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
  });
