import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";

import { ArrowSlide } from "~/components/motion/arrow-slide";

import { CtaLink } from "~/ui/cta-link";

import { buildDate } from "~/lib/build-date";
import { CV_PDF_NAME, CV_PDF_PATH, email } from "~/lib/contact";
import { profile } from "~/lib/content";
import { LLMS_PATH, PAGE_TWINS } from "~/lib/site-routes";

import { ROUTES } from "~/constants/routes";

const NAV_INDEX = [
  { href: ROUTES.WORK, label: "Work" },
  { href: ROUTES.STACK, label: "Stack" },
  { href: `${ROUTES.HOME}#experience`, label: "Recent experience" },
] as const;

// The handle is the path of the profile URL: /Frederlk, /in/petrinichsergey.
const handleOf = (label: string) => {
  const url = profile.contacts.find((c) => c.label === label)?.url;
  return url === undefined ? null : { handle: new URL(url).pathname, url };
};

// "Book a call" is omitted until profile.json carries a booking link.
export function Footer() {
  const github = handleOf("GitHub");
  const linkedin = handleOf("LinkedIn");
  const telegram = handleOf("Telegram");

  return (
    <footer
      className="w-full border-t border-surface-container-high bg-surface-container-lowest py-space-lg md:py-space-xl"
      data-chrome
    >
      <div className="container grid grid-cols-1 gap-x-gutter gap-y-space-lg md:grid-cols-12">
        <div className="flex flex-col justify-between md:col-span-4">
          <div className="space-y-space-xs">
            <div className="type-h3 text-on-surface uppercase">
              {profile.name}
            </div>
            {/* Title, then each part of the location ("Remote, worldwide · Central European Time") on its own line, so no phrase breaks mid-way. */}
            <div className="flex flex-col gap-0.5 type-meta">
              <p className="text-on-surface-variant">{profile.title}</p>
              {profile.location.split(" · ").map((part) => (
                <p className="text-secondary" key={part}>
                  {part}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-space-md space-y-space-xs type-meta text-on-surface-variant">
            {/* A plain link is the one pointer every AI fetcher follows; the head and Link header carry the same addresses. */}
            <p>
              For AI agents:{" "}
              <a className="underline decoration-1" href={LLMS_PATH}>
                llms.txt
              </a>{" "}
              ·{" "}
              <a
                className="underline decoration-1"
                href={PAGE_TWINS["/"].markdown}
              >
                cv.md
              </a>
            </p>
            <p>
              © {buildDate.slice(0, 4)} {profile.name}. All rights reserved.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-space-sm md:col-span-4">
          <h2 className="type-label text-secondary">Navigation</h2>
          <div className="flex flex-col items-start gap-space-xs">
            {NAV_INDEX.map((item) => (
              <CtaLink
                href={item.href}
                key={item.href}
                size="none"
                variant="text"
              >
                {item.label}
                <ArrowSlide />
              </CtaLink>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-space-sm md:col-span-4">
          <h2 className="type-label text-secondary">Contact</h2>
          <div className="flex flex-col items-start gap-space-xs">
            <CtaLink href={`mailto:${email}`} size="none" variant="text">
              Email: {email}
              <ArrowSlide />
            </CtaLink>
            {github === null ? null : (
              <CtaLink
                href={github.url}
                rel="noopener"
                size="none"
                target="_blank"
                variant="text"
              >
                GitHub: {github.handle}
                <ArrowSlide />
              </CtaLink>
            )}
            {linkedin === null ? null : (
              <CtaLink
                href={linkedin.url}
                rel="noopener"
                size="none"
                target="_blank"
                variant="text"
              >
                LinkedIn: {linkedin.handle}
                <ArrowSlide />
              </CtaLink>
            )}
            {telegram === null ? null : (
              <CtaLink
                href={telegram.url}
                rel="noopener"
                size="none"
                target="_blank"
                variant="text"
              >
                Telegram: @{telegram.handle.slice(1)}
                <ArrowSlide />
              </CtaLink>
            )}
            <CtaLink
              download={CV_PDF_NAME}
              href={CV_PDF_PATH}
              size="none"
              variant="text"
            >
              CV: Download PDF
              <DownloadSimpleIcon aria-hidden className="ml-space-xs size-4" />
            </CtaLink>
          </div>
          <div className="mt-space-xs flex items-center justify-between gap-space-md border-t border-surface-container-high pt-space-sm type-meta text-secondary">
            <span>OPEN TO FULL-TIME, CONTRACT AND FREELANCE</span>
            <span className="inline-block h-2 w-2 bg-primary-container" />
          </div>
        </div>
      </div>
    </footer>
  );
}
