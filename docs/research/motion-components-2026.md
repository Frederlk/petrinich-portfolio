# Motion components from four libraries (research, 2026-11-03)

Four researchers, one per library (Motion Primitives, Groot Studio, Vengeance UI, BeUI), filtered each catalog against `DESIGN.md` (square corners, no shadow, gradient, glow or blur, 360ms cap, reduced motion) and `motion-portfolio-2026.md`. The shortlist below is the pre-build research; what shipped is under "Built" and in the `motion:` block of `DESIGN.md`.

## Verdict

- **No GSAP.** Every shortlisted effect runs on `motion`, which is already installed, or on plain CSS. Only Vengeance UI's Animated Footer and Gooey Text Reveal use GSAP, and from both we take only the idea.
- **None of the four libraries has a route transition.** Page transitions come from React `<ViewTransition>` (the earlier brief) or from the Groot Studio wipe mechanism below.
- Every component is a copy-in, not a dependency: strip `rounded-*`, `shadow-*`, blur and gradients, remap `cn` to `~/lib/cn`, put durations on `--ease-enter` / `--ease-move` within 360ms, add reduced-motion handling (most components have none; a root `MotionConfig reducedMotion="user"` covers motion-based ones).
- Nothing on the LCP element (home hero `h1`, project name) may start hidden in server HTML, or LCP waits for hydration. Reveal there in CSS only, or not at all.

## Shortlist by effect

