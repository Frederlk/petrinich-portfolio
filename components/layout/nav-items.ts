import { NAV_BACK, NAV_FORWARD } from "~/components/motion/page-transition";

import { ROUTES } from "~/constants/routes";

// "Experience" is the home page section: the site has no separate route for it.
export const NAV_ITEMS = [
  { href: ROUTES.WORK, label: "Work" },
  { href: ROUTES.STACK, label: "Stack" },
  { href: `${ROUTES.HOME}#experience`, label: "Experience" },
] as const;

// `path` is `section` or a page under it; the boundary is a slash, so /workshop is not /work.
const within = (path: string, section: string) =>
  path === section || path.startsWith(`${section}/`);

// Where a path sits in the header's left-to-right order: home (and its #experience), then Work, then Stack.
const navRank = (path: string) => {
  if (within(path, ROUTES.STACK)) {
    return 2;
  }
  return within(path, ROUTES.WORK) ? 1 : 0;
};

// The page transition of a header link: further right slides forward, further left slides back, and up from a page to its own section (a project to Work) is back too; anything else (an unknown current path) takes the untyped one.
export function navTransition(from: string | null, to: string): string[] {
  if (from === null) {
    return [];
  }
  const step = navRank(to) - navRank(from);
  if (step === 0) {
    return from !== to && within(from, to) ? NAV_BACK : [];
  }
  return step > 0 ? NAV_FORWARD : NAV_BACK;
}
