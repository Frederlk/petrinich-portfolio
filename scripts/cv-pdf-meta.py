# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf"]
# ///
"""Stamps the identity of the CV into the PDF that Chrome printed: document info, XMP, language, title in the viewer's title bar. Run by scripts/cv-pdf.ts as `uv run scripts/cv-pdf-meta.py <pdf> <meta.json>`; the JSON holds title, author, subject, keywords, creator, language, all built from the site's own resume.json."""

import json
import os
import sys
from datetime import datetime, timezone
from xml.sax.saxutils import escape

import pymupdf

pdf_path, meta_path = sys.argv[1], sys.argv[2]
with open(meta_path, encoding="utf-8") as f:
    meta = json.load(f)

doc = pymupdf.open(pdf_path)

# The CV must stay two pages and its fonts must embed as outline fonts: a variable font prints as Type3 glyphs, which viewers draw unhinted (the 2026-11-03 "Full" with uneven letters) and parsers extract worse. Either failure stops the print, and with it the pre-commit hook.
MAX_PAGES = 2
problems = []
if doc.page_count > MAX_PAGES:
    problems.append(f"{doc.page_count} pages, the CV keeps to {MAX_PAGES}")
type3 = {f[3] or f[4] for page in range(doc.page_count) for f in doc.get_page_fonts(page) if f[2] == "Type3"}
if type3:
    problems.append(f"Type3 fonts {sorted(type3)}: a variable font reached the print (app/cv/page.tsx, CV_FONT)")
if problems:
    sys.exit("cv-pdf-meta: " + "; ".join(problems))
# Chrome stamps its creation date from a virtual clock (--virtual-time-budget), so both dates are set from the real UTC time of this run.
now = datetime.now(timezone.utc).strftime("D:%Y%m%d%H%M%S+00'00'")
created = now
producer = doc.metadata.get("producer") or "Skia/PDF"

doc.set_metadata(
    {
        "author": meta["author"],
        "creationDate": created,
        "creator": meta["creator"],
        "keywords": meta["keywords"],
        "modDate": now,
        "producer": producer,
        "subject": meta["subject"],
        "title": meta["title"],
    }
)


def iso(pdf_date: str) -> str:
    # "D:20261027151002+00'00'" -> "2026-10-27T15:10:02+00:00"
    d = pdf_date.removeprefix("D:")
    tz = d[14:].replace("'", ":").rstrip(":") or "Z"
    if tz == "Z" or len(tz) < 6:
        tz = "+00:00" if tz in ("Z", "+00") else tz
    return f"{d[0:4]}-{d[4:6]}-{d[6:8]}T{d[8:10]}:{d[10:12]}:{d[12:14]}{tz}"


lang = meta["language"]
keywords = [k.strip() for k in meta["keywords"].split(",") if k.strip()]
subject_bag = "".join(f"<rdf:li>{escape(k)}</rdf:li>" for k in keywords)
xmp = f"""<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/">
   <dc:format>application/pdf</dc:format>
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">{escape(meta["title"])}</rdf:li></rdf:Alt></dc:title>
   <dc:creator><rdf:Seq><rdf:li>{escape(meta["author"])}</rdf:li></rdf:Seq></dc:creator>
   <dc:description><rdf:Alt><rdf:li xml:lang="x-default">{escape(meta["subject"])}</rdf:li></rdf:Alt></dc:description>
   <dc:subject><rdf:Bag>{subject_bag}</rdf:Bag></dc:subject>
   <dc:language><rdf:Bag><rdf:li>{escape(lang)}</rdf:li></rdf:Bag></dc:language>
   <pdf:Keywords>{escape(meta["keywords"])}</pdf:Keywords>
   <pdf:Producer>{escape(producer)}</pdf:Producer>
   <xmp:CreatorTool>{escape(meta["creator"])}</xmp:CreatorTool>
   <xmp:CreateDate>{iso(created)}</xmp:CreateDate>
   <xmp:ModifyDate>{iso(now)}</xmp:ModifyDate>
   <xmp:MetadataDate>{iso(now)}</xmp:MetadataDate>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>"""
doc.set_xml_metadata(xmp)

# The document language and "show the title, not the file name" in the viewer.
catalog = doc.pdf_catalog()
doc.xref_set_key(catalog, "Lang", f"({lang})")
doc.xref_set_key(catalog, "ViewerPreferences", "<</DisplayDocTitle true>>")

tmp = pdf_path + ".tmp"
doc.save(tmp, deflate=True, garbage=1)
doc.close()
os.replace(tmp, pdf_path)
print(f"stamped {pdf_path}")
