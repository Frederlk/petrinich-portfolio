"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "~/lib/cn";

type Point = readonly [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
// The icosahedron (the D20 of the old site's loader and favicon): its 12 vertices are the cyclic permutations of (0, ±1, ±φ), and its 30 edges join the vertices 2 apart.
const VERTICES: Point[] = [-1, 1].flatMap((a) =>
  [-PHI, PHI].flatMap((b): Point[] => [
    [0, a, b],
    [a, b, 0],
    [b, 0, a],
  ])
);
const adjacent = (p: Point, q: Point) =>
  Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) - 2) < 1e-6;
// Each edge carries the two vertices that close its two triangles, so it can tell whether either face points at the viewer.
const EDGES = VERTICES.flatMap((p, i) =>
  VERTICES.flatMap((q, k) => {
    if (k <= i || !adjacent(p, q)) {
      return [];
    }
    const [a = 0, b = 0] = VERTICES.flatMap((r, n) =>
      adjacent(r, p) && adjacent(r, q) ? [n] : []
    );
    return [[i, k, a, b] as const];
  })
);
// One turn about the vertical axis takes as long as the old GIF loop (45 frames of 60 ms); the tilt turns slower so the shape tumbles.
const TURN_MS = 2700;
const TILT_RATIO = 0.37;

// A turn of `yaw` about the vertical axis, then `pitch` about the horizontal one.
function rotate([x, y, z]: Point, yaw: number, pitch: number): Point {
  const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
  const z1 = z * Math.cos(yaw) - x * Math.sin(yaw);
  return [
    x1,
    y * Math.cos(pitch) - z1 * Math.sin(pitch),
    y * Math.sin(pitch) + z1 * Math.cos(pitch),
  ];
}

const round = (n: number) => Math.round(n * 1000) / 1000;

// Orthographic projection with hidden lines removed, like the old GIF: an edge shows while either of its faces points at the viewer. Coordinates are rounded so the server and the browser print the same attribute.
function edgeCoords(yaw: number, pitch: number) {
  const rotated = VERTICES.map((p) => rotate(p, yaw, pitch));
  const depth = (n: number) => rotated[n]?.[2] ?? 0;
  return EDGES.map(([i, k, a, b]) => {
    const [x1 = 0, y1 = 0] = rotated[i] ?? [];
    const [x2 = 0, y2 = 0] = rotated[k] ?? [];
    const front =
      depth(i) + depth(k) + depth(a) > 0 || depth(i) + depth(k) + depth(b) > 0;
    return {
      opacity: front ? 1 : 0,
      x1: round(x1),
      x2: round(x2),
      y1: round(y1),
      y2: round(y2),
    };
  });
}

const START_YAW = 0.4;
const START_PITCH = 0.3;
const START = edgeCoords(START_YAW, START_PITCH);

// A stalled resource must not hold the page behind the splash.
const GIVE_UP_MS = 10_000;

// The old site's loading screen: a wireframe D20 turning on the dark surface until the page has loaded, then a fade. It sits in the root layout, which a client navigation keeps, so it plays only on a full page load. The content under it is in the HTML from the start, so readers and crawlers never wait on it; without JS the `scripting: none` rule in globals.css hides it, and print never shows it. The overlay unmounts after its fade, which stops its animation loop.
export function Splash() {
  const [gone, setGone] = useState(false);
  return gone ? null : (
    <SplashOverlay
      onGone={() => {
        setGone(true);
      }}
    />
  );
}

function SplashOverlay({ onGone }: { onGone: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leave = () => {
      setLeaving(true);
    };
    const timer = setTimeout(leave, GIVE_UP_MS);
    if (document.readyState === "complete") {
      const frame = requestAnimationFrame(leave);
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(frame);
      };
    }
    window.addEventListener("load", leave, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", leave);
    };
  }, []);

  useEffect(() => {
    const lines = svgRef.current?.querySelectorAll("line");
    if (
      lines === undefined ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return () => {};
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const yaw = START_YAW + ((now - start) / TURN_MS) * 2 * Math.PI;
      const pitch = START_PITCH + (yaw - START_YAW) * TILT_RATIO;
      for (const [i, c] of edgeCoords(yaw, pitch).entries()) {
        const line = lines[i];
        line?.setAttribute("x1", String(c.x1));
        line?.setAttribute("y1", String(c.y1));
        line?.setAttribute("x2", String(c.x2));
        line?.setAttribute("y2", String(c.y2));
        line?.setAttribute("opacity", String(c.opacity));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-100 flex items-center justify-center bg-surface transition-opacity duration-500 ease-(--ease-enter) print:hidden",
        leaving && "pointer-events-none opacity-0"
      )}
      data-splash
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget) {
          onGone();
        }
      }}
    >
      <svg
        className="size-72 text-on-surface"
        fill="none"
        ref={svgRef}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1}
        viewBox="-2 -2 4 4"
      >
        {EDGES.map(([i, k], n) => (
          <line
            key={`${i}-${k}`}
            vectorEffect="non-scaling-stroke"
            {...START[n]}
          />
        ))}
      </svg>
    </div>
  );
}
