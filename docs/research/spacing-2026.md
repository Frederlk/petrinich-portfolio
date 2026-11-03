# Spacing for the CV sheet and the site, 2026

Research for the `/cv` print sheet (`styles/cv-print.css`) and the matching screen page. The trigger: in a project entry the title row, the description and the next entry's title were separated by near-equal gaps, so the grouping was unclear.

## Findings

- Space inside a group must be clearly smaller than space between groups. Refactoring UI calls the failure "ambiguous spacing" and says to start with too much space and remove it, as a deliberate density decision ([excerpt](https://archive.org/stream/RefactoringUIStartWithTooMuchWhiteSpace/Refactoring%20UI%20-%20Start%20with%20too%20much%20white%20space_djvu.txt)). The "ambiguous spacing" wording itself is from a secondary summary only ([summary](https://medium.com/@azeezbasitopeyemi/summarizing-the-first-3-chapters-of-refactoring-ui-book-by-adam-wathan-and-steve-schoger-12ccbc305826)).
- Line spacing 120–145% of the point size ([Butterick](https://practicaltypography.com/line-spacing.html)), 45–90 characters per line ([Butterick](https://practicaltypography.com/line-length.html)), print body text 10–12 pt ([Butterick](https://practicaltypography.com/point-size.html)).
- GOV.UK spacing scale: 0, 5, 10, 15, 20, 25, 30, 40, 50, 60 px. Steps 0–3 stay fixed at every screen size and only steps 4–9 grow on large screens ([spacing](https://design-system.service.gov.uk/styles/spacing/)).
- Material 3 uses an 8dp scale with 4dp for type and icons, and grades dialog gaps 8, 16, 24 dp ([spacing](https://m3.material.io/styles/spacing), [dialogs](https://m3.material.io/components/dialogs/specs)). Read through search summaries only.
- Not verified: Apple HIG (the page did not load), Stripe and Linear docs (not fetched). The 8–12 mm margin range is the owner's premise, not a sourced figure.

## Rule set for the CV sheet, in pt

Scale 2, 4, 6, 10, 16, 24. Every gap inside a group is at most 6 pt and every gap between groups is at least 10 pt.

| Relationship | Gap |
|---|---|
| title to meta | 2 |
| meta to description | 4 |
| description to bullets | 4 |
| bullet to bullet | 2 |
| project to project | 10 |
| job to job | 16 |
| heading to its first entry | 10 |
| section to section | 24 |

- The heading has more space above (24) than below (10), so it binds to the content under it.
- Margins about 10 mm. Type: name 24–27, section heading 11, entry title 10.5–11, body 9.5–10, meta 8.5, never below 8.5. Line-height body 1.4, title and meta 1.3, name 1.1.
- Descriptions around 150 mm wide: a full 190 mm line holds about 105 characters, above Butterick's 90 (own estimate).
- If the sheet spills onto a third page, cut the job and project gaps first, never the in-group gaps.
- `break-inside: avoid` on entries, `break-after: avoid` on headings.

## Rule set for the site, in rem

On the 4 px grid: title to meta 0.25, meta to description 0.5, description to bullets 0.5, bullet to bullet 0.25, entry to entry 1.5, heading to first entry 0.75, section to section 2.5. Body 1rem at line-height 1.5, descriptions capped at `max-width: 65ch`. In-group tokens stay fixed across breakpoints; only the section gap and the page padding grow from `sm` up (GOV.UK pattern). Use per-relationship margins rather than `space-y-*`.
