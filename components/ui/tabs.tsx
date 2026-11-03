"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

export function Tabs(props: TabsPrimitive.Root.Props): ReactElement {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

// The vermilion fill is Base UI's indicator, positioned from the list's own `--active-tab-*` vars, not a Motion `layoutId`: Motion measured it against the page, so under the sticky toolbar a filter that moved the scroll flew it in from thousands of px away. `renderBeforeHydration` keeps it in the server HTML.
export function TabsList({
  children,
  className,
  ...props
}: TabsPrimitive.List.Props): ReactElement {
  return (
    <TabsPrimitive.List
      className={cn("relative isolate flex items-stretch", className)}
      data-slot="tabs-list"
      {...props}
    >
      <TabsPrimitive.Indicator
        className="absolute inset-y-0 left-(--active-tab-left) -z-10 w-(--active-tab-width) bg-primary-container transition-[left,width] duration-300 ease-(--ease-move)"
        renderBeforeHydration
      />
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTab({
  className,
  ...props
}: TabsPrimitive.Tab.Props): ReactElement {
  return (
    <TabsPrimitive.Tab
      className={cn(
        // Layout & Size
        "group relative flex h-full cursor-pointer items-center gap-2 border-surface-container-high px-space-md not-last:border-r",
        // Typography
        "type-button whitespace-nowrap select-none",
        // Colors
        "text-secondary transition-colors duration-200 hover:bg-surface-container hover:text-on-surface",
        "data-active:text-on-primary-container data-active:transition-none data-active:hover:bg-transparent data-active:hover:text-on-primary-container",
        // Focus state
        "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className
      )}
      data-slot="tabs-tab"
      {...props}
    />
  );
}
