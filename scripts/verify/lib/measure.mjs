// The measurement primitives. A section is verified by numbers or it is not verified.

/** @typedef {{ x: number, y: number, w: number, h: number, fontFamily: string, fontSize: number, fontWeight: number, lineHeight: number | string, letterSpacing: number, textTransform: string, textAlign: string, fontVariantNumeric: string, color: string, backgroundColor: string, borderTopWidth: number, borderTopColor: string, borderRadius: string, paddingTop: number, paddingLeft: number, gap: string, opacity: number, src: string | null }} Box */
/** @typedef {Record<string, Box | null>} Boxes */
/** @typedef {{ metric: string, target: unknown, measured: unknown, tolerance?: number }} Row */
/** @typedef {{ width: number, state: string }} Context */
/** @typedef {{ name: string, hover?: string, click?: string, settle?: number, selectors?: string[] }} State */
/** @typedef {{ name: string, url?: string, selectors: string[], expect: (m: Boxes, ctx: Context) => Row[] | undefined, viewports?: number[], expectStatus?: number, states?: State[] }} Spec */

// Default widths for a spec that has no `viewports` of its own: a phone, a tablet, a laptop and a desktop. Change them to the project's real breakpoints and design frames.
//
// A spec branches on `ctx.width`. Adding a width here lands it in some spec's `else` branch, which may assert desktop targets at a width they do not hold, so audit every width ternary in `specs/` when this list changes.
export const VIEWPORTS = [375, 768, 1024, 1440];

// Geometry and computed type for a set of selectors, keyed by selector; `null` for a selector that matched nothing. Width AND height always, never only the property the spec called out: a box can match on colour, height, padding and font while being stretched to the wrong width by a flex parent.
/**
 * @param {import("./browser.mjs").Page} page the page to measure
 * @param {string[]} selectors the elements to read
 * @returns {Promise<Boxes>} one box per selector
 */
export async function boxes(page, selectors) {
  return await page.evaluate((sels) => {
    const round = (n) => Math.round(n * 100) / 100;
    const entries = sels.map((sel) => {
      const el = document.querySelector(sel);
      if (el === null) return /** @type {const} */ ([sel, null]);
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const lineHeight = Number.parseFloat(cs.lineHeight);
      const letterSpacing = Number.parseFloat(cs.letterSpacing);
      return /** @type {const} */ ([
        sel,
        {
          x: round(r.x),
          y: round(r.y + window.scrollY),
          w: round(r.width),
          h: round(r.height),
          fontFamily: cs.fontFamily,
          fontSize: Number.parseFloat(cs.fontSize),
          fontWeight: Number(cs.fontWeight),
          // `normal` stays a string; Figma's "line-height: normal" is a font metric, not a number.
          lineHeight:
            Number.isNaN(lineHeight) || lineHeight === 0
              ? cs.lineHeight
              : lineHeight,
          letterSpacing: Number.isNaN(letterSpacing) ? 0 : letterSpacing,
          textTransform: cs.textTransform,
          textAlign: cs.textAlign,
          fontVariantNumeric: cs.fontVariantNumeric,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          // A single side rather than the `borderColor` / `borderWidth` shorthands, which serialise to an empty string when the four sides differ.
          borderTopWidth: Number.parseFloat(cs.borderTopWidth),
          borderTopColor: cs.borderTopColor,
          borderRadius: cs.borderRadius,
          paddingTop: Number.parseFloat(cs.paddingTop),
          paddingLeft: Number.parseFloat(cs.paddingLeft),
          gap: cs.gap,
          opacity: Number(cs.opacity),
          // A breakpoint-swapped image changes no geometry, so the URL the browser actually picked from `srcset` is the only thing that shows which asset is live. `null` for a non-`<img>`.
          src: el instanceof HTMLImageElement ? el.currentSrc : null,
        },
      ]);
    });
    return Object.fromEntries(entries);
  }, selectors);
}

// `overflow-x: hidden` on html or body hides horizontal overflow rather than preventing it, so compare the two widths instead of trusting the eye.
/**
 * @param {import("./browser.mjs").Page} page the page to measure
 */
export async function overflow(page) {
  return await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    overflows:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  }));
}

// metric / target / measured / delta / pass, one row per value. Numbers pass within `tolerance` (default 1px); anything else passes only on string equality.
/**
 * @param {Row[]} rows the values to compare
 * @returns {{ text: string, pass: boolean }} the table and whether every row passed
 */
export function report(rows) {
  const fmt = (v) =>
    typeof v === "number"
      ? String(Math.round(v * 100) / 100)
      : String(v ?? "—");
  const lines = [
    "metric                          target      measured    delta   pass",
    "------------------------------- ----------- ----------- ------- ----",
  ];
  let allPass = true;
  for (const r of rows) {
    const { target, measured } = r;
    let pass = String(target) === String(measured);
    let delta = "—";
    if (typeof target === "number" && typeof measured === "number") {
      pass = Math.abs(measured - target) <= (r.tolerance ?? 1);
      delta = fmt(measured - target);
    }
    if (!pass) allPass = false;
    lines.push(
      r.metric.slice(0, 31).padEnd(32) +
        fmt(target).padEnd(12) +
        fmt(measured).padEnd(12) +
        delta.padEnd(8) +
        (pass ? "yes" : "NO")
    );
  }
  return { text: lines.join("\n"), pass: allPass };
}

// Shared spec helpers, so no spec redefines them.

// `[data-v="name"]`, the selector form specs use.
/** @param {string} name the data-v value */
export const v = (name) => `[data-v="${name}"]`;

// Above 1440 every rem value scales with the viewport (root font size 100vw / 90), so a 1440 target is multiplied by this.
/** @param {number} width the viewport width */
export const scale = (width) => (width > 1440 ? width / 1440 : 1);

// The `desktop` breakpoint (48rem): desktop type, gutter and layout from 768.
/** @param {number} width the viewport width */
export const isDesktop = (width) => width >= 768;

// The page gutter (`px-gutter`): 16 below 768, 40 from it, scaled above 1440.
/** @param {number} width the viewport width */
export const gutterAt = (width) => (isDesktop(width) ? 40 : 16) * scale(width);

/** @param {Box} b a measured box */
export const bottom = (b) => b.y + b.h;
/** @param {Box} b a measured box */
export const right = (b) => b.x + b.w;

// Section title rows (`type-heading`): Geist 32/40 from 768, 24/32 below, tracking -2%, scaled above 1440.
/**
 * @param {Box} title the measured title
 * @param {number} width the viewport width
 * @returns {Row[]} the rows to assert
 */
export function headingRows(title, width) {
  const k = scale(width);
  const size = (isDesktop(width) ? 32 : 24) * k;
  return [
    { metric: "title fontSize", target: size, measured: title.fontSize },
    {
      metric: "title lineHeight",
      target: (isDesktop(width) ? 40 : 32) * k,
      measured: title.lineHeight,
    },
    {
      metric: "title letterSpacing",
      target: -0.02 * size,
      measured: title.letterSpacing,
      tolerance: 0.01,
    },
  ];
}
