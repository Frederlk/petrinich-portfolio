import { Logo } from "~/components/layout/logo";
import { ArrowSlide } from "~/components/motion/arrow-slide";

import { CtaLink } from "~/ui/cta-link";

import { buildDate } from "~/lib/build-date";
import { cn } from "~/lib/cn";
import { CV_PDF_NAME, CV_PDF_PATH, email } from "~/lib/contact";
import { profile } from "~/lib/content";
import { LLMS_PATH, PAGE_TWINS } from "~/lib/site-routes";

import { ROUTES } from "~/constants/routes";

const NAV_INDEX = [
  { href: ROUTES.WORK, label: "Work" },
  { href: ROUTES.STACK, label: "Stack" },
  { href: `${ROUTES.HOME}#experience`, label: "Experience" },
] as const;

// The handle is the path of the profile URL: /Frederlk, /in/petrinichsergey.
const handleOf = (label: string) => {
  const url = profile.contacts.find((c) => c.label === label)?.url;
  return url === undefined ? null : { handle: new URL(url).pathname, url };
};

const aiLink =
  "text-primary-container underline decoration-1 transition-colors hover:text-primary";

function Status({ className }: { className: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-space-md border-t border-surface-container-high pt-space-sm type-meta text-secondary",
        className
      )}
    >
      <span>OPEN TO FULL-TIME, CONTRACT AND FREELANCE</span>
      <span className="inline-block h-2 w-2 bg-primary-container" />
    </div>
  );
}

// "Book a call" is omitted until profile.json carries a booking link.
export function Footer() {
  const github = handleOf("GitHub");
  const linkedin = handleOf("LinkedIn");
  const telegram = handleOf("Telegram");

  return (
    <footer
      className="w-full border-t border-surface-container-high bg-surface-container-lowest pt-space-lg pb-safe-12 md:pt-space-xl"
      data-chrome
    >
      {/* Below md the name block spans the width, Navigation and Contact share the row under it (so a contact link names only its channel there), the status line spans the next row, and the AI-agents line and copyright close the footer. The identity column is `display: contents` there, so its two blocks take their own `order`. */}
      <div className="container grid grid-cols-2 gap-x-gutter gap-y-space-lg md:grid-cols-12">
        <div className="col-span-2 flex flex-col justify-between max-md:contents md:col-span-4">
          <div className="space-y-space-xs max-md:order-1 max-md:col-span-2">
            {/* The logo is decorative beside the name. */}
            <div className="flex items-center gap-space-sm type-h3 text-on-surface uppercase">
              <Logo
                aria-hidden
                className="size-8 shrink-0 text-primary-container"
              />
              {profile.name}
            </div>
            {/* Title, then each part of the location ("Remote, worldwide · Central European Time") on its own line, so no phrase breaks mid-way. */}
            <div className="flex flex-col gap-0.5 type-meta">
              <p className="text-secondary">{profile.title}</p>
              {profile.location.split(" · ").map((part) => (
                <p className="text-secondary" key={part}>
                  {part}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-space-md space-y-space-xs type-meta text-secondary max-md:order-4 max-md:col-span-2 max-md:mt-0">
            {/* A plain link is the one pointer every AI fetcher follows; the head and Link header carry the same addresses. */}
            <p>
              For AI agents:{" "}
              <a className={aiLink} href={LLMS_PATH}>
                llms.txt
              </a>{" "}
              ·{" "}
              <a className={aiLink} href={PAGE_TWINS["/"].markdown}>
                cv.md
              </a>
            </p>
            <p>
              © {buildDate.slice(0, 4)} {profile.name}. All rights reserved.
            </p>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-space-sm max-md:order-2 md:col-span-4">
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
        <div className="flex min-w-0 flex-col gap-space-sm max-md:order-2 md:col-span-4">
          <h2 className="type-label text-secondary">Contact</h2>
          <div className="flex flex-col items-start gap-space-xs">
            <CtaLink href={`mailto:${email}`} size="none" variant="text">
              <span>
                Email<span className="max-md:hidden">: {email}</span>
              </span>
              <ArrowSlide external />
            </CtaLink>
            {github === null ? null : (
              <CtaLink
                href={github.url}
                rel="noopener"
                size="none"
                target="_blank"
                variant="text"
              >
                <span>
                  GitHub<span className="max-md:hidden">: {github.handle}</span>
                </span>
                <ArrowSlide external />
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
                <span>
                  LinkedIn
                  <span className="max-md:hidden">: {linkedin.handle}</span>
                </span>
                <ArrowSlide external />
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
                <span>
                  Telegram
                  <span className="max-md:hidden">
                    : @{telegram.handle.slice(1)}
                  </span>
                </span>
                <ArrowSlide external />
              </CtaLink>
            )}
            <CtaLink
              download={CV_PDF_NAME}
              href={CV_PDF_PATH}
              size="none"
              variant="text"
            >
              <span>
                CV<span className="max-md:hidden">: Download PDF</span>
              </span>
              <ArrowSlide external />
            </CtaLink>
          </div>
          <Status className="mt-space-xs max-md:hidden" />
        </div>
        <Status className="order-3 col-span-2 md:hidden" />
      </div>
    </footer>
  );
}
