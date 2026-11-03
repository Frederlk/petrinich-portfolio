import { Skeleton } from "~/ui/skeleton";

const CORE_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] as const;
const GROUP_KEYS = ["a", "b", "c"] as const;
const CHIP_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

// The search field, the core stack cells and a few chip groups as blocks, on the paddings of the real stack view.
export function StackSkeleton() {
  return (
    <div>
      <div className="pt-space-lg">
        <Skeleton className="h-11" />
      </div>
      <div className="pt-space-lg">
        <div className="mb-space-sm">
          <Skeleton className="h-7 w-36" />
        </div>
        <div className="flex flex-wrap gap-px">
          {CORE_KEYS.map((key) => (
            <Skeleton className="h-24 grow basis-36" key={key} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-space-xl pt-space-lg lg:grid-cols-[15rem_1fr]">
        <div className="hidden flex-col gap-space-xs lg:flex">
          {GROUP_KEYS.map((key) => (
            <Skeleton className="h-9" key={key} />
          ))}
        </div>
        <div className="space-y-space-lg pt-space-lg lg:pt-0">
          {GROUP_KEYS.map((group) => (
            <div key={group}>
              <div className="mb-space-sm">
                <Skeleton className="h-7 w-48" />
              </div>
              <div className="flex flex-wrap gap-space-sm">
                {CHIP_KEYS.map((chip) => (
                  <Skeleton className="h-9 w-32" key={chip} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
