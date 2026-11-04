import "~/styles/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, type PropsWithChildren } from "react";

import { BackToTop } from "~/components/layout/back-to-top";
import { Footer } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";
import { NavigationProgress } from "~/components/layout/navigation-progress";
import { UmamiScript } from "~/components/layout/umami-script";
import { MotionProvider } from "~/components/motion/motion-provider";
import { RevealObserver } from "~/components/motion/reveal-observer";

import { ToastProvider } from "~/ui/toast";
import { TooltipProvider } from "~/ui/tooltip";

import { cn } from "~/lib/cn";
import { profile } from "~/lib/content";
import { SITE_PAGES } from "~/lib/site-pages";
import { siteUrl } from "~/lib/site-url";

import { FONT_FAMILY } from "~/styles/fonts";

import { loadFpsMeter } from "~/env";

import type { Metadata, Viewport } from "next";

const defaultTitle = `${profile.name}, ${profile.title}`;

export const metadata: Metadata = {
  alternates: {
    canonical: "./",
    // The home page's twins as <link rel="alternate">; /work and /stack announce their own (pageMetadata), each /work/<slug> page its Markdown twin (generateMetadata).
    types: { "application/json": "/resume.json", "text/markdown": "/cv.md" },
  },
  authors: [{ name: profile.name, url: siteUrl }],
  description: SITE_PAGES[0].description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    description: SITE_PAGES[0].description,
    locale: "en_US",
    siteName: profile.name,
    title: defaultTitle,
    type: "website",
    url: "./",
  },
  title: { default: defaultTitle, template: `%s | ${profile.name}` },
};

// Without viewport-fit=cover the safe-area insets resolve to 0, and the contact drawer would sit under the home indicator. No pinch zoom, by the owner's choice: the scale lock covers Android, and iOS Safari, which ignores it, gets `touch-action` in globals.css.
export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  width: "device-width",
};

export default async function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  // Null in production: see loadFpsMeter in env.ts.
  const FpsMeter =
    loadFpsMeter === null ? null : (await loadFpsMeter()).FpsMeter;

  return (
    // `data-scroll-behavior` makes Next scroll instantly on a route change, so the smooth `scroll-behavior` in globals.css glides only same-page hash links.
    <html
      className={cn("dark antialiased", FONT_FAMILY)}
      data-scroll-behavior="smooth"
      lang="en"
    >
      <head>
        <link href="/llms.txt" rel="describedby" type="text/plain" />
      </head>
      <body className="relative">
        <NuqsAdapter>
          <MotionProvider>
            <TooltipProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <ToastProvider position="bottom-left">
                <div className="relative isolate flex min-h-svh flex-col">
                  <Header />
                  <div className="flex-1 pt-16 print:pt-0">{children}</div>
                  <Footer />
                </div>
                <RevealObserver />
                <BackToTop />
                {FpsMeter === null ? null : <FpsMeter />}
              </ToastProvider>
            </TooltipProvider>
          </MotionProvider>
        </NuqsAdapter>
        <UmamiScript />
      </body>
    </html>
  );
}
