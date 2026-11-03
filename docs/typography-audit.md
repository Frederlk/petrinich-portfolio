# Typography audit

Audit of every typography combination in the app, taken at the HEAD before the type system (the Stitch tokens of DESIGN.md plus ad-hoc classes). Two measures: the class strings in the source, and the computed styles in the browser. The browser side is a DOM pass over the text nodes of /, /work, /work/noaspot, /stack and /cv at 1440 and 375 px on a production build.

## Summary

- Source: **71** distinct typography class combinations (a combination is the set of font, size, tracking, leading, weight, case and wrap/number utilities inside one class string) across app/, components/ and features/; 68 distinct typography utility tokens.
- Browser: **44** distinct computed (font-family, font-size, line-height, letter-spacing, font-weight, text-transform) combinations over the five pages at both widths (per page 13 to 25; /cv has the most).
- Ad-hoc arbitrary sizes: 9 (`text-[Npx]` / `text-[Nrem]` on the project page name, three length tiers with three breakpoints each).
- Raw Tailwind sizes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`) outside the Stitch scale: 20 uses, all in the leftover shadcn wrappers in components/ui.
- Sizes below 12px: 11px mono (`text-code-sm`) carries 1803 + 240 + 93 + 22 + 14 text nodes; it is the main legibility problem.
- Weights in use: 400, 500, 600, 700, 800 (800 renders as 700, the variable font stops there). Computed letter-spacings in use: 18 distinct values.
- Colour is not part of a combination here; the colour pairs are checked in DESIGN.md Typography.

## Source combinations (count of class strings, first files)

| Count | Combination | Where |
|---:|---|---|
| 28 | `font-code-sm text-code-sm` | app/cv/page.tsx, app/work/[slug]/page.tsx, components/layout/contact-row.tsx and 10 more |
| 12 | `font-code-sm text-code-sm tracking-widest uppercase` | app/cv/page.tsx, app/work/[slug]/page.tsx, components/layout/footer.tsx and 2 more |
| 11 | `font-code-md text-code-md tracking-wider uppercase` | app/work/[slug]/loading.tsx, app/work/[slug]/page.tsx, components/layout/contact-row.tsx and 8 more |
| 7 | `font-body-md text-body-md` | app/work/[slug]/page.tsx, components/layout/experience-entry.tsx, features/home/components/about.tsx and 3 more |
| 6 | `font-body-sm text-body-sm` | app/cv/page.tsx, app/work/[slug]/page.tsx, features/home/components/hero.tsx and 2 more |
| 5 | `font-headline-sm text-headline-sm tracking-tight uppercase` | app/cv/page.tsx, components/layout/footer.tsx, components/layout/header.tsx and 1 more |
| 5 | `font-code-sm text-code-sm tracking-wider uppercase` | app/cv/page.tsx, components/ui/select.tsx, components/ui/switch.tsx and 1 more |
| 5 | `font-bold` | components/ui/cta-link.tsx, features/work/components/work-filters.tsx, features/work/components/work-ledger.tsx |
| 4 | `uppercase` | app/cv/page.tsx, components/layout/ledger-header.tsx |
| 4 | `font-code-sm text-code-sm uppercase` | app/cv/page.tsx, features/stack/components/stack-header.tsx, features/work/components/work-ledger.tsx |
| 4 | `font-code-sm tabular-nums text-code-sm` | components/dev/fps-meter.tsx, features/stack/components/stack-core.tsx, features/stack/components/stack-groups-list.tsx and 1 more |
| 4 | `text-sm` | components/ui/button.tsx, components/ui/empty.tsx, components/ui/toast.tsx |
| 3 | `font-body-md text-body-md text-pretty` | app/cv/page.tsx, components/layout/experience-entry.tsx, features/work/components/work-header.tsx |
| 3 | `font-headline-sm text-headline-sm uppercase` | app/cv/page.tsx |
| 3 | `font-headline-sm text-headline-sm tracking-tight` | app/work/[slug]/page.tsx, features/stack/components/stack-browser.tsx, features/stack/components/stack-core.tsx |
| 3 | `font-medium` | components/rich-text.tsx, components/ui/toast.tsx |
| 2 | `font-display-xl leading-none text-display-xl tracking-tighter uppercase` | app/cv/page.tsx, features/work/components/work-header.tsx |
| 2 | `font-semibold` | app/cv/page.tsx, components/rich-text.tsx |
| 2 | `font-bold font-code-sm text-code-sm uppercase` | app/cv/page.tsx, app/work/[slug]/page.tsx |
| 2 | `font-code-md text-code-md uppercase` | app/cv/page.tsx, features/work/components/work-explorer.tsx |
| 2 | `font-display-xl leading-none md:text-display-xl md:tracking-display-xl text-display-xl-mobile tracking-tighter uppercase` | app/not-found.tsx, features/home/components/hero.tsx |
| 2 | `font-body-lg text-body-lg` | app/work/[slug]/page.tsx, features/home/components/engagement.tsx |
| 2 | `font-bold font-display-xl leading-none text-headline-lg tracking-tight uppercase` | app/work/[slug]/page.tsx |
| 2 | `font-headline-sm text-balance text-headline-sm tracking-tight` | components/layout/experience-entry.tsx, features/stack/components/stack-groups-list.tsx |
| 2 | `font-headline-sm text-balance text-headline-sm tracking-tight uppercase` | components/layout/section-header.tsx, features/home/components/hero.tsx |
| 2 | `sm:text-sm` | components/ui/button.tsx, components/ui/config/list.tsx |
| 2 | `font-normal tracking-normal` | components/ui/cta-link.tsx |
| 2 | `text-pretty` | features/home/components/about.tsx |
| 2 | `font-headline-lg md:text-headline-lg md:tracking-headline-lg text-headline-lg-mobile tracking-tight uppercase` | features/home/components/engagement.tsx, features/stack/components/stack-header.tsx |
| 2 | `font-code-md text-code-md` | features/home/components/selected-work.tsx, features/work/components/work-ledger.tsx |
| 2 | `font-code-sm tabular-nums text-code-sm tracking-widest uppercase` | features/stack/components/stack-browser.tsx, features/work/components/work-explorer.tsx |
| 2 | `font-body-md font-semibold text-body-md` | features/stack/components/stack-core.tsx |
| 1 | `font-code-md font-semibold text-code-md tracking-wider uppercase` | app/cv/page.tsx |
| 1 | `font-body-lg leading-relaxed text-body-lg` | app/cv/page.tsx |
| 1 | `font-headline-sm text-headline-sm` | app/cv/page.tsx |
| 1 | `font-normal` | app/cv/page.tsx |
| 1 | `font-body-sm text-body-sm text-pretty` | app/cv/page.tsx |
| 1 | `font-bold font-code-md text-code-md uppercase` | app/cv/page.tsx |
| 1 | `font-body-md leading-relaxed text-body-md` | app/cv/page.tsx |
| 1 | `font-headline-md md:text-headline-md md:tracking-headline-md text-headline-sm tracking-tight` | app/not-found.tsx |
| 1 | `lg:text-[9.5rem] sm:text-[6.5rem] text-[4rem]` | app/work/[slug]/page.tsx |
| 1 | `lg:text-[6.5rem] sm:text-[4.5rem] text-[3rem]` | app/work/[slug]/page.tsx |
| 1 | `lg:text-[4.5rem] sm:text-[3.5rem] text-[2.25rem]` | app/work/[slug]/page.tsx |
| 1 | `font-display-xl font-extrabold leading-none tracking-tighter uppercase` | app/work/[slug]/page.tsx |
| 1 | `font-medium text-xs tracking-wide uppercase` | components/fallbacks/error.tsx |
| 1 | `font-code-sm text-code-sm text-pretty` | components/layout/experience-entry.tsx |
| 1 | `font-medium text-base` | components/ui/button.tsx |
| 1 | `text-lg` | components/ui/button.tsx |
| 1 | `sm:text-base` | components/ui/button.tsx |
| 1 | `sm:text-xs` | components/ui/button.tsx |
| 1 | `data-pressed:underline hover:underline` | components/ui/button.tsx |
| 1 | `text-base` | components/ui/config/list.tsx |
| 1 | `font-medium text-xs` | components/ui/config/list.tsx |
| 1 | `sm:text-sm text-base` | components/ui/config/list.tsx |
| 1 | `font-medium font-sans text-xs tracking-widest` | components/ui/config/menu.tsx |
| 1 | `text-balance` | components/ui/empty.tsx |
| 1 | `font-heading font-semibold text-xl` | components/ui/empty.tsx |
| 1 | `text-balance text-sm` | components/ui/empty.tsx |
| 1 | `data-active:font-bold` | components/ui/tabs.tsx |
| 1 | `text-balance text-xs` | components/ui/toast.tsx |
| 1 | `font-mono leading-4 text-xs` | components/ui/tooltip.tsx |
| 1 | `font-body-lg text-body-lg text-pretty` | features/home/components/about.tsx |
| 1 | `font-headline-md md:text-headline-md md:tracking-headline-md text-balance text-headline-sm tracking-tight uppercase` | features/home/components/hero.tsx |
| 1 | `font-bold font-display-xl leading-none text-headline-lg tracking-tight` | features/home/components/hero.tsx |
| 1 | `font-code-sm font-normal tabular-nums text-code-sm` | features/stack/components/stack-groups-list.tsx |
| 1 | `font-headline-md leading-none text-headline-md` | features/stack/components/stack-header.tsx |
| 1 | `font-normal tabular-nums` | features/work/components/work-explorer.tsx |
| 1 | `font-bold font-code-md tracking-wider uppercase` | features/work/components/work-filters.tsx |
| 1 | `font-headline-md text-headline-md tracking-tight` | features/work/components/work-header.tsx |
| 1 | `font-headline-sm leading-none text-balance text-headline-sm tracking-tight uppercase` | features/work/components/work-ledger.tsx |
| 1 | `font-body-md leading-normal text-body-md text-pretty` | features/work/components/work-ledger.tsx |

## Computed combinations in the browser (text nodes, 10 page renders)

| Text nodes | font-family | size | line-height | tracking | weight | case |
|---:|---|---|---|---|---|---|
| 1803 | JetBrains Mono | 11px | 16px | 0.44px | 400 | none |
| 722 | Archivo Narrow | 14px | 22px | 0.14px | 400 | none |
| 522 | Archivo Narrow | 16px | 24px | normal | 400 | none |
| 240 | JetBrains Mono | 11px | 16px | 0.44px | 400 | uppercase |
| 226 | JetBrains Mono | 13px | 20px | 0.26px | 500 | none |
| 214 | Archivo Narrow | 22px | 22px | -0.55px | 600 | uppercase |
| 146 | JetBrains Mono | 13px | 20px | normal | 400 | none |
| 93 | JetBrains Mono | 11px | 16px | 1.1px | 400 | uppercase |
| 80 | Archivo Narrow | 22px | 26px | -0.55px | 600 | none |
| 66 | JetBrains Mono | 13px | 20px | 0.65px | 500 | uppercase |
| 59 | Archivo Narrow | 22px | 26px | -0.55px | 600 | uppercase |
| 44 | Archivo Narrow | 22px | 26px | -0.22px | 600 | uppercase |
| 42 | Archivo Narrow | 18px | 28px | normal | 400 | none |
| 28 | Archivo Narrow | 18px | 29.25px | normal | 400 | none |
| 26 | Archivo Narrow | 16px | 24px | normal | 500 | none |
| 24 | Archivo Narrow | 16px | 24px | normal | 600 | none |
| 22 | JetBrains Mono | 13px | 20px | 0.65px | 700 | uppercase |
| 22 | JetBrains Mono | 11px | 16px | 0.44px | 700 | uppercase |
| 20 | Archivo Narrow | 22px | 26px | -0.55px | 400 | uppercase |
| 14 | JetBrains Mono | 11px | 16px | 0.44px | 700 | none |
| 14 | Archivo Narrow | 14px | 22px | 0.14px | 500 | none |
| 10 | Archivo Narrow | 32px | 36px | -0.8px | 700 | none |
| 10 | JetBrains Mono | 13px | 20px | 0.65px | 400 | uppercase |
| 10 | JetBrains Mono | 11px | 16px | 0.55px | 400 | uppercase |
| 8 | Archivo Narrow | 52px | 52px | -1.3px | 700 | none |
| 8 | Archivo Narrow | 22px | 26px | -0.22px | 600 | none |
| 6 | Archivo Narrow | 18px | 28px | normal | 500 | none |
| 6 | Archivo Narrow | 32px | 32px | -0.64px | 700 | none |
| 6 | Archivo Narrow | 18px | 29.25px | normal | 500 | none |
| 6 | Archivo Narrow | 16px | 26px | normal | 400 | none |
| 4 | Archivo Narrow | 80px | 80px | -4px | 800 | uppercase |
| 4 | Archivo Narrow | 52px | 52px | -1.3px | 700 | uppercase |
| 4 | JetBrains Mono | 11px | 16px | 0.44px | 600 | none |
| 4 | JetBrains Mono | 13px | 20px | 0.26px | 700 | uppercase |
| 4 | Archivo Narrow | 16px | 26px | normal | 500 | none |
| 3 | Archivo Narrow | 52px | 56px | -1.56px | 700 | uppercase |
| 3 | Archivo Narrow | 36px | 40px | -0.9px | 700 | uppercase |
| 2 | Archivo Narrow | 152px | 152px | -7.6px | 800 | uppercase |
| 2 | JetBrains Mono | 13px | 20px | 0.65px | 600 | uppercase |
| 2 | JetBrains Mono | 13px | 20px | 0.26px | 500 | uppercase |
| 2 | Archivo Narrow | 64px | 64px | -3.2px | 800 | uppercase |
| 1 | Archivo Narrow | 80px | 80px | -3.2px | 800 | uppercase |
| 1 | Archivo Narrow | 32px | 36px | -0.64px | 700 | uppercase |
| 1 | Archivo Narrow | 48px | 48px | -2.4px | 800 | uppercase |

## Reading

- One family pair (Archivo Narrow, JetBrains Mono) is already in use consistently; the variation is in size, tracking, weight and case, not in family.
- Mono at 11px with three tracking values (0.04em, 0.1em, 0.05em) and three weights is the biggest spread; the same role (a field label, a date, a count) is set in 11px and 13px in different places.
- Archivo 22px appears at two line heights (22px and 26px) and three tracking values, in uppercase and sentence case, at weights 400 and 600.
- Body text is 14px, 16px and 18px with 22px, 24px, 26px, 28px and 29.25px line heights; the about column body is 18px next to 14px values.
- The project page sets its name in three ad-hoc arbitrary size tiers outside any scale.

## After the type system

Same two measures after the migration to the twelve roles of DESIGN.md section 8.

| Measure | Before | After |
|---|---:|---:|
| Source: distinct typography class combinations | 71 | 18 |
| Source: distinct typography utility tokens | 68 | 12 roles, `uppercase`, `tabular-nums`, `text-balance`, `text-pretty` |
| Source: arbitrary sizes (`text-[..]`) and raw Tailwind sizes (`text-sm` and the like) | 29 | 0 |
| Browser: distinct computed combinations over the five pages at 1440 and 375 px | 44 | 26 |
| Browser: combinations per page and width | 13 to 25 | 8 to 16 |
| Smallest text size | 11 px | 12 px |
| Weights in use | 400, 500, 600, 700, 800 | 400, 500, 600, 700 |
| Computed letter-spacings | 18 | 13 |

- The 18 source combinations are the 12 roles, `type-h2` and `type-h3` with and without `uppercase`, and four roles with a wrap or number helper (`tabular-nums`, `text-pretty`, `text-balance`) on a label, a heading or a meta line.
- The 26 computed combinations are the 12 roles at their two widths where a role steps (display, h1, h2, lead, stat), the sentence-case and uppercase forms of h2 and h3, and inline emphasis at weight 600 inside body, body-sm and lead.
