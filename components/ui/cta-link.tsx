import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "~/lib/cn";

import type { ComponentProps } from "react";

// The call-to-action rectangles of the Stitch screens. Square, mono at 13px. Filled and boxed variants sweep their fill in on hover, the text-only ones draw an underline; both press in slightly.
// A button with an icon keeps 8px between icon and label and pads the icon side 4px less than the text side (Material's icon-button rule), so the label, not the box, looks centred. The `has-[>svg…]` selectors need the label in its own element: a bare text node is invisible to `:first-child`, so the icon would count as `:only-child`.
export const ctaLinkVariants = cva(
  "group press flex items-center justify-center gap-space-sm",
  {
    defaultVariants: { size: "md", variant: "primary" },
    variants: {
      size: {
        none: "",
        lg: "px-space-lg py-space-sm has-[>svg:first-child:not(:only-child)]:pl-5 has-[>svg:last-child:not(:only-child)]:pr-5",
        md: "px-space-md py-space-sm has-[>svg:first-child:not(:only-child)]:pl-3 has-[>svg:last-child:not(:only-child)]:pr-3",
        tall: "px-space-xl py-space-md has-[>svg:first-child:not(:only-child)]:pl-9 has-[>svg:last-child:not(:only-child)]:pr-9",
        xl: "px-space-xl py-space-sm has-[>svg:first-child:not(:only-child)]:pl-9 has-[>svg:last-child:not(:only-child)]:pr-9",
      },
      variant: {
        accent:
          "fill-sweep border border-primary-container type-button text-primary-container sweep-primary-container hover:text-on-primary-container",
        outline:
          "fill-sweep border border-on-surface bg-transparent type-button text-on-surface sweep-on-surface hover:text-surface",
        // The orange download link of a channel list: caps, underline draws in.
        download: "justify-end link-draw type-button text-primary-container",
        // A plain text link on the right of a channel row: no box, no caps.
        channel:
          "justify-end link-draw type-code break-all text-on-surface hover:text-primary-container",
        // A plain text link in a footer list: no box, no caps.
        text: "justify-start link-draw type-code text-on-surface-variant hover:text-primary",
        primary:
          "fill-sweep bg-primary-container type-button text-on-primary-container sweep-on-surface hover:text-surface",
      },
    },
  }
);

type Props = ComponentProps<typeof Link> & VariantProps<typeof ctaLinkVariants>;

export function CtaLink({ className, size, variant, ...props }: Props) {
  return (
    <Link
      className={cn(ctaLinkVariants({ size, variant }), className)}
      {...props}
    />
  );
}
