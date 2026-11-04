"use client";

import { useLayoutEffect } from "react";

// Feeds the `home` variant in globals.css. After a client navigation away, Next keeps the home page mounted in a hidden Activity, so its `main[data-home]` stays in the DOM; hiding runs this cleanup, which marks `<html data-away>`, and showing the page again clears it. A layout effect, so the mark changes in the same commit as the route and the logo-to-name view transition sees it. Matching the Activity's inline `display: none` in CSS instead made every inline-style write re-check `:has()` over the whole page: 85 ms more before the /work drawer moved.
export function HomeMarker() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    delete html.dataset.away;
    return () => {
      html.dataset.away = "";
    };
  }, []);
  return null;
}
