import { serializeJsonLd } from "~/lib/structured-data";

// Server-rendered structured data; serializeJsonLd escapes "<" so the content cannot close the tag.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      // oxlint-disable-next-line react/no-danger -- JSON built from our own content files, with "<" escaped by serializeJsonLd
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      type="application/ld+json"
    />
  );
}
