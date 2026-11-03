import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Suspense } from "react";

import { ContactMenu } from "~/components/layout/contact-menu";
import { MobileNav } from "~/components/layout/mobile-nav";
import { NavLinkList, NavLinks } from "~/components/layout/nav-links";
import { NAV_BACK } from "~/components/motion/page-transition";
import { TextScramble } from "~/components/motion/text-scramble";

import { ctaLinkVariants } from "~/ui/cta-link";

import { cn } from "~/lib/cn";
import { CV_PDF_NAME, CV_PDF_PATH } from "~/lib/contact";
import { profile } from "~/lib/content";

import { ROUTES } from "~/constants/routes";

// The Stitch shell: a fixed 64px bar. Below md the links collapse into the round chip at the right (MobileNav) and the Contact button stays beside it and opens a bottom drawer.
export function Header() {
  return (
    <header
      className="fixed top-0 left-0 z-50 w-full border-b border-surface-container-high bg-surface vt-site-header"
      data-chrome
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-space-md">
          <Link
            className="link-draw type-h3 text-on-surface uppercase hover:text-primary"
            href={ROUTES.HOME}
            transitionTypes={NAV_BACK}
          >
            {profile.name}
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
              download={CV_PDF_NAME}
              href={CV_PDF_PATH}
            >
              <DownloadSimpleIcon aria-hidden className="size-4" />
              <span>CV</span>
            </a>
            <ContactMenu />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
