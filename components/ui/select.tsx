"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, CaretDownIcon } from "@phosphor-icons/react/dist/ssr";

import {
  popoverAnimation,
  popoverPopup,
  popoverPositioner,
} from "~/ui/config/popover";
import { ScrollArea } from "~/ui/scroll-area";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

// Roots need `items` so Value renders the label, not the raw value.
export const Select: typeof SelectPrimitive.Root = SelectPrimitive.Root;

export const SelectValue: typeof SelectPrimitive.Value = SelectPrimitive.Value;

export function SelectTrigger({
  children,
  className,
  ...props
}: SelectPrimitive.Trigger.Props): ReactElement {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex h-control w-full cursor-pointer items-center justify-between gap-space-sm px-space-md text-left type-button text-secondary transition-colors duration-200 select-none",
        "hover:bg-surface-container hover:text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-popup-open:bg-surface-container data-popup-open:text-on-surface",
        className
      )}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="shrink-0 text-primary-container">
        <CaretDownIcon aria-hidden className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  children,
  className,
  ...props
}: SelectPrimitive.Popup.Props): ReactElement {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align="start"
        alignItemWithTrigger={false}
        className={cn(popoverPositioner, "z-70")}
        data-slot="select-positioner"
        // The selects sit in the fixed Filters popover under the sticky /work toolbar; an absolute popup would trail them on scroll.
        positionMethod="fixed"
        sideOffset={0}
      >
        <SelectPrimitive.Popup
          className={cn(
            popoverPopup,
            popoverAnimation,
            "w-(--anchor-width) flex-col overflow-hidden bg-surface-container-low",
            className
          )}
          data-slot="select-popup"
          {...props}
        >
          <ScrollArea className="max-h-[min(var(--available-height),320px)]">
            {children}
          </ScrollArea>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  children,
  className,
  ...props
}: SelectPrimitive.Item.Props): ReactElement {
  return (
    <SelectPrimitive.Item
      className={cn(
        "grid min-h-9 cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 px-space-sm py-1 type-button text-secondary outline-none select-none",
        "data-highlighted:bg-surface-container-high data-highlighted:text-on-surface data-selected:text-on-surface",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1">
        <CheckIcon aria-hidden className="size-3.5 text-primary-container" />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
