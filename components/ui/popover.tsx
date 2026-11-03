"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";

import {
  popoverAnimation,
  popoverPopup,
  popoverPositioner,
} from "~/ui/config/popover";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

export const Popover: typeof PopoverPrimitive.Root = PopoverPrimitive.Root;

export const PopoverTrigger: typeof PopoverPrimitive.Trigger =
  PopoverPrimitive.Trigger;

export function PopoverContent({
  align = "end",
  children,
  className,
  positionMethod,
  side = "bottom",
  sideOffset = 4,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    // `positionMethod="fixed"` for an anchor that is `position: sticky`: an absolute popup scrolls with the page on the compositor until the next position update and trails the stuck anchor, a fixed one stays in the viewport with it.
    "align" | "positionMethod" | "side" | "sideOffset"
  >): ReactElement {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        className={cn(popoverPositioner, "z-50")}
        data-slot="popover-positioner"
        positionMethod={positionMethod}
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn(
            popoverPopup,
            popoverAnimation,
            "flex-col bg-surface-container-low",
            className
          )}
          data-slot="popover"
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}
