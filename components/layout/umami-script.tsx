import Script from "next/script";

import { BEFORE_SEND, beforeSendSource, UMAMI_PROXY_PREFIX } from "~/lib/umami";

import { env } from "~/env";

/** The Umami Cloud tracker, loaded and posting through this origin (`rewrites` in `next.config.ts`), so a filter list that blocks the Umami hosts does not blind it. Renders nothing without a website id. `data-host-url` is relative, so the tracker posts to whichever host served the page and stays under the CSP's `connect-src 'self'`; an absolute `siteUrl` would be blocked on any other host. Inline, no nonce: the CSP allows `'unsafe-inline'` scripts. */
export function UmamiScript() {
  const websiteId = env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (websiteId === undefined) {
    return null;
  }

  return (
    <>
      <Script id="umami-before-send" strategy="afterInteractive">
        {beforeSendSource}
      </Script>
      <Script
        data-before-send={BEFORE_SEND}
        data-host-url={UMAMI_PROXY_PREFIX}
        data-website-id={websiteId}
        src={`${UMAMI_PROXY_PREFIX}/script.js`}
        strategy="afterInteractive"
      />
    </>
  );
}
