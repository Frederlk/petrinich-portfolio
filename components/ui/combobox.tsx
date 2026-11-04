"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import {
  CaretDownIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { createContext, useContext, useRef } from "react";

import {
  popoverAnimation,
  popoverPopup,
  popoverPositioner,
} from "~/ui/config/popover";
import { ScrollArea } from "~/ui/scroll-area";

import { cn } from "~/lib/cn";

import type { ReactElement, RefObject } from "react";

// The popup anchors to the chips row, not to the input inside it, so it opens under the whole field.
const ChipsRef = createContext<RefObject<HTMLDivElement | null> | null>(null);

// Items come from the root's `items` and render through `ComboboxList`'s function child; static item children turn filtering off.
export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple>
): ReactElement {
  const chipsRef = useRef<HTMLDivElement | null>(null);
  return (
    <ChipsRef.Provider value={chipsRef}>
      <ComboboxPrimitive.Root {...props} />
    </ChipsRef.Provider>
  );
}

export const ComboboxValue: typeof ComboboxPrimitive.Value =
  ComboboxPrimitive.Value;

// The field: picked chips, then the search input, then the caret. Hover and focus match `SelectTrigger`.
export function ComboboxChips({
  children,
  className,
  ...props
}: ComboboxPrimitive.Chips.Props): ReactElement {
  const chipsRef = useContext(ChipsRef);
  return (
    <ComboboxPrimitive.Chips
      className={cn(
        "flex min-h-control w-full cursor-text flex-wrap items-center gap-1 py-1 ps-space-sm pe-space-md transition-colors duration-200",
        "focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ring hover:bg-surface-container",
        className
      )}
      data-slot="combobox-chips"
      ref={chipsRef}
      {...props}
    >
      {children}
      <ComboboxPrimitive.Trigger
        aria-label="Show options"
        className="ms-auto flex shrink-0 cursor-pointer items-center text-primary-container outline-none"
        data-slot="combobox-trigger"
      >
        <CaretDownIcon aria-hidden className="size-4" />
      </ComboboxPrimitive.Trigger>
    </ComboboxPrimitive.Chips>
  );
}

export function ComboboxChipsInput({
  className,
  ...props
}: ComboboxPrimitive.Input.Props): ReactElement {
  return (
    <ComboboxPrimitive.Input
      className={cn(
        "h-7 min-w-16 flex-1 bg-transparent ps-1 type-button text-on-surface outline-none placeholder:text-secondary",
        className
      )}
      data-slot="combobox-chips-input"
      {...props}
    />
  );
}

export function ComboboxChip({
  children,
  className,
  ...props
}: ComboboxPrimitive.Chip.Props): ReactElement {
  return (
    <ComboboxPrimitive.Chip
      className={cn(
        "flex h-7 max-w-36 min-w-0 items-center bg-surface-container-high ps-space-sm type-label whitespace-nowrap text-on-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className
      )}
      data-slot="combobox-chip"
      title={typeof children === "string" ? children : undefined}
      {...props}
    >
      <span className="truncate">{children}</span>
      <ComboboxPrimitive.ChipRemove
        aria-label={`Remove ${typeof children === "string" ? children : ""}`.trim()}
        className="flex h-full cursor-pointer items-center px-1.5 text-secondary hover:text-primary-container"
        data-slot="combobox-chip-remove"
      >
        <XIcon aria-hidden className="size-3.5" />
      </ComboboxPrimitive.ChipRemove>
    </ComboboxPrimitive.Chip>
  );
}

export function ComboboxPopup({
  children,
  className,
  ...props
}: ComboboxPrimitive.Popup.Props): ReactElement {
  const chipsRef = useContext(ChipsRef);
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align="start"
        anchor={chipsRef}
        className={cn(popoverPositioner, "z-70")}
        data-slot="combobox-positioner"
        // Its only field sits in the fixed Filters popover under the sticky /work toolbar; an absolute popup would trail it on scroll.
        positionMethod="fixed"
        sideOffset={0}
      >
        <ComboboxPrimitive.Popup
          className={cn(
            popoverPopup,
            popoverAnimation,
            "w-(--anchor-width) flex-col overflow-hidden bg-surface-container-low",
            className
          )}
          data-slot="combobox-popup"
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function ComboboxList(
  props: ComboboxPrimitive.List.Props
): ReactElement {
  return (
    <ScrollArea className="max-h-[min(var(--available-height),320px)]">
      <ComboboxPrimitive.List data-slot="combobox-list" {...props} />
    </ScrollArea>
  );
}

// The same row as `SelectItem`: a check in the first column marks a picked item.
export function ComboboxItem({
  children,
  className,
  ...props
}: ComboboxPrimitive.Item.Props): ReactElement {
  return (
    <ComboboxPrimitive.Item
      className={cn(
        "grid min-h-9 cursor-pointer grid-cols-[1rem_1fr] items-center gap-2 px-space-sm py-1 type-button text-secondary outline-none select-none",
        "data-highlighted:bg-surface-container-high data-highlighted:text-on-surface data-selected:text-on-surface",
        className
      )}
      data-slot="combobox-item"
      {...props}
    >
      <ComboboxPrimitive.ItemIndicator className="col-start-1">
        <CheckIcon aria-hidden className="size-3.5 text-primary-container" />
      </ComboboxPrimitive.ItemIndicator>
      <span className="col-start-2">{children}</span>
    </ComboboxPrimitive.Item>
  );
}

// Grouped `items` ({ value, items }) render one group each; the group's own `items` feed its `ComboboxCollection`, which renders the filtered rows.
export function ComboboxGroup({
  className,
  ...props
}: ComboboxPrimitive.Group.Props): ReactElement {
  return (
    <ComboboxPrimitive.Group
      className={cn(
        "not-first:border-t not-first:border-surface-container-high",
        className
      )}
      data-slot="combobox-group"
      {...props}
    />
  );
}

export function ComboboxGroupLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props): ReactElement {
  return (
    <ComboboxPrimitive.GroupLabel
      className={cn(
        "px-space-sm pt-space-sm pb-1 type-label text-tertiary select-none",
        className
      )}
      data-slot="combobox-group-label"
      {...props}
    />
  );
}

export const ComboboxCollection: typeof ComboboxPrimitive.Collection =
  ComboboxPrimitive.Collection;

export function ComboboxEmpty({
  className,
  ...props
}: ComboboxPrimitive.Empty.Props): ReactElement {
  return (
    <ComboboxPrimitive.Empty
      className={cn(
        "type-label text-tertiary not-empty:px-space-sm not-empty:py-space-sm",
        className
      )}
      data-slot="combobox-empty"
      {...props}
    />
  );
}
