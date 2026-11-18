import { gzipSync } from "node:zlib";
import { expect, test, type Page } from "@playwright/test";
import { builderContent } from "../src/content/builder";

// Performance of the tool (S59, spec 5.4): the interaction budget is 200 ms from the
// pointer or the input to the next painted frame. A slider drag and a colour pick are
// measured in the page; the numbers go in the test report (and PROGRESS). The median is
// asserted, not the worst sample: a loaded CI machine has outliers that say nothing about
// the code. `/build`'s JavaScript size is recorded against the H18 playground figure
// (271.8 KB gzip); it is reported, not asserted.

const budgetMs = 200;
const { look } = builderContent;

const ready = async (page: Page) => {
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
};

/**
 * Times every change of the preview scope's inline style from the last pointer move or
 * input to the second animation frame after it (the frame the change is painted in).
 */
const probe = (page: Page) =>
  page.evaluate(() => {
    const scope = document.querySelector('[data-testid="preview"]')!;
    const w = window as unknown as { __lat: number[] };
    w.__lat = [];
    let start = 0;
    const mark = (event: Event) => {
      start = event.timeStamp;
    };
    addEventListener("pointermove", mark, true);
    addEventListener("input", mark, true);
    new MutationObserver(() => {
      const from = start;
      if (!from) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => w.__lat.push(performance.now() - from)),
      );
    }).observe(scope, { attributes: true, attributeFilter: ["style"] });
  });

const samples = (page: Page) =>
  page.evaluate(() => (window as unknown as { __lat: number[] }).__lat);

const median = (values: number[]) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!;

const report = (name: string, values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const line = `${name}: ${values.length} frames, median ${median(values).toFixed(0)} ms, worst ${sorted.at(-1)!.toFixed(0)} ms (budget ${budgetMs} ms)`;
  test.info().annotations.push({ type: "latency", description: line });
  console.log(`[latency] ${test.info().project.name} ${line}`);
};

test("dragging a slider updates the preview within the budget", async ({
  page,
}) => {
  await page.goto("/build/shape");
  await ready(page);
  const slider = page.getByRole("slider", { name: look.cornersFineTune });
  // The mouse only reaches what is on screen.
  await slider.scrollIntoViewIfNeeded();
  const box = (await slider.boundingBox())!;
  const track = (await slider
    .locator("xpath=ancestor::*[@data-slot='slider'][1]")
    .boundingBox())!;
  await probe(page);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const from = track.x + 4;
  const to = track.x + track.width - 4;
  const y = box.y + box.height / 2;
  for (let i = 0; i <= 24; i += 1)
    await page.mouse.move(from + ((to - from) * i) / 24, y);
  await page.mouse.up();
  await expect
    .poll(async () => (await samples(page)).length)
    .toBeGreaterThan(3);
  const values = await samples(page);
  report("slider drag", values);
  expect(median(values)).toBeLessThan(budgetMs);
});

test("picking a colour updates the preview within the budget", async ({
  page,
}) => {
  await page.goto("/build/colour");
  await ready(page);
  const picker = page
    .getByTestId("brand-colour")
    .locator('input[type="color"]');
  await probe(page);
  // The native picker cannot be driven; this is its `input` event, which is what it fires
  // while the person drags inside it.
  const colours = ["#1762b6", "#b45309", "#047857", "#7c3aed", "#be123c"];
  for (const colour of colours) {
    await picker.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, colour);
    await page.waitForTimeout(250);
  }
  await expect
    .poll(async () => (await samples(page)).length)
    .toBeGreaterThan(2);
  const values = await samples(page);
  report("colour pick", values);
  expect(median(values)).toBeLessThan(budgetMs);
});

test("the JavaScript /build loads is recorded", async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "One browser is enough for a size");
  const sizes = new Map<string, number>();
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("/_next/static/") || !url.endsWith(".js")) return;
    try {
      sizes.set(url, gzipSync(await response.body()).length);
    } catch {
      // A response that was cancelled is not part of the first load.
    }
  });
  await page.goto("/build/start", { waitUntil: "networkidle" });
  await ready(page);
  const total = [...sizes.values()].reduce((sum, size) => sum + size, 0);
  const line = `/build/start first load: ${(total / 1024).toFixed(1)} KB gzip in ${sizes.size} files (H18 /playground: 271.8 KB)`;
  test.info().annotations.push({ type: "js-size", description: line });
  console.log(`[js-size] ${line}`);
  expect(total).toBeGreaterThan(0);
});
