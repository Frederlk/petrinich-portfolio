import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import { ContactMenu } from "~/components/layout/contact-menu";
import { ContactRowLink } from "~/components/layout/contact-row";
import { Location } from "~/components/layout/location";
import { ArrowSlide } from "~/components/motion/arrow-slide";

import { CtaLink } from "~/ui/cta-link";

import {
  contactChannels,
  CV_PDF_NAME,
  CV_PDF_PATH,
  email,
  startProjectHref,
} from "~/lib/contact";

const rowClass =
  "flex flex-wrap items-center justify-between gap-x-space-md border-b border-surface-container-high pb-space-xs";
const rowLabel = "type-label text-secondary";

// The closing block, of the home page: the call to action on the left, the contact channels on the right. Below lg the channels are the contact drawer's rows, pulled out by their own 16px padding so their icons line up with the heading.
export function Engagement() {
  const channels = contactChannels.filter((c) => c.external === true);

  return (
    <section className="container pb-space-2xl sm:pb-space-3xl">
      <div className="reveal border border-surface-container-high bg-surface-container-lowest p-space-md sm:p-space-xl">
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
            {/* Below sm the two buttons stack and fill the width (grid items stretch). */}
            <div className="grid gap-space-md sm:flex sm:flex-wrap sm:items-center">
              <ContactMenu align="start" size="xl" />
              <CtaLink href={startProjectHref} size="xl" variant="outline">
                Start a project
              </CtaLink>
            </div>
          </div>
          <div className="flex flex-col justify-between border-t border-surface-container-high pt-space-lg lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-space-xl">
            <ul className="-mx-space-md lg:hidden">
              {contactChannels.map((channel) => (
                <li key={channel.id}>
                  <ContactRowLink channel={channel} />
                </li>
              ))}
            </ul>
            <ul className="flex flex-col space-y-space-sm max-lg:hidden">
              <li className={rowClass}>
                <span className={rowLabel}>Email</span>
                <CtaLink href={`mailto:${email}`} size="none" variant="channel">
                  {email}
                  <ArrowSlide />
                </CtaLink>
              </li>
              {channels.map((c) => (
                <li className={rowClass} key={c.id}>
                  <span className={rowLabel}>{c.label}</span>
                  <CtaLink
                    href={c.href}
                    rel="noopener"
                    size="none"
                    target="_blank"
                    variant="channel"
                  >
                    {c.handle}
                    <ArrowSlide external />
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
                  Download PDF
                  <DownloadSimpleIcon
                    aria-hidden
                    className="ml-space-xs size-4"
                  />
                </CtaLink>
              </li>
            </ul>
            <p className="mt-space-lg border-t border-surface-container-high pt-space-md type-meta text-secondary">
              <Location />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
