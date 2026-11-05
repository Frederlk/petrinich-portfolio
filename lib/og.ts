import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The social cards (the site's one and each /work page's) share the site's frame in the DESIGN.md palette. Satori reads only inline `style` and no woff2, so the styles are inline and the two fonts are static WOFF copies of the site's families in assets/og.

export const OG_SIZE = { height: 630, width: 1200 };

export const OG = {
  hairline: "#2a2a2a",
  onSurface: "#e5e2e1",
  secondary: "#c6c6c7",
  surface: "#131313",
  vermilion: "#ff5626",
} as const;

// The section marker of the site's labels.
export const MARKER = "//";

// The two fonts and the logo as base64. Cached, because under Cache Components a plain file read is uncached data and would render the card on every request instead of once at build. Each path is a literal, so the build traces these three files and not the whole project.
async function assets() {
  "use cache";
  const [display, mono, icon] = await Promise.all([
    readFile(join(process.cwd(), "assets/og/archivo-narrow-700.woff")),
    readFile(join(process.cwd(), "assets/og/jetbrains-mono-500.woff")),
    readFile(join(process.cwd(), "app/icon.svg")),
  ]);
  return {
    display: display.toString("base64"),
    icon: icon.toString("base64"),
    mono: mono.toString("base64"),
  };
}

export async function ogAssets() {
  const { display, icon, mono } = await assets();
  return {
    fonts: [
      {
        data: Buffer.from(display, "base64"),
        name: "Display",
        style: "normal",
        weight: 700,
      },
      {
        data: Buffer.from(mono, "base64"),
        name: "Mono",
        style: "normal",
        weight: 500,
      },
    ] as const,
    logo: `data:image/svg+xml;base64,${icon}`,
  };
}

export const ogLabel = {
  color: OG.secondary,
  fontFamily: "Mono",
  fontSize: 20,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
} as const;
