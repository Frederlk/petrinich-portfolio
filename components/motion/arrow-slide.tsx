import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "~/lib/cn";

// An arrow that slides in its own direction while a `group` ancestor is hovered or focused. CSS only (see `.arrow-slide` in globals.css), so server components use it. `external` is the up-right arrow of a link that opens another site.
export function ArrowSlide({
  back = false,
  className,
  external = false,
}: {
  back?: boolean;
  className?: string;
  external?: boolean;
}) {
  if (back) {
    return (
      <ArrowLeftIcon
        aria-hidden
        className={cn(
          "arrow-slide-back mr-space-xs inline-block size-4 align-text-bottom",
          className
        )}
      />
    );
  }
  const Icon = external ? ArrowUpRightIcon : ArrowRightIcon;
  return (
    <Icon
      aria-hidden
      className={cn(
        "ml-space-xs inline-block size-4 align-text-bottom",
        external ? "arrow-slide-out" : "arrow-slide",
        className
      )}
    />
  );
}
