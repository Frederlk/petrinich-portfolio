"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { XIcon } from "@phosphor-icons/react/dist/ssr";

import { ScrollArea } from "~/ui/scroll-area";
import { Tip } from "~/ui/tooltip";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

// A bottom sheet on Base UI Drawer: backdrop, Esc, focus trap, scroll lock and swipe-down-to-dismiss come from the Drawer. While a finger drags, the popup follows `--drawer-swipe-movement-y` with no transition and the backdrop fades by `--drawer-swipe-progress`; on release the exit runs faster the harder the flick (`--drawer-swipe-strength`). The sheet moves on `translate`, so reduced motion (which collapses transitions in globals.css) shows and hides it in place. The title bar sits outside `Drawer.Content`, so a mouse drags the sheet from the bar while text in the list stays selectable.
export const Drawer: typeof DrawerPrimitive.Root = DrawerPrimitive.Root;

export const DrawerTrigger: typeof DrawerPrimitive.Trigger =
  DrawerPrimitive.Trigger;

export const DrawerClose: typeof DrawerPrimitive.Close = DrawerPrimitive.Close;

export function DrawerContent({
  children,
  className,
  title,
  ...props
}: DrawerPrimitive.Popup.Props & { title: string }): ReactElement {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        className="fixed inset-0 z-60 bg-overlay opacity-[calc(1-var(--drawer-swipe-progress))] transition-opacity duration-300 ease-enter data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)] data-starting-style:opacity-0 data-swiping:duration-0"
        data-slot="drawer-backdrop"
      />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-60 flex items-end">
        <DrawerPrimitive.Popup
          className={cn(
            // Layout & Size
            "max-h-fill-safe flex w-full flex-col overflow-hidden",
            // Colors & shape
            "border-t border-surface-container-high bg-surface-container-low outline-none",
            // Motion
            "translate-y-(--drawer-swipe-movement-y) transition-transform duration-300 ease-enter data-ending-style:translate-y-full data-ending-style:duration-[calc(var(--drawer-swipe-strength)*300ms)] data-starting-style:translate-y-full data-swiping:duration-0 data-swiping:select-none",
            className
          )}
          data-slot="drawer"
          {...props}
        >
          <div className="flex items-center justify-between border-b border-surface-container-high pl-space-md">
            <DrawerPrimitive.Title className="type-button text-secondary">
              {title}
            </DrawerPrimitive.Title>
            <Tip label="Close">
              <DrawerPrimitive.Close
                aria-label="Close"
                className="flex size-12 cursor-pointer items-center justify-center text-secondary outline-none hover:bg-surface-container hover:text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                <XIcon aria-hidden className="size-5" />
              </DrawerPrimitive.Close>
            </Tip>
          </div>
          <DrawerPrimitive.Content>
            {/* oxlint-disable-next-line shadcn/no-arbitrary-values -- the popup cap (fill-safe) minus the 3rem title bar */}
            <ScrollArea className="max-h-[calc(100svh-6rem)]">
              <div className="pb-safe-4">{children}</div>
            </ScrollArea>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}
