# Mobile and tablet audit, 2026-11-03

Every public page was screenshotted at 320, 600 and 900px wide on the dev server, under reduced motion so every reveal sits at its end state, together with the open states (Contact menu, `/work` filters and search, `/stack` strip and search, screenshot lightbox). No page scrolls sideways at any width and no text is under 12px. The findings below come from reading the screenshots; each is grouped by the component that causes it, broken first.

## Broken

- **Page header on `/work` and `/stack`** (`components/layout/page-header.tsx`): from 768px the three key figures move beside the title, and at 900px they are squeezed so tight that "123+" and "236+" touch and "Years of experience" wraps onto two lines.
- **`/work` toolbar** (`features/work/components/work-explorer.tsx`): below about 400px the search field shares a row with Filters and shrinks to about 110px, so typed text is cut off ("REAC", "ZZQQ").
- **Home contact block** (`features/home/components/engagement.tsx`): at 320px the email and LinkedIn values wrap mid-word inside the padded box, and "Start a project" breaks onto two lines.
- **ABH summary** (`content/projects.json`): "after an emailed-code sign-in" appears twice in a row.

## Ugly

- **Three key figures below 640px** (`components/key-stats.tsx`): `/work` and `/stack` show them as two plus one, leaving the third alone on its row with an empty cell beside it, even at 600px where three fit.
- **Mobile menu button** (`components/layout/mobile-nav.tsx`): a round pale-peach chip, the only round element on the site and the colour the primary hover no longer uses.
- **Core stack tiles** (`features/stack/components/stack-core.tsx`): one tile per row at 320px, so the seven tiles take about 570px of scroll before anything else.
- **About facts** (`features/home/components/about.tsx`): at 320px the Education, Languages and Interests labels keep a fixed column, leaving the values about 150px wide and wrapping on every few words.
- **Home hero from 600 to 1023px** (`features/home/components/hero.tsx`): the photo sits 380px wide at the left with the right side of the screen empty.

## Could be better

- **Section spacing on phones**: about 120px of empty space between sections at 320px, which reads as the page having ended.
- **Footer links**: 20px tall with small gaps, under the 44px touch target.
- **`/cv?print=1` at 320px**: the name runs under the photo and the LinkedIn and Telegram values overlap. This page only feeds the PDF renderer (plain `/cv` redirects to `/`), so it is left as it is.

## Status

Fixed: every Broken item, the three key figures (one row from the `xs` breakpoint, 480px), the menu button (a square outline control), the core stack tiles (two per row below `sm`) and the About facts (labels above values below `xs`). The contact block's addresses also wrap after a slash now instead of mid-word. The home hero puts the photo beside the text from `md` (768px), and sections leave 64px instead of 96px below them under `sm`. Footer links keep their height, by the owner's choice.

Round three, from the owner's review on a phone (2026-11-04):
- **Header:** the mobile logo is 36px, the height of the header buttons, and it shows on the home page only, also after a client navigation. Below md the menu opens as a bottom drawer, like Contact.
- **Home:** below sm the location reads "CET" for the time zone, and the two buttons of the closing block stack full-width.
- **Footer:** below md the status line spans the width and the AI-agents line and copyright come last. The links are vermilion.
- **`/work`:** the type tabs stay inside the toolbar box. Search and a square Filters button, with its count on the corner, share one row at every width; at 320px the field is about 200px wide.
- **`/stack`:** the contents bar below lg is gone.
- **Everywhere:**
  - A back-to-top button appears past two screens.
  - Hash links on the same page scroll smoothly.
  - Every link to another site ends in the up-right arrow.
- **Speed:** the tap-to-first-frame delay of the mobile menu fell from 92-164 ms to 28-66 ms on the production build. The drawer is unchanged at 19-76 ms; on `/work` most of that is the scroll lock re-laying out the long ledger, kept by the owner's choice.

The dev-only frame meter (`components/dev/fps-meter.tsx`) shows in every screenshot; it is not part of the production site.
