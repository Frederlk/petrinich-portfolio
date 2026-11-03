// Verify one section against its spec: DOM numbers vs Figma numbers, no image diff. A measurement CLI, not a test suite; nothing here is committed as a browser test.
//
//   bun scripts/verify/section.mjs --spec scripts/verify/specs/<name>.mjs [--url /path] [--viewport 375,1440] [--base http://localhost:4224] [--expect-status 404]
//
// The dev server must already be running. This script never starts one. Exit 0 only when every row passes at every width, with no horizontal overflow and no console error; exit 1 otherwise, exit 2 on bad usage. See README.md for the spec shape.

import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

import { isRecord } from "../lib/is-record.ts";
import { loadChromium, requireDevServer } from "./lib/browser.mjs";
import { boxes, overflow, report, VIEWPORTS } from "./lib/measure.mjs";

const args = process.argv.slice(2);
/** @param {string} flag the option name, with its dashes */
function opt(flag) {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
}

const specPath = opt("--spec");
if (specPath === undefined || specPath === "") {
  console.error(
    "usage: bun scripts/verify/section.mjs --spec <path> [--url /path] [--viewport 375,1440] [--base http://localhost:4224] [--expect-status 404]"
  );
  process.exit(2);
}

const base = opt("--base") ?? "http://localhost:4224";
/** @type {unknown} */
const specModule = await import(pathToFileURL(resolvePath(specPath)).href);
// The spec is user-written JS, so its shape is checked where it is read rather than trusted.
if (
  !isRecord(specModule) ||
  !isRecord(specModule.default) ||
  typeof specModule.default.expect !== "function"
) {
  console.error(
    "the spec must `export default` an object with an `expect` function"
  );
  process.exit(2);
}
// The checks above establish the object and `expect`; the rest is the shape README.md documents.
/** @type {import("./lib/measure.mjs").Spec} */
const spec = specModule.default;
const url = base + (opt("--url") ?? spec.url ?? "/");
// The HTTP status the page must answer with. A 404 page logs its own 404 as a console error; with 404 expected, that one line is not counted.
const expectStatus = Number(opt("--expect-status") ?? spec.expectStatus ?? 200);
const only = opt("--viewport");
const viewports = only?.split(",").map(Number) ?? spec.viewports ?? VIEWPORTS;

await requireDevServer(base);
const chromium = await loadChromium();
const browser = await chromium.launch();

// Rows for one page state. A selector that matched nothing is its own failing row and skips `expect()`, which would otherwise throw on `m[sel].w` and kill the run mid-table.
/**
 * @param {import("./lib/browser.mjs").Page} page the page to measure
 * @param {import("./lib/measure.mjs").Context} ctx the width and state being measured
 * @param {string[]} selectors the elements to read
 * @returns {Promise<import("./lib/measure.mjs").Row[]>} the rows to report
 */
async function measure(page, ctx, selectors = spec.selectors) {
  const m = await boxes(page, selectors);
  const missing = selectors.filter((s) => m[s] === null);
  if (missing.length) {
    return missing.map((s) => ({
      metric: `${ctx.state} ${s}`,
      target: "present",
      measured: "missing",
    }));
  }
  return spec.expect(m, ctx) ?? [];
}

/** @param {import("./lib/browser.mjs").Page} page the page to load */
async function open(page) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  // Fonts change metrics, and a measurement taken before they swap is a measurement of the fallback face.
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  return response?.status();
}

let failed = false;

for (const width of viewports) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  /** @type {string[]} */
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const ownStatus = expectStatus !== 200 && m.location().url === url;
    if (!ownStatus) consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => {
    consoleErrors.push(e.message);
  });

  const status = await open(page);
  const rows = await measure(page, { width, state: "rest" });
  // Only a wrong status adds a row, so a passing table is unchanged.
  if (status !== expectStatus) {
    rows.push({
      metric: "HTTP status",
      target: expectStatus,
      measured: status,
    });
  }
  const ovf = await overflow(page);

  // Interactive states: each one starts from a fresh load so states never compound, performs one `click` or `hover`, waits `settle` ms, then waits for running animations (capped, because a spinner never finishes) so a box is not read mid-transition. A state that cannot be reached is one failing row, not a thrown timeout that takes the remaining widths with it.
  for (const s of spec.states ?? []) {
    try {
      await open(page);
      if (s.hover === undefined) await page.click(s.click, { timeout: 5000 });
      else await page.hover(s.hover, { timeout: 5000 });
      await page.waitForTimeout(s.settle ?? 450);
      await page.evaluate(async () => {
        await Promise.race([
          Promise.allSettled(
            document.getAnimations().map(async (a) => await a.finished)
          ),
          new Promise((resolve) => {
            setTimeout(resolve, 2000);
          }),
        ]);
      });
      rows.push(
        ...(await measure(page, { width, state: s.name }, s.selectors))
      );
    } catch {
      rows.push({
        metric: `${s.name} reachable`,
        target: "yes",
        measured: "no",
      });
    }
  }

  // A spec that returns no rows asserts nothing, and a silent pass is how a width nobody covered ships broken.
  if (rows.length === 0) {
    rows.push({ metric: "rows asserted", target: ">0", measured: 0 });
  }

  const out = report(rows);
  console.log(`\n=== ${spec.name} @ ${width}px ===`);
  console.log(out.text);
  console.log(
    `\nhorizontal overflow: ${ovf.overflows ? `YES, scrollWidth ${ovf.scrollWidth} > clientWidth ${ovf.clientWidth}` : "no"}`
  );
  console.log(`console errors: ${consoleErrors.length}`);
  for (const e of consoleErrors.slice(0, 5)) console.log(`  ${e}`);

  if (!out.pass || ovf.overflows || consoleErrors.length) failed = true;
  await page.close();
}

await browser.close();
console.log(failed ? "\nFAIL" : "\nPASS");
process.exit(failed ? 1 : 0);
