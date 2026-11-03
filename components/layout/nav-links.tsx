"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, navTransition } from "~/components/layout/nav-items";

import { cn } from "~/lib/cn";

// The desktop links of the header. The current section keeps the hover underline, in vermilion; "Experience" is a hash link on the home page and is never current.
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
              "py-space-xs type-button link-draw",
              current
                ? "text-on-surface decoration-primary-container!"
                : "text-on-surface-variant hover:text-on-surface"
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
