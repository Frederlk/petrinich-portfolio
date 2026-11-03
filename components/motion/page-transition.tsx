import { ViewTransition, type ReactElement } from "react";

// A link's `transitionTypes`: forward goes deeper or to the right in the nav, back returns.
export const NAV_FORWARD = ["nav-forward"];
export const NAV_BACK = ["nav-back"];

// The route transition's trigger, one per page.tsx. The page itself is animated through the root snapshot (`::view-transition-*(root)` by transition type, styles/motion.css), which is only viewport-sized; a `<ViewTransition>` around the whole `<main>` snapshotted a 10,000px /work page and real iPhone Safari reloaded the tab on the second such capture. React starts a browser view transition only when a boundary enters or exits, so this 1px marker does that on every route change, and its own animation is off. It sits in each page, not the layout: a layout persists, so it would never enter or exit.
export function PageTransition(): ReactElement {
  return (
    <ViewTransition default="none" enter="vt-marker" exit="vt-marker">
      <span
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 size-px opacity-0"
      />
    </ViewTransition>
  );
}

// A project's name as one shared element: a ledger row, the project title and a previous / next card that show the same project morph into each other across a navigation (`.morph` in styles/motion.css). The child must be a single element.
export function ProjectName({
  children,
  id,
}: {
  children: ReactElement;
  id: string;
}) {
  return (
    <ViewTransition default="none" name={`project-${id}`} share="morph">
      {children}
    </ViewTransition>
  );
}
