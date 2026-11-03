import { SpinnerIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "~/lib/cn";

import type { ComponentProps, ReactElement } from "react";

export function Spinner({
  className,
  ...props
}: ComponentProps<typeof SpinnerIcon>): ReactElement {
  return (
    <SpinnerIcon
      aria-label="Loading"
      className={cn("animate-spin motion-reduce:animate-none", className)}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- the host is an SVG icon; no HTML tag replaces role="status" on an <svg>
      role="status"
      {...props}
    />
  );
}
