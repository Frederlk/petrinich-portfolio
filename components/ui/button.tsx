"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import {
  type ButtonHTMLAttributes,
  Children,
  Fragment,
  type FragmentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  touchTarget,
  triggerIcons,
  triggerIconsDim,
  triggerIconsStatic,
} from "~/ui/config/interaction";
import { Spinner } from "~/ui/spinner";

import { cn } from "~/lib/cn";

export const buttonVariants = cva(
  cn(
    // Layout & Size
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5",
    // Shape & Border
    "rounded-lg border outline-none",
    // Typography
    "type-button whitespace-nowrap",
    // Transitions
    "transition-[background-color,border-color,color,opacity]",
    // Pseudo-elements
    "before:pointer-events-none before:absolute before:inset-0",
    "before:rounded-inset-lg",
    // Pointer/Touch
    touchTarget,
    // Focus state
    "focus-visible:focus-ring",
    // Error state (form-bound triggers — date, color, file, etc.)
    "aria-invalid:error-state",
    // Disabled state (covers native :disabled + aria-disabled for non-button renders like <a>)
    "disabled:disabled-state",
    "aria-disabled:disabled-state",
    // Active state
    "active:not-aria-[haspopup]:translate-y-px",
    // Data variants
    "data-loading:select-none data-[loading=overlay]:text-transparent",
    // Child selectors
    triggerIcons,
    triggerIconsStatic,
    triggerIconsDim,
    // Icon-only auto-detection
    "has-[>svg:only-child]:aspect-square has-[>svg:only-child]:gap-0 has-[>svg:only-child]:px-0"
  ),
  {
    compoundVariants: [
      {
        class: cn(
          // Strip hover/pressed bg — bare variant has no chrome to toggle
          "hover:bg-transparent data-pressed:bg-transparent",
          // Icon-only feedback: destructive color with smooth transition
          "[&_svg]:transition-colors",
          "hover:[&_svg]:text-destructive data-pressed:[&_svg]:text-destructive"
        ),
        size: "icon-bare",
        variant: "ghost",
      },
    ],
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default:
          "h-field-md px-inset-3 has-[>svg:first-child:not(:only-child)]:pl-inset-2.5 has-[>svg:last-child:not(:only-child)]:pr-inset-2.5 sm:h-field-sm",
        "icon-bare": cn(
          // Strip chrome — no border, no shadow, no pseudo, no gap
          "gap-0 rounded-none border-0 shadow-none! inset-shadow-none!",
          "before:hidden",
          // Icon hugs edges
          "[&_svg]:mx-0"
        ),
        lg: "h-field-lg px-inset-3.5 has-[>svg:first-child:not(:only-child)]:pl-inset-3 has-[>svg:last-child:not(:only-child)]:pr-inset-3 sm:h-field-md",
        sm: "h-field-sm gap-1.5 px-inset-2.5 has-[>svg:first-child:not(:only-child)]:pl-inset-2 has-[>svg:last-child:not(:only-child)]:pr-inset-2 sm:h-field-xs",
        xl: cn(
          // Layout & Size
          "h-11 px-inset-4 has-[>svg:first-child:not(:only-child)]:pl-inset-3.5 has-[>svg:last-child:not(:only-child)]:pr-inset-3.5",
          // Child selectors
          "[&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
          // Responsive
          "sm:h-10"
        ),
        xs: cn(
          // Layout & Size
          "h-field-xs gap-1 px-inset-2 has-[>svg:first-child:not(:only-child)]:pl-inset-1.5 has-[>svg:last-child:not(:only-child)]:pr-inset-1.5",
          // Shape & Border
          "rounded-md",
          // Pseudo-elements
          "before:rounded-inset-md",
          // Child selectors
          "[&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
          // Responsive
          "sm:h-6"
        ),
      },
      variant: {
        default: cn(
          // Shape & Border
          "border-primary bg-primary",
          // Typography
          "text-primary-foreground",
          // Hover state
          "hover:bg-primary/80",
          // Active state
          "data-pressed:bg-primary/80",
          // Child selectors
          "*:data-[slot=button-loading-indicator]:text-primary-foreground"
        ),
        destructive: cn(
          // Shape & Border
          "border-destructive bg-destructive shadow-xs",
          // Typography
          "text-destructive-on-fill",
          // Hover state
          "hover:bg-destructive/80",
          // Active state
          "data-pressed:bg-destructive/80",
          // Focus state
          "focus-visible:focus-ring",
          // Disabled state
          "not-disabled:inset-shadow-(--inset-shadow-rim)",
          // Child selectors
          "*:data-[slot=button-loading-indicator]:text-destructive-on-fill",
          // Compound selectors
          "[:active,[data-pressed]]:inset-shadow-(--inset-shadow-press)",
          "[:disabled,:active,[data-pressed]]:shadow-none"
        ),
        "destructive-outline": cn(
          // Shape & Border
          "border-input bg-popover",
          // Typography
          "text-destructive-foreground",
          // Pseudo-elements
          "not-disabled:not-active:not-data-pressed:surface-glow",
          // Hover state
          "hover:border-destructive/50 hover:bg-background/90",
          // Active state
          "data-pressed:border-destructive/50",
          // Focus state
          "focus-visible:focus-ring",
          // Child selectors
          "*:data-[slot=button-loading-indicator]:text-foreground",
          // Theme variants
          "not-dark:bg-clip-padding",
          // Compound selectors
          "[:disabled,:active,[data-pressed]]:shadow-none"
        ),
        ghost:
          "border-transparent text-foreground hover:bg-accent data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        link: "border-transparent text-foreground underline-offset-4 hover:underline data-pressed:underline *:data-[slot=button-loading-indicator]:text-foreground",
        outline: cn(
          // Shape & Border
          "border-muted-foreground bg-transparent",
          // Typography
          "text-foreground",
          // Hover state
          "hover:border-primary hover:text-primary",
          // Active state
          "data-pressed:border-primary data-pressed:text-primary",
          // Child selectors
          "*:data-[slot=button-loading-indicator]:text-foreground"
        ),
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-input data-pressed:bg-input *:data-[slot=button-loading-indicator]:text-secondary-foreground [:active,[data-pressed]]:bg-input",
        // Low-chrome trigger for dropdown/popover anchors (column headers,
        // toolbar dropdowns, etc.). Stays highlighted while its popup is open
        // via Base UI's `data-popup-open`. Bundles sizing/shape so callers
        // don't need to override h-8/rounded-md/icon color by hand.
        trigger: cn(
          // Layout & Size — compact, fixed h-field-sm across breakpoints
          "h-field-sm gap-1.5 px-inset-2! sm:h-field-sm",
          // Shape & Border — tighter radius than default
          "rounded-md border-transparent",
          // Pseudo-elements — match rounded-md
          "before:rounded-inset-md",
          // Typography
          "text-foreground",
          // Hover / pressed / popup-open
          "hover:bg-accent data-popup-open:bg-accent data-pressed:bg-accent",
          // Child selectors — icons dim to muted-foreground at size-4
          "[&_svg:not([class*='text-'])]:text-muted-foreground",
          "[&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-4",
          // Loading indicator
          "*:data-[slot=button-loading-indicator]:text-foreground"
        ),
      },
    },
  }
);

