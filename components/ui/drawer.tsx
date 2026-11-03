"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react/dist/ssr";

import { ScrollArea } from "~/ui/scroll-area";
import { Tip } from "~/ui/tooltip";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

// A bottom sheet on Base UI Dialog: backdrop, Esc, focus trap and scroll lock come from the Dialog; the sheet slides up on transform, so reduced motion (which collapses transitions in globals.css) shows it in place. It needs no drag: the close button, the backdrop and Esc all dismiss it.
export const Drawer: typeof DialogPrimitive.Root = DialogPrimitive.Root;

export const DrawerTrigger: typeof DialogPrimitive.Trigger =
  DialogPrimitive.Trigger;

export function DrawerContent({
  children,
  className,
  title,
  ...props
}: DialogPrimitive.Popup.Props & { title: string }): ReactElement {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        className="fixed inset-0 z-60 bg-overlay transition-opacity duration-300 ease-enter data-ending-style:opacity-0 data-starting-style:opacity-0"
        data-slot="drawer-backdrop"
      />
      <DialogPrimitive.Popup
        className={cn(
          // Layout & Size
          "max-h-fill-safe fixed inset-x-0 bottom-0 z-60 flex flex-col overflow-hidden",
          // Colors & shape
          "border-t border-surface-container-high bg-surface-container-low outline-none",
          // Motion
          "transition-transform duration-300 ease-enter data-ending-style:translate-y-full data-starting-style:translate-y-full",
          className
        )}
        data-slot="drawer"
        {...props}
      >
        <div className="flex items-center justify-between border-b border-surface-container-high pl-space-md">
          <DialogPrimitive.Title className="type-button text-secondary">
            {title}
          </DialogPrimitive.Title>
          <Tip label="Close">
            <DialogPrimitive.Close
              aria-label="Close"
              className="flex size-12 cursor-pointer items-center justify-center text-secondary outline-none hover:bg-surface-container hover:text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <XIcon aria-hidden className="size-5" />
            </DialogPrimitive.Close>
          </Tip>
        </div>
        {/* oxlint-disable-next-line shadcn/no-arbitrary-values -- the popup cap (fill-safe) minus the 3rem title bar */}
        <ScrollArea className="max-h-[calc(100svh-6rem)]">
          <div className="pb-safe-4">{children}</div>
        </ScrollArea>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}
