"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

export function Tabs(props: TabsPrimitive.Root.Props): ReactElement {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

// The vermilion fill is Base UI's indicator, positioned from the list's own `--active-tab-*` vars, not a Motion `layoutId`: Motion measured it against the page, so under the sticky toolbar a filter that moved the scroll flew it in from thousands of px away. `renderBeforeHydration` keeps it in the server HTML. It is placed by its left and right edges, so `.tab-indicator` (styles/motion.css) can move each edge on its own timing and the fill stretches between tabs; a label changes colour 150ms late, so it darkens once the fill has reached it and lightens once the fill has left; a hover has no delay.
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
        className="tab-indicator absolute inset-y-0 right-(--active-tab-right) left-(--active-tab-left) -z-10 bg-primary-container"
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
        "text-secondary transition-colors delay-150 duration-200 hover:bg-surface-container hover:text-on-surface hover:delay-0",
        "data-active:text-on-primary-container data-active:hover:bg-transparent data-active:hover:text-on-primary-container data-active:hover:delay-150",
        // Focus state
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-active:focus-visible:outline-on-primary-container",
        className
      )}
      data-slot="tabs-tab"
      {...props}
    />
  );
}
