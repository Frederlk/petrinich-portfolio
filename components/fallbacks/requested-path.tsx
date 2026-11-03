"use client";

import { useSyncExternalStore } from "react";

import { TextScramble } from "~/components/motion/text-scramble";

// The path never changes while the 404 page is mounted, so there is nothing to subscribe to.
const subscribe = () => () => {};

// The 404 page is prerendered once for every missing URL, so the path is read on the client only; the empty server snapshot keeps hydration matching. The key remounts the scramble when the path arrives, so it plays on the real text.
export function RequestedPath() {
  const path = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => ""
  );
  return <TextScramble key={path} text={path} />;
}
