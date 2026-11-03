import { CheckIcon } from "@phosphor-icons/react/dist/ssr";

import { triggerIcons, triggerIconsStatic } from "~/ui/config/interaction";

import { cn } from "~/lib/cn";

import type { ComponentProps } from "react";

export function ListCheckIcon(props: ComponentProps<typeof CheckIcon>) {
  return <CheckIcon {...props} />;
}

export const listItemIndicatorLayout = {
  end: "grid grid-cols-[1fr_1rem] ps-2 pe-2",
  none: "flex px-2",
  start: "grid grid-cols-[1rem_1fr] ps-2 pe-4",
  "start-box": "grid grid-cols-[1rem_1fr] ps-2 pe-4",
} as const;

export type ListItemIndicator = keyof typeof listItemIndicatorLayout;

export const listRow = cn(
  triggerIcons,
  triggerIconsStatic,
  "min-h-8 items-center gap-2 rounded-sm py-1 type-body-sm text-foreground outline-none select-none",
  "transition-colors duration-150",
  "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
  "data-disabled:disabled-state",
  "sm:min-h-7 [&_svg:not([class*='text-'])]:text-muted-foreground"
);

export const listItemContent = "flex min-w-0 items-center gap-2";

export const listItemMarker = cn(
  "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary text-transparent opacity-50",
  "in-data-selected:bg-primary in-data-selected:text-primary-foreground in-data-selected:opacity-100",
  "in-data-checked:bg-primary in-data-checked:text-primary-foreground in-data-checked:opacity-100"
);

export const listSeparator = "mx-2 my-1 h-px bg-border last:hidden";

export const listGroupLabel = "px-2 py-1.5 type-label text-muted-foreground";

export const listEmpty =
  "not-empty:p-2 text-center type-body-sm text-muted-foreground";

export const listSearchIcon = "size-4.5 sm:size-4 shrink-0 opacity-80";