// An element whose type is `Fragment` carries `Fragment`'s own props.
function isFragment(node: ReactNode): node is ReactElement<FragmentProps> {
  return isValidElement(node) && node.type === Fragment;
}

function flattenFragments(
  children: ReactNode
): ReturnType<typeof Children.toArray> {
  // oxlint-disable-next-line react/no-react-children -- children is an opaque caller prop; the Children API is the only way to count/filter/wrap its items
  return Children.toArray(children).flatMap((child) => {
    if (isFragment(child)) {
      return flattenFragments(child.props.children);
    }
    return [child];
  });
}

function processChildren(
  children: ReactNode,
  loading: boolean
): { nodes: ReactNode; hasInlineSpinner: boolean } {
  const array = flattenFragments(children);
  const iconIdx = loading ? array.findIndex(isValidElement) : -1;

  const nodes = array.map((child, i): ReactNode => {
    if (i === iconIdx) {
      return (
        <Spinner
          data-slot="button-loading-indicator"
          // oxlint-disable-next-line react/no-array-index-key -- keys that Children.toArray assigns repeat across flattened fragments, so the position is the only identity
          key={`button-spinner-${i}`}
        />
      );
    }
    if (typeof child === "string" || typeof child === "number") {
      // oxlint-disable-next-line react/no-array-index-key -- a string or number child carries no key from Children.toArray, so its position is its only identity
      return <span key={`button-text-${i}`}>{child}</span>;
    }
    if (isValidElement(child)) {
      // oxlint-disable-next-line react/no-array-index-key -- keys that Children.toArray assigns repeat across flattened fragments, so the position is the only identity
      return <Fragment key={`button-child-${i}`}>{child}</Fragment>;
    }
    return child;
  });

  return { hasInlineSpinner: iconIdx >= 0, nodes };
}

export interface ButtonProps extends useRender.ComponentProps<"button"> {
  loading?: boolean;
  size?: VariantProps<typeof buttonVariants>["size"];
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  ...props
}: ButtonProps): ReactElement {
  const isDisabled = Boolean(loading || disabledProp);
  const typeValue: ButtonHTMLAttributes<HTMLButtonElement>["type"] = render
    ? undefined
    : "button";

  const { nodes, hasInlineSpinner } = processChildren(children, loading);
  const loadingMode: "inline" | "overlay" | undefined = loading
    ? hasInlineSpinner
      ? "inline"
      : "overlay"
    : undefined;

  const defaultProps = {
    "aria-disabled": isDisabled || undefined,
    children: (
      <>
        {nodes}
        {loading && !hasInlineSpinner && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(buttonVariants({ className, size, variant })),
    "data-loading": loadingMode,
    "data-slot": "button",
    disabled: isDisabled,
    tabIndex: isDisabled ? -1 : undefined,
    type: typeValue,
  };

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });
}
