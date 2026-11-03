import { ROUTES } from "~/constants/routes";

// "Experience" is the home page section: the site has no separate route for it.
export const NAV_ITEMS = [
  { href: ROUTES.WORK, label: "Work" },
  { href: ROUTES.STACK, label: "Stack" },
  { href: `${ROUTES.HOME}#experience`, label: "Experience" },
] as const;
