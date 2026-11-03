"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GIVE_UP_MS = 15_000;

// A thin vermilion bar across the top of the viewport from the click on an internal link until the new page is in place. Next has no navigation events, so the click is caught in the capture phase (before the Link handler calls preventDefault) and the bar ends when `usePathname` changes. A link to the same path (a filter, a hash) is not a navigation and is ignored; a timer ends a bar whose click never navigated. The bar fades in only after 300 ms: every page is static and prefetched, so a fast navigation shows nothing and only a slow one shows the bar.
export function NavigationProgress() {
  const pathname = usePathname();
  const [leaving, setLeaving] = useState<string | null>(null);
  const [seen, setSeen] = useState(pathname);

  // The path changed: the page the click was heading to has arrived.
  if (seen !== pathname) {
    setSeen(pathname);
    setLeaving(null);
  }

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (
        !(link instanceof HTMLAnchorElement) ||
        (link.target !== "" && link.target !== "_self") ||
        link.hasAttribute("download")
      ) {
        return;
      }
      const url = new URL(link.href);
      if (
        url.origin === window.location.origin &&
        url.pathname !== window.location.pathname
      ) {
        setLeaving(window.location.pathname);
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (leaving === null) {
      return () => {};
    }
    const timer = setTimeout(() => {
      setLeaving(null);
    }, GIVE_UP_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [leaving]);

  return leaving === null ? null : (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 overflow-hidden transition-opacity delay-300 duration-150 starting:opacity-0 print:hidden"
    >
      <div className="h-full w-1/3 animate-progress-sweep bg-primary-container motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  );
}
