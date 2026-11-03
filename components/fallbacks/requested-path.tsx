"use client";

import { useSyncExternalStore } from "react";

// The path never changes while the 404 page is mounted, so there is nothing to subscribe to.
const subscribe = () => () => {};

// The 404 page is prerendered once for every missing URL, so the path is read on the client only; the empty server snapshot keeps hydration matching.
export function RequestedPath() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => ""
  );
}
