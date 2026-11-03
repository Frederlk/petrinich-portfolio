import { Archivo_Narrow, JetBrains_Mono } from "next/font/google";

import { cn } from "~/lib/cn";

// The two families of the Stitch export. Archivo Narrow is a variable font (wght 400 to 700, so the design's weight 800 renders at 700, as it does in the reference); the mono loads the three static weights the reference requests. The variable names are bound in `@theme` in globals.css.
const ARCHIVO_NARROW = Archivo_Narrow({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-archivo-narrow",
});

const JETBRAINS_MONO = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
});

export const FONT_FAMILY = cn(ARCHIVO_NARROW.variable, JETBRAINS_MONO.variable);
