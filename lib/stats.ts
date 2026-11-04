import { siteNumbers } from "~/lib/content";

// The headline figures in the one order every page shows them (components/key-stats.tsx). `href` is the page that lists what the figure counts; `short` replaces a long label below xs.
export const keyStats = [
  {
    href: null,
    label: "Years of experience",
    short: "Years",
    value: siteNumbers.years,
  },
  { href: "/work", label: "Projects", value: siteNumbers.allProjects },
  {
    href: "/stack",
    label: "Technologies",
    short: "Tech",
    value: siteNumbers.technologies,
  },
  { href: null, label: "Developers led", value: siteNumbers.developersLed },
] as const;
