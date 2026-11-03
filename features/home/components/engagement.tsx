import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import { ContactMenu } from "~/components/layout/contact-menu";
import { ArrowSlide } from "~/components/motion/arrow-slide";

import { CtaLink } from "~/ui/cta-link";

import {
  CV_PDF_NAME,
  CV_PDF_PATH,
  email,
  startProjectHref,
} from "~/lib/contact";
import { profile } from "~/lib/content";
import { bare } from "~/lib/url";

const rowClass =
  "flex flex-wrap items-center justify-between gap-x-space-md border-b border-surface-container-high pb-space-xs";
const rowLabel = "type-label text-secondary";

// The closing block, of the home page: the call to action on the left, the contact channels on the right.
export function Engagement() {
  const channels = ["Telegram", "GitHub", "LinkedIn"].flatMap((label) => {
    const url = profile.contacts.find((c) => c.label === label)?.url;
    return url === undefined ? [] : [{ label, text: bare(url), url }];
  });

  return (
    <section className="container pb-space-3xl">
      <div className="reveal border border-surface-container-high bg-surface-container-lowest p-space-xl">
        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <h2 className="mb-space-md type-h1 text-on-surface">
                OPEN TO FULL-TIME, CONTRACT AND FREELANCE WORK
              </h2>
              <p className="mb-space-xl max-w-xl type-lead text-secondary">
                I am looking for a full-time role or a long contract, and I take
                freelance projects. AI work comes first.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-md">
              <ContactMenu align="start" size="xl" />
              <CtaLink href={startProjectHref} size="xl" variant="outline">
                Start a project
              </CtaLink>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-surface-container-high pt-space-lg lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-space-xl">
            <ul className="flex flex-col space-y-space-sm">
              <li className={rowClass}>
                <span className={rowLabel}>Email</span>
                <CtaLink href={`mailto:${email}`} size="none" variant="channel">
                  {email}
                  <ArrowSlide />
                </CtaLink>
              </li>
              {channels.map((c) => (
                <li className={rowClass} key={c.label}>
                  <span className={rowLabel}>{c.label}</span>
                  <CtaLink
                    href={c.url}
                    rel="noopener"
                    size="none"
                    target={c.url.startsWith("http") ? "_blank" : undefined}
                    variant="channel"
                  >
                    {c.text}
                    <ArrowSlide />
                  </CtaLink>
                </li>
              ))}
              <li className="flex items-center justify-between pt-space-xs">
                <span className={rowLabel}>CV</span>
                <CtaLink
                  download={CV_PDF_NAME}
                  href={CV_PDF_PATH}
                  size="none"
                  variant="download"
                >
                  <DownloadSimpleIcon aria-hidden className="mr-2 size-4" />
                  Download PDF
                </CtaLink>
              </li>
            </ul>
            <p className="mt-space-lg border-t border-surface-container-high pt-space-md type-meta text-secondary">
              {profile.location}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
