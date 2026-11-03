"use client";

import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "~/lib/cn";

import type { ReactElement } from "react";

// Bare text field: the cell around it (border, background, focus ring) belongs to the caller.
export function Input({
  className,
  ...props
}: InputPrimitive.Props): ReactElement {
  return (
    <InputPrimitive
      className={cn(
        "w-full bg-transparent type-button text-on-surface outline-none placeholder:text-tertiary-container",
        className
      )}
      data-slot="input"
      {...props}
    />
  );
}
