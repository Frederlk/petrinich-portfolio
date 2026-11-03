---
version: alpha
name: Sergey Petrinich portfolio
description: Dark, exact, editorial-technical portfolio in the Swiss tradition, copied from the six Google Stitch screens of Direction A "Index" (docs/design/stitch/A). The references are the source of truth for sizes, spacing, type, colour and structure; styles/globals.css carries their tailwind config. Only the invented data of the references is replaced with real data from content/.

sources:
  references: docs/design/stitch/A/{home,work,project,stack,about,cv}.html
  tokens: styles/globals.css
  fonts: styles/fonts.ts
  stitch: https://stitch.withgoogle.com/projects/13836131359857067886

colors:
  surface: "#131313"
  surface-container-lowest: "#0e0e0e"
  surface-container-low: "#1c1b1b"
  surface-container: "#201f1f"
  surface-container-high: "#2a2a2a"
  surface-container-highest: "#353534"
  on-surface: "#e5e2e1"
  on-surface-variant: "#e5beb4"
  secondary: "#c6c6c7"
  tertiary: "#c7c6c6"
  tertiary-container: "#919191"
  primary-container: "#ff5626"
  on-primary-container: "#541000"
  primary: "#ffb5a1"
  on-primary: "#601400"

typography:
  headline-and-body: "Archivo Narrow (variable, wght 400 to 700; the design's weight 800 renders at 700)"
  code: "JetBrains Mono 400, 500, 700"

rounded:
  base: "0px; the header avatar chip is the one circle"

motion:
  colour: "hover and state colour changes on links and controls fade over 150 to 200ms"
  interaction: "hover and focus effects in globals.css: link underline draws in (link-draw), button fill sweeps from the left (fill-sweep), ledger row shows a vermilion edge and slides 8px right (row-accent, row-shift), arrows nudge 4px (arrow-slide), pressed controls scale to 0.97 (press); 260 to 360ms on --ease-enter"
  indicator: "the active fill of tabs and the table of contents slides to the new item; tabs use 300ms --ease-move, the table of contents a Motion spring of about the same length"
  ease-enter: "cubic-bezier(0.23, 1, 0.32, 1), for things appearing"
  ease-move: "cubic-bezier(0.77, 0, 0.175, 1), for things moving between positions"
  duration-cap: "UI motion stays within 360ms; the stat count-up is the one long animation"
  reduced-motion: "every animation and transition collapses to 0.01ms"
---

## Overview

A well-kept index: exact, calm, technical. Everything sits on 1px hairlines in a 1440px frame; labels are small uppercase mono; display type is huge, narrow and uppercase. The catalog itself is the decoration, so numbers, tables and ledgers carry the pages.

Dark theme only. No light mode and no theme switch; `/cv` and the PDF print on white paper through a print stylesheet (`styles/cv-print.css`), never through a toggle.

This file supersedes the old "Never" list of `docs/design/stitch-brief.md`: uppercase labels, bracket tags (`[SOLE]`), numbered section markers (`01 //`), `//` comment labels and the `[->]` arrows are all part of the design now.

## 1 · Tokens

The Stitch tailwind config is ported one to one into `@theme` in `styles/globals.css`, so the class names of the references work unchanged.

- Colours: the full Stitch palette (`surface`, `surface-container-*`, `on-surface`, `secondary`, `tertiary`, `primary-container`, `outline`, and the rest). The template roles are bound to it: `background` = `surface`, `foreground` = `on-surface`, `primary` = Stitch `primary` (`#ffb5a1`, hover colour of the logo and links), `ring` = `primary-container`, `border` = `surface-container-high`. All of them are CSS variables in `:root`, so the print sheet repaints them.
- The vermilion `primary-container` (`#ff5626`) is the accent: key numbers, `//` markers, the active filter, the primary button fill. Text on it is `on-primary-container` (`#541000`, 4.56:1).
- Spacing keys: `space-xs` 4, `space-sm` 8, `space-md` 16, `space-lg` 24, `space-xl` 40, `space-2xl` 64, `space-3xl` 96, `gutter` 24, `margin-mobile` 20, `margin` 48 (px). The `container` utility is the frame: 1440px wide, 20px side margins, 48px from `md` up.
- Type: twelve semantic roles, each one `type-*` utility in `styles/typography.css` (section 8). The Stitch names (`text-headline-sm`, `font-code-md`, …) are gone; a component names a role and never a size.
- Fonts: Archivo Narrow for text and display, JetBrains Mono for labels and data, both through `next/font/google` in `styles/fonts.ts` and bound to `--font-sans` and `--font-mono`.
- No shadows, no gradients, no glow. Corners are square.

## 2 · Shell

