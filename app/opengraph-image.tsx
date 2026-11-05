import { ImageResponse } from "next/og";

import { profile } from "~/lib/content";
import { MARKER, OG, OG_SIZE, ogAssets, ogLabel as label } from "~/lib/og";
import { siteUrl } from "~/lib/site-url";
import { keyStats } from "~/lib/stats";
import { bare } from "~/lib/url";

// The social card of every page without its own (LinkedIn, Telegram, Slack previews), rendered once at build; each /work page has its own in work/[slug].
// oxlint-disable shadcn/no-inline-styles

export const alt = `${profile.name}, ${profile.title}`;
export const size = OG_SIZE;
export const contentType = "image/png";

const SURFACE = OG.surface;
const HAIRLINE = OG.hairline;
const ON_SURFACE = OG.onSurface;
const SECONDARY = OG.secondary;
const VERMILION = OG.vermilion;

export default async function OpengraphImage() {
  const { fonts, logo } = await ogAssets();

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
    { ...size, fonts: [...fonts] }
  );
}
