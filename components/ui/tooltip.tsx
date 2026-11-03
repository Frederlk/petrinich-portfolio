"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { popoverAnimationStates } from "~/ui/config/popover";

import { cn } from "~/lib/cn";

import type { ReactElement, ReactNode } from "react";

// One provider at the root is the shared delay group: the first tooltip waits `delay`, and moving to a neighbour within `timeout` opens its tooltip at once.
export function TooltipProvider(
  props: TooltipPrimitive.Provider.Props
): ReactElement {
  return <TooltipPrimitive.Provider closeDelay={0} delay={300} {...props} />;
}

export const Tooltip: typeof TooltipPrimitive.Root = TooltipPrimitive.Root;

export function TooltipTrigger(
  props: TooltipPrimitive.Trigger.Props
): ReactElement {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

// The Stitch tooltip: a darker surface than the page, a hairline, 12px mono, square corners. It sits beside its trigger, never over it, and flips when there is no room; it fades in and scales from the trigger edge.
export function TooltipContent({
  align = "center",
  children,
  className,
  side = "top",
  sideOffset = 8,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "side" | "sideOffset"
  >): ReactElement {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        className="z-80"
        collisionPadding={8}
        data-slot="tooltip-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          className={cn(
            "max-w-72 origin-(--transform-origin) border border-surface-container-highest bg-surface-container-lowest px-space-sm py-1.5 type-meta text-on-surface",
            "transition-[scale,opacity] duration-150 ease-(--ease-enter)",
            popoverAnimationStates,
            className
          )}
          data-slot="tooltip-popup"
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

// A tooltip on one element: `<Tip label="Close"><button /></Tip>`. The child becomes the trigger, so it keeps its own element, ref and handlers.
export function Tip({
  children,
  label,
  side,
}: {
  children: ReactElement;
  label: ReactNode;
  side?: TooltipPrimitive.Positioner.Props["side"];
}): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
