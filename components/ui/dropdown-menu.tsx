"use client";

import { Menu as _MenuPrimitive } from "@base-ui/react/menu";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import {
  type ComponentProps,
  createContext,
  type ReactElement,
  useContext,
} from "react";

import {
  ListCheckIcon,
  listItemContent,
  listItemMarker,
  listSeparator,
} from "~/ui/config/list";
import {
  checkableItemVariants,
  type MenuIndicator,
  MenuThumbSpan,
  menuItemVariants,
  menuLabel,
  menuPopup,
  menuShortcut,
  menuSubTrigger,
  menuSwitchIndicator,
} from "~/ui/config/menu";
import {
  popoverAnimation,
  popoverPopup,
  popoverPositioner,
} from "~/ui/config/popover";
import { ScrollArea } from "~/ui/scroll-area";

import { cn } from "~/lib/cn";

import type { VariantProps } from "class-variance-authority";

export type DropdownMenuIndicator = MenuIndicator;
type RadioIndicator = Exclude<DropdownMenuIndicator, "switch" | "start-box">;

export const DropdownMenuContext =
  createContext<DropdownMenuIndicator>("start-box");

export const DropdownMenuCreateHandle: typeof _MenuPrimitive.createHandle =
  _MenuPrimitive.createHandle;

export const DropdownMenu: typeof _MenuPrimitive.Root = _MenuPrimitive.Root;

export const DropdownMenuPortal: typeof _MenuPrimitive.Portal =
  _MenuPrimitive.Portal;

export function DropdownMenuTrigger({
  className,
  children,
  ...props
}: _MenuPrimitive.Trigger.Props): ReactElement {
  return (
    <span className="contents">
      <_MenuPrimitive.Trigger
        className={className}
        data-slot="menu-trigger"
        {...props}
      >
        {children}
      </_MenuPrimitive.Trigger>
    </span>
  );
}

export function DropdownMenuContent({
  children,
  className,
  indicator,
  sideOffset = 4,
  align = "center",
  alignOffset,
  side = "bottom",
  anchor,
  portalProps,
  matchTriggerWidth,
  ...props
}: _MenuPrimitive.Popup.Props & {
  indicator?: DropdownMenuIndicator | undefined;
  align?: _MenuPrimitive.Positioner.Props["align"];
  sideOffset?: _MenuPrimitive.Positioner.Props["sideOffset"];
  alignOffset?: _MenuPrimitive.Positioner.Props["alignOffset"];
  side?: _MenuPrimitive.Positioner.Props["side"];
  anchor?: _MenuPrimitive.Positioner.Props["anchor"];
  portalProps?: _MenuPrimitive.Portal.Props;
  matchTriggerWidth?: boolean;
}): ReactElement {
  return (
    <DropdownMenuPortal {...portalProps}>
      <_MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className={cn(
          cn(popoverPositioner, "z-50"),
          matchTriggerWidth === true && "min-w-(--anchor-width)"
        )}
        data-slot="menu-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <_MenuPrimitive.Popup
          className={cn(
            // Merged onto Popup (not an inner div) so user className wins via tailwind-merge.
            cn(popoverPopup, popoverAnimation, menuPopup),
            className
          )}
          data-slot="menu-popup"
          {...props}
        >
          <DropdownMenuContext.Provider value={indicator ?? "start-box"}>
            <ScrollArea className="max-h-[min(var(--available-height),320px)]">
              <div className="p-1">{children}</div>
            </ScrollArea>
          </DropdownMenuContext.Provider>
        </_MenuPrimitive.Popup>
      </_MenuPrimitive.Positioner>
    </DropdownMenuPortal>
  );
}

export function DropdownMenuGroup(
  props: _MenuPrimitive.Group.Props
): ReactElement {
  return <_MenuPrimitive.Group data-slot="menu-group" {...props} />;
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: _MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: NonNullable<VariantProps<typeof menuItemVariants>["variant"]>;
}): ReactElement {
  return (
    <_MenuPrimitive.Item
      className={cn(menuItemVariants({ variant }), className)}
      data-inset={inset}
      data-slot="menu-item"
      data-variant={variant}
      {...props}
    />
  );
}

// ============================================================
// Checkable items (CheckboxItem + RadioItem share the same CVA)
// ============================================================

