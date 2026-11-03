"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, navTransition } from "~/components/layout/nav-items";

import { cn } from "~/lib/cn";

// The desktop links of the header. The current section gets the vermilion underline; "Experience" is a hash link on the home page and is never current. Every link carries the 1px bottom border (transparent unless current), so the static fallback below and the hydrated links have the same height.
export function NavLinkList({ pathname }: { pathname: string | null }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const current =
          pathname !== null &&
          !item.href.includes("#") &&
          pathname.startsWith(item.href);
        return (
          <Link
            aria-current={current ? "page" : undefined}
            className={cn(
              "border-b link-draw py-space-xs type-button",
              current
                ? "border-primary-container text-on-surface"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
            href={item.href}
            key={item.href}
            transitionTypes={navTransition(pathname, item.href)}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

// `usePathname` is request data under Cache Components with partial prefetching, so the header renders this inside <Suspense> with `<NavLinkList pathname={null} />` as the static fallback.
export function NavLinks() {
  return <NavLinkList pathname={usePathname()} />;
}