- Header: fixed, 64px, `surface` with a bottom hairline. Name (uppercase, `headline-sm`) and the tag `[Lead Full-Stack Dev]` (from `lg`) on the left; on the right Work, Stack, Experience, CV in uppercase mono (the current section has a vermilion underline), the "Hire me" button and a 32px round chip. The references drop the menu below `md`; there the chip is the menu button, so navigation stays reachable. "Experience" is the home page section `/#experience`.
- Footer: `surface-container-lowest`, three columns (name and place; "Navigation Index"; "Telemetry & Contact" with email, GitHub, LinkedIn, Telegram and "CV: Download PDF"), status line with the vermilion square.
- "Book a call" is omitted until `content/profile.json` carries a booking link.

## 3 · Pages

Each page maps to its reference and keeps its structure.

- `/` (home, the About page merged in): hero with name, role, positioning, Contact and View work buttons and a portrait; a four-cell numbers strip; About (summary, education, languages, interests); selected-work ledger; experience timeline with a sticky company column; stack teaser (core and AI tools); engagement block with channels.
- `/work` (work): index bar, `WORK` display title with the real count and years, a sticky filter deck (type tabs with counts, AI toggle, search, technology, year and role drop-downs, shown / total counter) and the full ledger grouped by year. Filters live in the URL (nuqs); all 64 rows are in the first server HTML. The three drop-downs are native selects laid transparent over their Stitch cells.
- `/work/[slug]` (project): back bar with the status, monumental name with the vermilion dot, first sentence of the summary as headline, four-cell band (year, role, stack, live system), the real screenshot in the viewport frame (omitted when the project has none), role / scope / domain cells, features table, full stack by group as chips, previous / next.
- `/stack` (stack): taxonomy header with real stats, a sticky tab bar (all groups, `?group=`), one ledger per technology group listing the projects that used each technology; only technologies a project used are shown.
- `/cv` (cv): the Stitch résumé layout on screen; print gives the white A4 sheet of two pages (see below).

## 4 · Data

The references' fake data is replaced with content or the block is dropped: system id, coordinates, hex address, PGP key, workstation id, the Minsk timezone (the real place is "Remote, worldwide · Central European Time"), invented reading lists, latency and SLA numbers, "active releases" and "64 commits" (the real count is 64 projects), invented stats. Numbers come from `~/lib/stats` and the content files, never typed by hand. The anonymous streaming project is "Live-video streaming platform"; it carries no client name or URL.

Copy kept from the references as owner-approved wording, not data: the section jargon labels, the engagement paragraph ("Available for … contract or advisory basis") and "STATUS: AVAILABLE FOR CONTRACT".

## 5 · Accessibility

One `h1` per page. Contrast AA throughout; the one deliberate departure from the references is the search placeholder, `tertiary-container` instead of `surface-bright` (which is 1.4:1). Focus is a 2px vermilion outline with a 2px offset on every interactive element. The reduced-motion media query collapses all animation and transitions; the hover states stay, only the movement goes. The motion itself is listed under `motion` in the frontmatter. Touch targets: the header chip is 32px as in the reference.

## 6 · Print

`styles/cv-print.css` is imported by `/cv` only. It repaints the Stitch variables for paper (white, black, accent `#c2370a` at 5.4:1), hides the shell and the download button, lays every section out full width under its heading (screen and paper alike, no side label column), and prints every external link's address after its text. The header carries the square portrait (30mm on paper). The accent is rationed on this page: the current job's dates, the headline stat and link hover; technologies and figures in running text are a quiet highlight (brighter text, faint rule). The sheet is A4 with 12mm / 16mm / 19mm margins, a running footer (name, email, site, "Page N of M") in the bottom margin boxes, and runs to three pages; each job and project is kept whole across a page break. `public/Sergey-Petrinich-CV.pdf` is that print (`/cv.pdf` redirects to it), regenerated with `bun cv:pdf` whenever content or print styles change; the script tags it, adds the outline and stamps the document info and XMP from `/resume.json`.

## 7 · Verification

Per `frontend-design` §5: geometry measured at 375 and 1440 px against the reference HTML rendered the same way, console and DOM checks, hydration counter, a fresh-context reviewer against this file and the Stitch screens.

## 8 · Typography

Twelve roles from two families. One role is one utility, defined once in `styles/typography.css`; it sets family, size, line height, tracking, weight and wrap together, and leaves colour to the component. Sizes step once, at `md` (48rem), like the page frame. The kit page `/kit/typography` (development only) shows every role as computed.

