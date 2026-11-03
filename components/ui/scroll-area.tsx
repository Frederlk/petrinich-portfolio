"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

// The one scrollbar for popups and sheets: a square thumb in `--scrollbar-thumb` that turns vermilion on hover and drag, colour eased in 200 ms. Native overflow areas get the same look from the base layer in globals.css. Put the height cap on `className` (for example `max-h-[min(var(--available-height),320px)]`); the viewport inherits it, so the area scrolls instead of the surface around it.
// `fade` dims the content toward an edge that has more to scroll to (`scroll-fade` in globals.css).
export function ScrollArea({
  children,
  className,
  fade = false,
  viewportClassName,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  fade?: boolean;
  viewportClassName?: string;
}): ReactElement {
  return (
    <ScrollAreaPrimitive.Root
      className={cn("relative min-h-0 w-full", className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          // oxlint-disable-next-line shadcn/no-arbitrary-values -- the viewport takes the height cap of the root, and no scale value says "inherit"
          "max-h-[inherit] overscroll-contain outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          fade && "scroll-fade",
          viewportClassName
        )}
        data-slot="scroll-area-viewport"
      >
        <ScrollAreaPrimitive.Content>{children}</ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        className="pointer-events-none flex w-2.5 justify-center p-0.5 opacity-0 transition-opacity duration-200 data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100"
        data-slot="scroll-area-scrollbar"
      >
        <ScrollAreaPrimitive.Thumb className="w-full bg-(--scrollbar-thumb) transition-colors duration-200 hover:bg-(--scrollbar-thumb-hover) active:bg-(--scrollbar-thumb-hover)" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}
