import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/cn";

import type { ComponentProps, ReactElement } from "react";

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-transparent",
        error:
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive [&_svg:not([class*='size-'])]:size-6",
        icon: cn(
          // Layout & Size
          "relative flex size-9 shrink-0 items-center justify-center",
          // Shape & Border
          "rounded-md border bg-card shadow-sm",
          // Typography
          "text-foreground",
          // Pseudo-elements
          "before:pointer-events-none before:absolute before:inset-0",
          "surface-glow before:rounded-inset-md",
          // Child selectors
          "[&_svg:not([class*='size-'])]:size-4.5",
          // Theme variants
          "not-dark:bg-clip-padding"
        ),
        success:
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success [&_svg:not([class*='size-'])]:size-6",
        warning:
          "flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning [&_svg:not([class*='size-'])]:size-6",
      },
    },
  }
);

export function Empty({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn(
        // Layout & Size
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6",
        // Typography
        "text-center text-balance",
        className
      )}
      data-slot="empty"
      {...props}
    />
  );
}

export function EmptyHeader({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      data-slot="empty-header"
      {...props}
    />
  );
}

export function EmptyMedia({
  className,
  variant = "default",
  ...props
}: ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants>): ReactElement {
  return (
    <div
      className={cn("relative mb-2", className)}
      data-slot="empty-media"
      data-variant={variant}
      {...props}
    >
      {variant === "icon" && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              emptyMediaVariants({ className, variant }),
              "pointer-events-none absolute bottom-px origin-bottom-left -translate-x-0.5 scale-84 -rotate-10 shadow-none"
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              emptyMediaVariants({ className, variant }),
              "pointer-events-none absolute bottom-px origin-bottom-right translate-x-0.5 scale-84 rotate-10 shadow-none"
            )}
          />
        </>
      )}
      <div
        className={cn(emptyMediaVariants({ className, variant }))}
        {...props}
      />
    </div>
  );
}

export function EmptyTitle({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn("type-h3", className)}
      data-slot="empty-title"
      {...props}
    />
  );
}

export function EmptyDescription({
  className,
  ...props
}: ComponentProps<"p">): ReactElement {
  return (
    <div
      className={cn(
        "type-body-sm text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary [[data-slot=empty-title]+&]:mt-1",
        className
      )}
      data-slot="empty-description"
      {...props}
    />
  );
}

export function EmptyContent({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 type-body-sm",
        className
      )}
      data-slot="empty-content"
      {...props}
    />
  );
}
