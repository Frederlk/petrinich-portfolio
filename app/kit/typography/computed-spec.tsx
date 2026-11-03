"use client";

import { useEffect, useRef } from "react";

// sRGB channels of a computed `rgb()` or `rgba()` colour string.
function channels(color: string) {
  return (
    color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number) ?? [0, 0, 0]
  );
}

function luminance(color: string) {
  const [r = 0, g = 0, b = 0] = channels(color).map((c) => {
    const v = c / 255;
    return v <= 4.045e-2 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(foreground: string, background: string) {
  const [hi = 0, lo = 0] = [
    luminance(foreground),
    luminance(background),
  ].toSorted((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// Wraps a sample and writes what the browser resolved for it (family, size, line height, tracking, weight, case) into the line under it, so the kit shows the computed values and not the ones in the stylesheet. DOM writes in an effect, so the page stays a server component around it.
export function ComputedSpec({
  children,
  withContrast = false,
}: {
  children: React.ReactNode;
  withContrast?: boolean;
}) {
  const sample = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = sample.current?.firstElementChild;
    if (!el || !out.current) {
      return;
    }
    const cs = getComputedStyle(el);
    const family = cs.fontFamily.split(",")[0]?.replaceAll('"', "") ?? "";
    const parts = [
      family,
      `${cs.fontSize} / ${cs.lineHeight}`,
      `tracking ${cs.letterSpacing}`,
      `weight ${cs.fontWeight}`,
      cs.textTransform,
    ];
    if (withContrast) {
      const ratio = contrastRatio(
        cs.color,
        getComputedStyle(document.body).backgroundColor
      );
      parts.push(`${ratio.toFixed(2)}:1 on surface`);
    }
    out.current.textContent = parts.join("  ·  ");
  }, [withContrast]);

  return (
    <>
      <div ref={sample}>{children}</div>
      <p className="mt-space-xs type-meta text-tertiary-container" ref={out} />
    </>
  );
}
