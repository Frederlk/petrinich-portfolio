import createMDX from "@next/mdx";

import { linkHeader, PAGE_TWINS } from "./lib/site-routes";

import type { NextConfig } from "next";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./env";

const isDev =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENV === "LOCAL";
// The site loads nothing from third parties at runtime: next/font self-hosts the fonts, images are local, there is no media or API. The only external origins are Vercel's preview toolbar (vercel.live, its Pusher socket) so preview comments keep working; production visitors never load them. 'unsafe-inline' stays because Next injects inline bootstrap scripts; the stricter options are SRI (`experimental.sri`) or a nonce via proxy.ts, which would make every page dynamic.
const CSP_HEADER = `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://*.vercel.com https://vercel.live; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://vercel.live; font-src 'self' data: https://vercel.live https://assets.vercel.com; img-src 'self' data: blob: https://vercel.live https://vercel.com${isDev ? " http://localhost:*" : ""}; media-src 'self'; frame-src 'self' https://vercel.live; connect-src 'self' https://vercel.live https://*.vercel.com wss://*.pusher.com${isDev ? " http://localhost:*" : ""};`;

const nextConfig: NextConfig = {
  // ============ Dev Experience ============
  cacheComponents: true,
  cacheLife: {
    reference: {
      expire: 604_800,
      revalidate: 86_400,
      stale: 3600,
    },
  },
  devIndicators: false,
  // Cache Components without it logs a build warning; the router then prefetches each route's static shell.
  partialPrefetching: true,

  // ============ Experimental Features ============
  experimental: {
    optimizePackageImports: [
      "@phosphor-icons/react",
      "date-fns",
      "@base-ui/react",
      "zod",
    ],
    taint: true,
    turbopackFileSystemCacheForDev: true,
  },

  // ============ Security & Cache Headers ============
  headers: () => [
    {
      headers: [
        // Security headers
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Content-Security-Policy", value: CSP_HEADER },
        // HSTS — skipped in dev so localhost over http is not pinned to https
        ...(isDev
          ? []
          : [
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ]),
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
        },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        // Cross-Origin-Embedder-Policy intentionally omitted — even
        // `credentialless` can break cross-origin embeds (e.g. vercel.live
        // preview-comments). Consumers needing crossOriginIsolated should
        // opt in and audit their embeds.
        // DNS prefetch for performance
        { key: "X-DNS-Prefetch-Control", value: "on" },
        // Default cache for dynamic content
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
      source: "/:path*",
    },
    // Cache immutable static assets (Next.js hashed files)
    {
      has: [
        {
          key: "_next",
          type: "query",
        },
      ],
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
      source: "/([^/]+\\.)+(js|css|woff|woff2|png|jpg|jpeg|webp|avif|svg|ico)$",
    },
    // Each page names its Markdown and JSON twins and the llms.txt, the same links as its head. No Vary: Accept, because Next.js replaces Vary on its pages with its own list. Vercel resolves the Accept rewrites before its cache lookup, so it caches the Markdown under the twin's address; a cache in front of Vercel would need Vary.
    ...Object.entries(PAGE_TWINS).map(([source, twins]) => ({
      headers: [{ key: "Link", value: linkHeader(twins) }],
      source,
    })),
    {
      headers: [
        { key: "Link", value: linkHeader({ markdown: "/work/:slug.md" }) },
      ],
      source: "/work/:slug([a-z0-9-]+)",
    },
  ],
  // An agent that asks for Markdown (Claude's web fetch sends Accept: text/markdown) gets the page's Markdown twin at the same address. beforeFiles, because the pages themselves would otherwise answer first.
  rewrites: () => {
    const wantsMarkdown = [
      { key: "accept", type: "header" as const, value: ".*text/markdown.*" },
    ];
    return {
      afterFiles: [{ destination: "/work/:slug/md", source: "/work/:slug.md" }],
      beforeFiles: [
        ...Object.entries(PAGE_TWINS).map(([source, twins]) => ({
          destination: twins.markdown,
          has: wantsMarkdown,
          source,
        })),
        {
          destination: "/work/:slug/md",
          has: wantsMarkdown,
          source: "/work/:slug([a-z0-9-]+)",
        },
      ],
      fallback: [],
    };
  },

  // ============ Image Optimization ============
  images: {
    contentDispositionType: "attachment",
    contentSecurityPolicy: `default-src 'self'; script-src 'none'; sandbox;`,
    dangerouslyAllowLocalIP: isDev,
    dangerouslyAllowSVG: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    formats: ["image/avif", "image/webp"],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31_536_000, // 1 year for immutable hashed images
    remotePatterns: [],
  },
  pageExtensions: ["ts", "tsx", "mdx"],
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactCompiler: true,

  // ============ React & Strict Mode ============
  reactStrictMode: true,

  // ============ Routing ============
  redirects: () => [
    // The CV file name carries its owner; the old address keeps working.
    {
      destination: "/Sergey-Petrinich-CV.pdf",
      permanent: true,
      source: "/cv.pdf",
    },
    // The CV is the home page now. The old print sheet stays at /cv?print=1: scripts/cv-pdf.ts prints it into the PDF.
    {
      destination: "/",
      missing: [{ key: "print", type: "query" }],
      permanent: false,
      source: "/cv",
    },
    { destination: "/work", permanent: true, source: "/projects" },
    // About merged into the home page.
    { destination: "/", permanent: true, source: "/about" },
    // The early work lives in the /work table now; `permanent` answers 308.
    { destination: "/work?type=early", permanent: true, source: "/work/early" },
  ],
  skipTrailingSlashRedirect: true,

  // ============ Turbopack (Default in N16) ============
  turbopack: {
    // Dev-only: debug IDs embed source-tree paths into bundle output, which
    // would leak repo layout if shipped to production.
    debugIds: isDev,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
