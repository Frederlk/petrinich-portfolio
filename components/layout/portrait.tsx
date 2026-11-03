import Image from "next/image";

import { AVATAR_SRC } from "~/lib/avatar";
import { cn } from "~/lib/cn";
import { profile } from "~/lib/content";

type Props = {
  className?: string;
  priority?: boolean | undefined;
  // The rendered width at each breakpoint, so next/image picks the right file.
  sizes: string;
};

// A square photo in a hairline frame. The size comes from `className`, the file from `~/lib/avatar`.
export function Portrait({ className, priority = false, sizes }: Props) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden border border-surface-container-high bg-surface-container-low",
        className
      )}
    >
      <Image
        alt={`Portrait of ${profile.name}`}
        className="object-cover"
        fill
        priority={priority}
        sizes={sizes}
        src={AVATAR_SRC}
      />
    </div>
  );
}