| Effect | Best source | Alternatives | Where |
|---|---|---|---|
| Section reveal on scroll (fade plus 12px rise, once) | [BeUI Scroll Reveal](https://beui.dev/components/motion/scroll-animation) | [MP InView](https://motion-primitives.com/docs/in-view) | Home blocks below the fold, `/stack` ledgers, `/work/[slug]` features table |
| Masked slide-up of display headings, per word | [Vengeance Stagger Text](https://www.vengenceui.com/components/stagger-text) | [MP TextEffect](https://motion-primitives.com/docs/text-effect), [BeUI Text Reveal](https://beui.dev/components/motion/text-animation) | Section `h2`, `WORK` title, next-project name; not the hero `h1` |
| Odometer digits on value change | [BeUI Digit Swap](https://beui.dev/components/motion/number) | [MP SlidingNumber](https://motion-primitives.com/docs/sliding-number) (adds `react-use-measure`) | `/work` shown / total counter and tab counts |
| Odometer count-up | [BeUI Number Ticker](https://beui.dev/components/motion/number) | [Vengeance Stats Counter](https://www.vengenceui.com/components/stats-counter) | Home numbers strip, only if better than the current `count-up.tsx` |
| Scramble-to-text on mono labels | [BeUI Text Scramble](https://beui.dev/components/motion/text-animation) | [MP TextScramble](https://motion-primitives.com/docs/text-scramble), [Vengeance Ascii Glitch Ripple](https://www.vengenceui.com/components/ascii-glitch-ripple) (on hover) | One or two accents: `[Lead Full-Stack Dev]`, `01 //` markers, year headers |
| Reading progress hairline | [MP ScrollProgress](https://motion-primitives.com/docs/scroll-progress) | | 1px vermilion line on the header edge, `/work/[slug]` and `/cv` |
| Page transition wipe | [Groot Theme Toggler](https://grootstudio.dev/components/theme-toggler) (mechanism only) | React `<ViewTransition>` | Flat `surface` panel wipes between routes, 360ms on `--ease-move` |
| Travelling row highlight | [BeUI Shared Layout BG](https://beui.dev/components/motion/shared-layout-bg) | | Ledgers on `/`, `/work`, `/stack`; keeps the vermilion edge |
| Screenshot preview on row hover | [Vengeance Image Reveal List](https://www.vengenceui.com/components/image-reveal-list) (idea only) | | Selected-work ledger on home, from `md` up |
| Screenshot lightbox (thumb morphs to fullscreen) | [BeUI Morphing Lightbox](https://beui.dev/components/motion/image-viewer) | | `/work/[slug]` viewport frame |
| Filtered rows reflow instead of jump | [Groot Animated Layout](https://grootstudio.dev/components/animated-layout) (the `layout` prop) | | `/work` ledger on filter change; check jank on 64 rows |
| Crossfade on tab switch | [MP TransitionPanel](https://motion-primitives.com/docs/transition-panel) | | `/stack` group tabs; needs a client wrapper over `?group=` |
| Line frame with square corner marks drawing in | [Groot Text Frame](https://grootstudio.dev/components/text-frame) | | Project name on `/work/[slug]`, without the blur |
| Oversized words rise from the bottom edge | [Vengeance Animated Footer](https://www.vengenceui.com/components/animated-footer) (idea only, no GSAP or ASCII canvas) | | Closing contact block on `/` |
| Extra underline variants | [Vengeance Line Hover Link](https://www.vengenceui.com/components/line-hover-link) | | Footer and nav, at most two variants |
| Slow tech-name marquee | [BeUI Marquee](https://beui.dev/components/motion/marquee) | [Groot Logo Marquee](https://grootstudio.dev/components/logo-marquee) | Stack teaser; ambient loop, needs a pause control (WCAG 2.2.2), low priority |

## factory.com (formerly factory.ai), measured in Chrome

- No GSAP, Lenis or scroll-driven CSS; native scroll. Motion is Tailwind keyframes plus plain CSS transitions.
- Route change: only the new page animates. A wrapper plays `pageTransitionIn` on mount: opacity 0 to 1 and translateY 6px to 0, 320ms, `cubic-bezier(0.22, 1, 0.36, 1)` (almost our `--ease-enter`). No exit and no overlap; the header stays put. This site copies it through `<ViewTransition>`.
- Hover: colour, background and border over 150 to 200ms, arrows translate over 200ms, nothing lifts or scales.
- Mega menu: slow in (420ms) and fast out (130ms), an asymmetry worth reusing.
- Scroll reveals are rare; a marquee runs at 83 to 125s per loop.

## Built (2026-11-03)

Owner's picks: the strongest fits plus the screenshot lightbox, React `<ViewTransition>` for routes (no wipe), the scramble on the header's job title only. As built: section reveal and word rise are CSS scroll timelines instead of BeUI or Vengeance components; the row highlight is `HoverTrack`; the counter is `DigitSwap`; the lightbox is a native `<dialog>` with a view-transition morph instead of BeUI's Morphing Lightbox. The record of what moves is the `motion:` block of `DESIGN.md`.

Second round, same day, after the owner found the factory-style route change too plain: routes follow the Next.js view-transitions guide (directional wipes by `transitionTypes`, a shared project-name morph, an untyped rise for links with no direction; the browser's own back and forward run no view transition in Next); the scroll-scrubbed reveals, which left rows half transparent mid-scroll, became one-shot reveals armed by `RevealObserver`; `HoverTrack` was removed and rows have their own hover background again; the tab fill stretches between tabs. A root template file was weighed against the per-page `PageTransition` and dropped: a template under the root does not remount between `/work` and `/work/[slug]`, the same segment at its level. Third round: the page now animates through the viewport-sized root snapshot and `PageTransition` is a 1px marker, because snapshotting the full 10,000px `/work` main made iOS Safari reload the tab on the second navigation.

## Rejected across all four

Glow, gradient, spotlight, shimmer and shader effects; 3D tilt, flip and carousel; magnetic and custom cursors, cursor and image trails; docks and glass navbars; rounded morphing dialogs and popovers (Base UI covers them); loaders (static site); auto-cycling text loops (WCAG 2.2.2). Per-library reject lists stayed in the session.

## Not verified

- motion-primitives.com returned 403, so its URLs come from the GitHub repo slugs (`ibelick/motion-primitives`) and were not opened.
- Groot Studio and Vengeance UI pages render no code; their mechanics come from summaries of the registry JSON, not verbatim source.
- Licences of all four repos are unchecked; check before copying code.
- Nothing was rendered or measured; `motion` and React Compiler compatibility (BeUI may use `useMemo` / `useCallback`, which our rules forbid) are unchecked.
