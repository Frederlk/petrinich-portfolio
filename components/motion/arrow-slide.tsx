import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "~/lib/cn";

// An arrow that slides in its own direction while a `group` ancestor is hovered or focused. CSS only (see `.arrow-slide` in globals.css), so server components use it.
export function ArrowSlide({
  back = false,
  className,
}: {
  back?: boolean;
  className?: string;
}) {
  const Icon = back ? ArrowLeftIcon : ArrowRightIcon;
  return (
    <Icon
      aria-hidden
      className={cn(
        "inline-block size-4 align-text-bottom",
        back ? "arrow-slide-back mr-space-xs" : "arrow-slide ml-space-xs",
        className
      )}
    />
  );
}
