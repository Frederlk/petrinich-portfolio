import { ctaLinkVariants } from "~/ui/cta-link";

import { cn } from "~/lib/cn";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

// The call-to-action rectangle of `CtaLink` on a `<button>`, for an action that does not navigate (the error page's "Try again"). `Button` is the UI kit's rounded control and does not carry this look.
export function CtaButton({
  className,
  size,
  variant,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof ctaLinkVariants>) {
  return (
    <button
      className={cn(ctaLinkVariants({ size, variant }), className)}
      type="button"
      {...props}
    />
  );
}
