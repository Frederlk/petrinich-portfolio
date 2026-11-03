import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { profile } from "~/lib/content";
import { siteUrl } from "~/lib/site-url";
import { keyStats } from "~/lib/stats";
import { bare } from "~/lib/url";

// The social card every page shares (LinkedIn, Telegram, Slack previews): the site's own frame in the DESIGN.md palette, rendered once at build. Satori reads only inline `style` and no woff2, so the styles are inline and the two fonts are static WOFF copies of the site's families in assets/og.
// oxlint-disable shadcn/no-inline-styles

export const alt = `${profile.name}, ${profile.title}`;
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

const SURFACE = "#131313";
const HAIRLINE = "#2a2a2a";
const ON_SURFACE = "#e5e2e1";
const SECONDARY = "#c6c6c7";
const VERMILION = "#ff5626";

// The section marker of the site's labels.
const MARKER = "//";

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

export default async function OpengraphImage() {
  const { display: displayB64, icon, mono: monoB64 } = await assets();
  const display = Buffer.from(displayB64, "base64");
  const mono = Buffer.from(monoB64, "base64");
  const logo = `data:image/svg+xml;base64,${icon}`;
  const label = {
    color: SECONDARY,
    fontFamily: "Mono",
    fontSize: 20,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } as const;

  return new ImageResponse(
    <div
      style={{
        background: SURFACE,
        display: "flex",
        height: "100%",
        padding: 48,
        width: "100%",
      }}
    >
      <div
        style={{
          border: `1px solid ${HAIRLINE}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div style={{ ...label, display: "flex", gap: 16 }}>
            <span style={{ color: VERMILION }}>{MARKER}</span>
            <span>{bare(siteUrl)}</span>
          </div>
          {/* oxlint-disable-next-line nextjs/no-img-element */}
          <img alt="" height={64} src={logo} width={64} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              color: ON_SURFACE,
              display: "flex",
              fontFamily: "Display",
              fontSize: 112,
              letterSpacing: "-0.01em",
              lineHeight: 0.9,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            <span>{profile.name}</span>
            <span style={{ color: VERMILION }}>.</span>
          </div>
          <div
            style={{
              color: SECONDARY,
              fontFamily: "Display",
              fontSize: 44,
              textTransform: "uppercase",
            }}
          >
            {profile.title}
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${HAIRLINE}`,
            display: "flex",
            paddingTop: 24,
          }}
        >
          {keyStats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                borderLeft: i === 0 ? "none" : `1px solid ${HAIRLINE}`,
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: 8,
                paddingLeft: i === 0 ? 0 : 24,
              }}
            >
              <span
                style={{
                  color: VERMILION,
                  fontFamily: "Display",
                  fontSize: 56,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span style={{ ...label, fontSize: 16, whiteSpace: "nowrap" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { data: display, name: "Display", style: "normal", weight: 700 },
        { data: mono, name: "Mono", style: "normal", weight: 500 },
      ],
    }
  );
}