function MenuSwitchThumb(): ReactElement {
  return (
    <_MenuPrimitive.CheckboxItemIndicator
      className={menuSwitchIndicator}
      keepMounted
    >
      <MenuThumbSpan />
    </_MenuPrimitive.CheckboxItemIndicator>
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  indicator: indicatorProp,
  ...props
}: _MenuPrimitive.CheckboxItem.Props & {
  /**
   * - `start`     — reserved space on the left, check appears when checked
   * - `start-box` (default) — always-visible box on the left, fills with primary when checked
   * - `end`       — check icon on the right
   * - `none`      — no indicator; bg + color signal checked state
   * - `switch`    — toggle switch on the right
   */
  indicator?: DropdownMenuIndicator | undefined;
}): ReactElement {
  const ctxIndicator = useContext(DropdownMenuContext);
  const indicator = indicatorProp ?? ctxIndicator;
  return (
    <_MenuPrimitive.CheckboxItem
      checked={checked}
      className={cn(checkableItemVariants({ indicator }), className)}
      data-slot="menu-checkbox-item"
      {...props}
    >
      {indicator === "none" && children}

      {indicator === "start" && (
        <>
          <_MenuPrimitive.CheckboxItemIndicator className="col-start-1 -ms-0.5">
            <ListCheckIcon />
          </_MenuPrimitive.CheckboxItemIndicator>
          <span className={cn("col-start-2", listItemContent)}>{children}</span>
        </>
      )}

      {indicator === "start-box" && (
        <>
          <span className={cn("col-start-1", listItemMarker)}>
            {/* oxlint-disable-next-line shadcn/no-restyle -- the check icon inherits the item color instead of its own */}
            <ListCheckIcon className="size-4 text-current" />
          </span>
          <span className={cn("col-start-2", listItemContent)}>{children}</span>
        </>
      )}

      {indicator === "end" && (
        <>
          <span className={cn("col-start-1", listItemContent)}>{children}</span>
          <_MenuPrimitive.CheckboxItemIndicator className="col-start-2 -me-0.5">
            <ListCheckIcon />
          </_MenuPrimitive.CheckboxItemIndicator>
        </>
      )}

      {indicator === "switch" && (
        <>
          <span className={cn("col-start-1", listItemContent)}>{children}</span>
          <MenuSwitchThumb />
        </>
      )}
    </_MenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuRadioGroup(
  props: _MenuPrimitive.RadioGroup.Props
): ReactElement {
  return <_MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />;
}

export function DropdownMenuRadioItem({
  className,
  children,
  indicator: indicatorProp,
  ...props
}: _MenuPrimitive.RadioItem.Props & {
  indicator?: RadioIndicator;
}): ReactElement {
  const ctxIndicator = useContext(DropdownMenuContext);
  const resolved = indicatorProp ?? ctxIndicator;
  // Radio items don't support "switch" or "start-box"; fall back to "start".
  const indicator: RadioIndicator =
    resolved === "switch" || resolved === "start-box" ? "start" : resolved;
  return (
    <_MenuPrimitive.RadioItem
      className={cn(checkableItemVariants({ indicator }), className)}
      data-slot="menu-radio-item"
      {...props}
    >
      {indicator === "none" && children}

      {indicator === "start" && (
        <>
          <_MenuPrimitive.RadioItemIndicator className="col-start-1 -ms-0.5">
            <ListCheckIcon />
          </_MenuPrimitive.RadioItemIndicator>
          <span className={cn("col-start-2", listItemContent)}>{children}</span>
        </>
      )}

      {indicator === "end" && (
        <>
          <span className={cn("col-start-1", listItemContent)}>{children}</span>
          <_MenuPrimitive.RadioItemIndicator className="col-start-2 -me-0.5">
            <ListCheckIcon />
          </_MenuPrimitive.RadioItemIndicator>
        </>
      )}
    </_MenuPrimitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: _MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}): ReactElement {
  return (
    <_MenuPrimitive.GroupLabel
      className={cn(menuLabel, className)}
      data-inset={inset}
      data-slot="menu-label"
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: _MenuPrimitive.Separator.Props): ReactElement {
  return (
    <_MenuPrimitive.Separator
      className={cn(listSeparator, className)}
      data-slot="menu-separator"
      {...props}
    />
  );
}

export function DropdownMenuShortcut({
  className,
  ...props
}: ComponentProps<"kbd">): ReactElement {
  return (
    <kbd
      className={cn(menuShortcut, className)}
      data-slot="menu-shortcut"
      {...props}
    />
  );
}

export function DropdownMenuSub(
  props: _MenuPrimitive.SubmenuRoot.Props
): ReactElement {
  return <_MenuPrimitive.SubmenuRoot data-slot="menu-sub" {...props} />;
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: _MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}): ReactElement {
  return (
    <_MenuPrimitive.SubmenuTrigger
      className={cn(menuSubTrigger, className)}
      data-inset={inset}
      data-slot="menu-sub-trigger"
      {...props}
    >
      {children}
      <CaretRightIcon className="ms-auto -me-0.5 opacity-80" />
    </_MenuPrimitive.SubmenuTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  indicator,
  sideOffset = 0,
  alignOffset,
  align = "start",
  ...props
}: _MenuPrimitive.Popup.Props & {
  indicator?: DropdownMenuIndicator | undefined;
  align?: _MenuPrimitive.Positioner.Props["align"];
  sideOffset?: _MenuPrimitive.Positioner.Props["sideOffset"];
  alignOffset?: _MenuPrimitive.Positioner.Props["alignOffset"];
}): ReactElement {
  const defaultAlignOffset = align === "center" ? undefined : -5;

  return (
    <DropdownMenuContent
      align={align}
      alignOffset={alignOffset ?? defaultAlignOffset}
      className={className}
      data-slot="menu-sub-content"
      indicator={indicator}
      side="inline-end"
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export const DropdownMenuPrimitive = _MenuPrimitive;
