/** First path segment of the same-origin proxy for Umami Cloud (`rewrites` in `next.config.ts`). A neutral name, not `umami`, `analytics` or `stats`, which filter lists match. */
export const UMAMI_PROXY_PREFIX = "/sp-7e3d";

/** Where the tracker script is served from. */
export const UMAMI_SCRIPT_ORIGIN = "https://cloud.umami.is";

/** Where the tracker posts events: `<host>/api/send`. */
export const UMAMI_COLLECT_ORIGIN = "https://gateway.umami.is";

/** The window property the tracker reads its before-send hook from (`data-before-send`). */
export const BEFORE_SEND = "umamiBeforeSend";

/** The source of the before-send hook, inlined ahead of the tracker. The tracker counts a pageview on every `pushState` and `replaceState`, so each nuqs write (the /work filters, the /stack search) would be one; a pageview whose pathname equals the last one sent is dropped, so the first pageview keeps its query string (UTM) and a real path change still counts. A custom event carries a `name` and passes through. */
export const beforeSendSource = `window.${BEFORE_SEND}=(function(){var last;return function(type,payload){if(type!=="event"||payload.name)return payload;var path=new URL(payload.url,location.href).pathname;if(path===last)return null;last=path;return payload}})();`;
