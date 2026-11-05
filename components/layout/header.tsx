import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Suspense } from "react";

import { ContactMenu } from "~/components/layout/contact-menu";
import { Logo } from "~/components/layout/logo";
import { MobileNav } from "~/components/layout/mobile-nav";
import { NavLinkList, NavLinks } from "~/components/layout/nav-links";
import { NAV_BACK } from "~/components/motion/page-transition";
import { TextScramble } from "~/components/motion/text-scramble";

import { ctaLinkVariants } from "~/ui/cta-link";

import { cn } from "~/lib/cn";
import { CV_DOWNLOAD_EVENT, CV_PDF_NAME, CV_PDF_PATH } from "~/lib/contact";
import { profile } from "~/lib/content";

import { ROUTES } from "~/constants/routes";

// The Stitch shell: a fixed 64px bar. Below md the links collapse into the square menu button at the right (MobileNav) and the Contact button stays beside it and opens a bottom drawer; below sm Contact is a square envelope button too. The logo at the left is the home link on every page, with the name beside it from sm up.
export function Header() {
  return (
    <header
      className="fixed top-0 left-0 z-50 w-full border-b border-surface-container-high bg-surface vt-site-header"
      data-chrome
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-space-md">
          <Link
            aria-label={profile.name}
            className="group flex shrink-0 items-center gap-space-sm"
            href={ROUTES.HOME}
            transitionTypes={NAV_BACK}
          >
            <Logo aria-hidden className="size-9 text-primary-container" />
            {/* Below sm only the logo shows; the link keeps its name through `aria-label`. */}
            <span
              aria-hidden
              className="type-h3 text-on-surface uppercase link-draw group-hover:text-primary max-sm:hidden"
            >
              {profile.name}
            </span>
          </Link>
          <TextScramble
            className="hidden border-l border-surface-container-high pl-space-md type-meta text-secondary lg:inline-block"
            text={profile.title}
          />
        </div>
        <div className="flex items-center gap-space-lg">
          <nav
            aria-label="Main"
            className="hidden items-center gap-space-lg md:flex"
          >
            <Suspense fallback={<NavLinkList pathname={null} />}>
              <NavLinks />
            </Suspense>
          </nav>
          <div className="flex items-center gap-space-sm">
            <a
              aria-label="Download CV (PDF)"
              className={cn(
                ctaLinkVariants({ size: "md", variant: "outline" }),
                "max-md:hidden"
              )}
              data-umami-event={CV_DOWNLOAD_EVENT}
              data-umami-event-place="header"
              download={CV_PDF_NAME}
              href={CV_PDF_PATH}
            >
              <DownloadSimpleIcon aria-hidden className="size-4" />
              <span>CV</span>
            </a>
            <ContactMenu compact />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
