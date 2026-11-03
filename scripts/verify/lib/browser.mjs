// Resolves Playwright at runtime, because it is deliberately NOT a dependency of this repo: browser checks are used in the moment and never committed as a suite (CLAUDE.md).
//
// ESM ignores NODE_PATH, so a bare `import "playwright"` cannot find a package installed outside node_modules. Hence a dynamic import of an explicit file URL. Order: PW env var, then the project's own node_modules, then the pnpm dlx cache (a lookup kept for machines that still have one).
//
// The dlx cache is content-hashed and gets pruned, and it can hold several Playwright versions, each pinned to its own Chromium build. A copy whose browser is not installed is skipped rather than returned, or the run dies at launch with an error that reads like a broken harness.

import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { isRecord } from "../../lib/is-record.ts";

// Playwright is not a dependency, so it has no types here: these describe only the calls the harness makes.
/** @typedef {{ type: () => string, text: () => string, location: () => { url: string } }} ConsoleMessage */
/** @typedef {{ status: () => number }} Response */
/** @typedef {{ evaluate: <T, A = never>(fn: (arg: A) => T, arg?: A) => Promise<Awaited<T>>, goto: (url: string, options: { waitUntil: "networkidle" }) => Promise<Response | null>, on: ((event: "console", handler: (message: ConsoleMessage) => void) => unknown) & ((event: "pageerror", handler: (error: Error) => void) => unknown), hover: (selector: string, options: { timeout: number }) => Promise<unknown>, click: (selector: string, options: { timeout: number }) => Promise<unknown>, waitForTimeout: (ms: number) => Promise<unknown>, close: () => Promise<unknown> }} Page */
/** @typedef {{ newPage: (options: { viewport: { width: number, height: number } }) => Promise<Page>, close: () => Promise<unknown> }} Browser */
/** @typedef {{ launch: () => Promise<Browser>, executablePath: () => string }} Chromium */

// pnpm's cache dir per platform; `XDG_CACHE_HOME` and `LOCALAPPDATA` win when set.
function dlxCache() {
  if (process.platform === "win32") {
    return join(
      process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
      "pnpm-cache",
      "dlx"
    );
  }
  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Caches", "pnpm", "dlx");
  }
  return join(
    process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"),
    "pnpm",
    "dlx"
  );
}

function candidates() {
  const out = [];
  const override = process.env.PW;
  if (override !== undefined && override !== "") out.push(override);
  out.push(join(process.cwd(), "node_modules", "playwright"));
  const cache = dlxCache();
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache)) {
      out.push(join(cache, dir, "pkg", "node_modules", "playwright"));
    }
  }
  return out;
}

/**
 * @param {unknown} value the candidate export of the Playwright package
 * @returns {value is Chromium} whether it can launch a browser
 */
function isChromium(value) {
  return (
    isRecord(value) &&
    typeof value.launch === "function" &&
    typeof value.executablePath === "function"
  );
}

/** @returns {Promise<Chromium>} the first Playwright chromium whose browser is installed */
export async function loadChromium() {
  for (const dir of candidates()) {
    const entry = join(dir, "index.js");
    if (!existsSync(entry)) continue;
    // playwright is CJS, so its named exports arrive under .default when imported from ESM.
    /** @type {unknown} */
    const mod = await import(pathToFileURL(entry).href);
    if (!isRecord(mod)) continue;
    const fallback = isRecord(mod.default) ? mod.default.chromium : undefined;
    const chromium = mod.chromium ?? fallback;
    if (isChromium(chromium) && existsSync(chromium.executablePath())) {
      return chromium;
    }
  }
  throw new Error(
    "Playwright with an installed Chromium not found. Install once with `bunx playwright@latest install chromium`, then re-run. Set PW=<path-to-playwright-package> to override resolution."
  );
}

// Every check drives the dev server the user is already running. Starting one is banned (CLAUDE.md), and a wrong-port silent failure is worse than an explicit refusal.
/** @param {string} url the dev server origin to probe */
export async function requireDevServer(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok || res.status === 404) return;
    throw new Error(`responded ${res.status}`);
  } catch (error) {
    throw new Error(
      `No dev server on ${url}. The user starts it with \`bun dev\`; this script never starts one.`,
      { cause: error }
    );
  }
}