| Role | Utility | Family | Size mobile / md+ | Line height | Tracking | Weight | Case and wrap |
|---|---|---|---|---|---|---|---|
| display | `type-display` | Archivo Narrow | 48 / 80 px | 1 | -0.04em | 700 | uppercase, balance |
| h1 | `type-h1` | Archivo Narrow | 36 / 52 px | 1.1 / 1.08 | -0.03em | 700 | uppercase, balance |
| h2 | `type-h2` | Archivo Narrow | 28 / 32 px | 1.15 / 1.12 | -0.02em | 700 | balance, `uppercase` added for headings |
| h3 | `type-h3` | Archivo Narrow | 22 px | 1.2 | -0.01em | 600 | balance, `uppercase` added for catalog titles |
| lead | `type-lead` | Archivo Narrow | 18 / 20 px | 1.6 | 0 | 400 | pretty |
| body | `type-body` | Archivo Narrow | 16 px | 1.5 | 0 | 400 | pretty |
| body-sm | `type-body-sm` | Archivo Narrow | 14 px | 1.55 | 0 | 400 | pretty |
| label | `type-label` | JetBrains Mono | 12 px | 1.35 | 0.08em | 500 | uppercase |
| meta | `type-meta` | JetBrains Mono | 12 px | 1.5 | 0.02em | 400 | tabular numbers |
| code | `type-code` | JetBrains Mono | 13 px | 1.5 | 0 | 400 | |
| button | `type-button` | JetBrains Mono | 13 px | 1.5 | 0.05em | 500 | uppercase |
| stat | `type-stat` | Archivo Narrow | 36 / 52 px | 1.1 / 1.08 | 0.01em | 700 | tabular numbers |

Key figures are one component, `components/key-stats.tsx`, fed by `keyStats` in `lib/stats.ts`: Years of experience, Projects, Technologies, Developers led, always in that order (a page may show the first N). A short vermilion rule sits above each numeral and the plus signs come from the data. Icons are one family, Phosphor regular weight, imported from `@phosphor-icons/react/dist/ssr` with the `Icon` suffix; there are no custom SVG marks. Selected work is one row component, `components/selected-project.tsx`, on the home page and the CV, showing the featured projects with their eight most used technologies as tags.

The display role carries a `data-fit` attribute (`short`, `medium`, `long`) that steps a long project name down; the project page sets it from the name length.

Rules.

- The scale is 12, 13, 14, 16, 18/20, 22, 28/32, 36/52, 48/80 px: a ratio of about 1.2 to 1.5 per step. Nothing is below 12px; body is 14 to 16px.
- Line height by role: 1 to 1.2 for headings, 1.55 to 1.65 for prose, 1.35 to 1.5 for mono.
- Measure: a running-text paragraph takes `max-w-prose` (65ch). Table cells and columns set their own width.
- Uppercase belongs to display, h1, h2 and h3 headings, label and button. Running text, meta and code are never uppercase. A statement or a name that must keep its case (a technology, a company, a sentence under a title) uses h2 or h3 without `uppercase`.
- Tracking is a property of the role: tight on large Archivo, wide on mono caps. A component never adds `tracking-*`, `leading-*` or a size next to a role, and never writes an arbitrary `text-[14px]`, `leading-[…]`, `tracking-[…]` or `font-[…]` (`code-rules#ad-hoc-type`; only `app/kit/` is exempt).
- Inline emphasis inside prose is `<strong>` or `rich-num` at weight 600 and `on-surface`; a link is `rich-link` with a faint rule that draws on hover. No coloured or heavy underlines.
- Wrapping: headings balance, prose is pretty (both in the roles). Numbers that change or align (counts, years, stats) use tabular figures (meta and stat have them; add `tabular-nums` to a label or a heading that shows a number).
- Colour: roles take `on-surface`, `on-surface-variant`, `secondary`, `tertiary`, `primary` freely. `tertiary-container` and `primary-container` are for large or short text (labels, figures, markers). Contrast on `surface` (`#131313`): on-surface 14.4, on-surface-variant 10.9, secondary 10.9, tertiary 10.9, tertiary-container 5.9, primary 10.9, primary-container 5.9, all AA; on `surface-container` (`#201f1f`) the lowest is 5.2. `on-primary-container` on `primary-container` is 4.56.
- Print: `styles/cv-print.css` maps the same roles to points: display 27pt, h1 to h3 11pt (project and school names 10pt), lead 10.5pt, body 10pt, body-sm 9.5pt, label, meta, code and button 8.5pt. Mono is for dates and labels only.

Do and don't.

- Do pick the role by what the text is, not by how big it should look: a year is meta, a field name is label, a row title is h3.
- Do keep a label above or beside its value on one baseline, label in `type-label`, value in `type-body-sm` or `type-body`.
- Don't set one role's size with another's utility (`type-label` with a bigger size, `type-body` with `font-semibold`); if no role fits, the scale is missing a role and this section changes first.
- Don't use a heading role for decoration: one display per page, one h1 per page.

Patterns (live on the kit page): page header, section heading with action, ledger row, label and value list, stat strip, rich-text paragraph with a link and emphasis, call to action.
