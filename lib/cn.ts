import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge, validators } from "tailwind-merge";

// tailwind-merge knows Tailwind's built-in scales only. Every token below is declared in styles/globals.css (`@theme` or `@utility`); without it here `cn("shadow-lg", "shadow-glow")` keeps both (it reads `shadow-glow` as a shadow colour) and `cn("p-4", "p-inset-2")` keeps both paddings. Add a token here when you add one there.
const INSET_PADDING = ["p", "px", "py", "pt", "pr", "pb", "pl", "ps", "pe"];

const twMerge = extendTailwindMerge({
  extend: {
    // `@utility p-inset-*` etc.: `calc(spacing * N - 1px)`, any number.
    classGroups: Object.fromEntries(
      INSET_PADDING.map((group) => [
        group,
        [{ [group]: [{ inset: [validators.isNumber] }] }],
      ])
    ),
    theme: {
      // `--drop-shadow-*`, `--inset-shadow-*`, `--shadow-*`
      "drop-shadow": ["cursor"],
      "inset-shadow": ["rim", "press"],
      // `--font-weight-inherit`
      "font-weight": ["inherit"],
      // `--leading-field-*`
      leading: ["field-xs", "field-sm", "field-md", "field-lg"],
      // `--radius-xxs` and `--radius-inset-*` (`rounded-t-inset-md`, ...)
      radius: [
        "input",
        "xxs",
        "inset-xxs",
        "inset-xs",
        "inset-sm",
        "inset-md",
        "inset-lg",
        "inset-xl",
        "inset-2xl",
      ],
      shadow: ["glow", "mask"],
      // `--tracking-*` of the larger Stitch sizes
      tracking: ["display-xl", "headline-lg", "headline-md"],
      // `--text-*` of the Stitch type scale
      text: [
        "body-sm",
        "body-md",
        "body-lg",
        "headline-sm",
        "headline-md",
        "headline-lg",
        "headline-lg-mobile",
        "display-xl",
        "display-xl-mobile",
        "code-sm",
        "code-md",
        "code-lg",
      ],
      // `--spacing-field-*` and the Stitch `--spacing-space-*`, `--spacing-gutter*`, `--spacing-margin*`: h-, min-h-, w-, p-, gap-, ...
      spacing: [
        "field-xs",
        "field-sm",
        "field-md",
        "field-lg",
        "space-xs",
        "space-sm",
        "space-md",
        "space-lg",
        "space-xl",
        "space-2xl",
        "space-3xl",
        "gutter",
        "gutter-mobile",
        "margin",
        "margin-mobile",
      ],
      // The Stitch palette names that carry no template role
      color: [
        "on-primary",
        "on-primary-container",
        "primary-container",
        "on-surface",
        "on-surface-variant",
        "surface",
        "surface-bright",
        "surface-container",
        "surface-container-high",
        "surface-container-highest",
        "surface-container-low",
        "surface-container-lowest",
        "tertiary",
        "tertiary-container",
        "outline",
        "outline-variant",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
