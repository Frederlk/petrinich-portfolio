# Pixel-check harness

Measures a rendered section against numbers copied from Figma: DOM `getBoundingClientRect()` and computed styles vs `get_design_context` values, one row per value, at every width in `VIEWPORTS` (`lib/measure.mjs`). A measurement CLI, not a test suite: no runner, nothing in CI, never a committed browser test.

## Run

The user runs the dev server on port 4224. Never start it; if `requireDevServer` refuses, say so and stop.

```bash
bun verify --spec scripts/verify/specs/example.mjs
bun verify --spec scripts/verify/specs/<name>.mjs --url /collection --viewport 375,1440
```

- `--spec` (required): the spec module.
- `--url`: path on the dev server; overrides `spec.url`, default `/`.
- `--viewport`: comma-separated widths; default the spec's own `viewports` array if it has one (a piece that exists only below a breakpoint, like the mobile menu), else all of `VIEWPORTS` (375, 768, 1024, 1440; edit in `lib/measure.mjs`).
- `--base`: default `http://localhost:4224`.
- `--expect-status`: the HTTP status the page must answer with; overrides `spec.expectStatus`, default 200. A different status is a failing row. With 404 the page's own 404 console line is not counted (`--url /no-such-page/ --expect-status 404` for the not-found page).

Exit 0 means every row passed at every width, no horizontal overflow, no console or page error. Exit 1 otherwise; exit 2 on missing `--spec`. Output is a metric / target / measured / delta / pass table per width, then `PASS` or `FAIL`. Nothing is written to disk.

Playwright is resolved at runtime, not installed in the repo (`lib/browser.mjs`: `PW` env var, then `node_modules`, then the pnpm dlx cache). If none has its Chromium installed: `bunx playwright@latest install chromium`.

## Spec shape

```js
export default {
  name: "collection hero",
  url: "/collection",
  selectors: ['[data-v="collection-hero-title"]', '[data-v="collection-hero"]'],
  expect(m, { width, state }) {
    const t = m['[data-v="collection-hero-title"]'];
    const desktop = width >= 768;
    return [
      { metric: "title fontSize", target: desktop ? 40 : 32, measured: t.fontSize },
      { metric: "title letterSpacing", target: desktop ? -0.8 : -0.64, measured: t.letterSpacing, tolerance: 0.01 },
      { metric: "title transform", target: "uppercase", measured: t.textTransform },
    ];
  },
  states: [{ name: "sort open", click: '[data-v="collection-sort"]' }],
};
```

- `m[selector]` holds `x`, `y` (document-absolute), `w`, `h`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textTransform`, `textAlign`, `fontVariantNumeric`, `color`, `backgroundColor`, `borderTopWidth`, `borderTopColor`, `borderRadius`, `paddingTop`, `paddingLeft`, `gap`, `opacity`, `src` (img `currentSrc`). Numbers are px numbers; colours are computed strings (compare as strings).
- A row is `{ metric, target, measured, tolerance? }`. Numeric rows pass within `tolerance` (default 1px, so a 2px drift fails); anything else passes only on string equality.
- `states` (optional): each starts from a fresh page load, then `click` or `hover` one selector, waits `settle` ms (default 450) plus running animations, re-measures and calls `expect` with `state` set to the state's name. Put the state into the metric string, since `state` is not printed. A state may carry its own `selectors` list, measured instead of the spec's: that is how a portaled popup (menu, sheet) that does not exist at rest gets asserted.
- A selector that matches nothing, an unreachable state, or an `expect` returning no rows at a width is a failing row. A width with nothing to assert must still return a row, so branch to a relational check rather than `[]`.

## Writing a spec from Figma

1. Load `figma:figma-design-to-code`, then `get_design_context` on the section node. Take the 1440 frame and the 375 frame.
2. Mark the elements in the markup with `data-v="<section>-<part>"` (kebab-case, unique per page). Selectors in specs use only these, so a spec survives class and structure changes.
3. Copy numbers into a constants object at the top of the spec, with the node ID beside each one. Figma frame x/y are frame-relative; the page has the same origin at the top of the document, so `x` and `y` compare directly when the section sits where the frame puts it.
4. Assert width AND height for every box, plus the type set (size, weight, line height, tracking, transform) and colours.
5. Gate by width. Absolute Figma values hold exactly at 375 and 1440. Between them (767, 768, 1023, 1024) assert the layout branch and relations (edges aligned, nothing overflowing). Above 1440 type and gutters scale with the viewport, so at 1920 assert `figmaValue * width / 1440`.
6. Run at `--viewport 375,1440` while building, then with no `--viewport` before closing a ticket.

## What this cannot see

Shadows, filters, backdrop blur, gradients, SVG internals, image crop (`object-position`) and text rendering. Check those with a `playwright-cli` screenshot against `get_screenshot` at the same width.
