import { cva, type VariantProps } from "class-variance-authority";

import {
  listGroupLabel,
  listItemIndicatorLayout,
  listRow,
} from "~/ui/config/list";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

export const checkableItemVariants = cva(
  cn(listRow, "in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)]"),
  {
    defaultVariants: { indicator: "start-box" },
    variants: {
      indicator: {
        end: listItemIndicatorLayout.end,
        none: cn(
          listItemIndicatorLayout.none,
          "data-checked:bg-primary/10 data-checked:text-primary",
          "data-checked:data-highlighted:bg-primary/15 data-checked:data-highlighted:text-primary"
        ),
        start: listItemIndicatorLayout.start,
        "start-box": listItemIndicatorLayout["start-box"],
        switch: "grid grid-cols-[1fr_auto] gap-4 ps-2 pe-1.5",
      },
    },
  }
);

export type MenuIndicator = NonNullable<
  VariantProps<typeof checkableItemVariants>["indicator"]
>;

export const menuSwitchThumb = cn(
  "pointer-events-none block aspect-square h-full",
  "origin-left in-data-checked:origin-[var(--thumb-size)_50%]",
  "in-data-checked:translate-x-[calc(var(--thumb-size)-4px)]",
  "in-active:scale-x-110 in-active:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.10)]",
  "rounded-(--thumb-size) bg-background shadow-sm will-change-transform",
  // oxlint-disable-next-line shadcn/no-arbitrary-values -- multi-property transition with per-property delay has no utility
  "[transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]"
);

export function MenuThumbSpan(): ReactElement {
  return <span className={menuSwitchThumb} />;
}

export const menuSwitchIndicator = cn(
  "inline-flex shrink-0 items-center rounded-full p-px inset-shadow-(--shadow-glow)",
  "h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)]",
  "transition-[background-color,box-shadow] duration-200 outline-none",
  "focus-visible:focus-ring data-checked:bg-primary",
  "data-disabled:disabled-state",
  "data-unchecked:bg-input",
  "[--thumb-size:--spacing(4)] sm:[--thumb-size:--spacing(3)]"
);

export const menuItem = cn(
  listRow,
  "flex px-2 data-inset:ps-8",
  "data-[variant=destructive]:text-destructive-foreground",
  "data-[variant=destructive]:focus-visible:ring-destructive",
  "data-[variant=destructive]:[&_svg:not([class*='text-'])]:text-destructive-foreground",
  "data-[variant=muted]:bg-muted data-[variant=muted]:text-foreground",
  "data-[variant=muted]:data-highlighted:bg-accent data-[variant=muted]:data-highlighted:text-accent-foreground",
  "data-[variant=destructive]:data-highlighted:bg-destructive/10",
  "data-[variant=destructive]:data-highlighted:text-destructive-foreground"
);

export const menuItemVariants = cva(menuItem, {
  defaultVariants: { variant: "default" },
  variants: {
    variant: {
      contact:
        "min-h-12 rounded-none px-space-md py-space-sm data-highlighted:bg-transparent sm:min-h-12",
      default: "",
      destructive: "",
      muted: "",
    },
  },
});

export const menuSubTrigger = cn(
  listRow,
  "flex px-2 data-inset:ps-8",
  "data-popup-open:bg-accent data-popup-open:text-accent-foreground"
);

export const menuShortcut = "ms-auto type-meta text-muted-foreground/70";

export const menuLabel = cn(
  listGroupLabel,
  "data-inset:ps-9 sm:data-inset:ps-8"
);

export const menuPopup = "flex-col overflow-hidden";
