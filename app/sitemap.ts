import { buildDate } from "~/lib/build-date";
import { earlyWork, openSource, projects } from "~/lib/content";
import { SITE_FILES, SITE_PAGES } from "~/lib/site-pages";
import { siteUrl } from "~/lib/site-url";

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...SITE_PAGES.map((p) => (p.path === "/" ? "" : p.path)),
    ...SITE_FILES.filter((f) => f.sitemap).map((f) => f.path),
    ...projects.map((p) => `/work/${p.id}`),
    ...earlyWork.map((w) => `/work/${w.id}`),
    ...openSource.map((o) => `/work/${o.id}`),
  ].map((route) => ({ lastModified: buildDate, url: `${siteUrl}${route}` }));
}
