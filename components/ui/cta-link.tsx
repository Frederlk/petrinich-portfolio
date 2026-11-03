import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "~/lib/cn";

import type { ComponentProps } from "react";

// The call-to-action rectangles of the Stitch screens. Square, mono at 13px. Filled and boxed variants sweep their fill in on hover, the text-only ones draw an underline; both press in slightly.
export const ctaLinkVariants = cva(
  "group press flex items-center justify-center",
  {
    defaultVariants: { size: "md", variant: "primary" },
    variants: {
      size: {
        none: "",
        lg: "px-space-lg py-space-sm",
        md: "px-space-md py-space-sm",
        tall: "px-space-xl py-space-md",
        xl: "px-space-xl py-space-sm",
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
          "fill-sweep bg-primary-container type-button text-on-primary-container sweep-primary hover:text-on-primary",
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
