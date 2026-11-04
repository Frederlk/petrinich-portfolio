import { KeyStats } from "~/components/key-stats";
import { ContactMenu } from "~/components/layout/contact-menu";
import { Location } from "~/components/layout/location";
import { Portrait } from "~/components/layout/portrait";

import { CtaLink } from "~/ui/cta-link";

import { profile } from "~/lib/content";

// Never animated in: it holds the LCP element. The portrait is a square. "Book a call" joins the actions when profile.json carries a booking link.
export function Hero() {
  return (
    <section className="container pt-space-xl pb-space-2xl sm:pb-space-3xl">
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div className="flex flex-col gap-space-lg md:col-span-7 lg:col-span-8">
          <div className="space-y-space-sm">
            <h1 className="-ml-1 type-display text-on-surface select-none">
              {profile.name}
            </h1>
            <p className="type-h3 text-primary-container uppercase">
              {profile.title}
            </p>
            <p className="type-meta text-secondary">
              <Location />
            </p>
          </div>
          <p className="max-w-3xl type-h2 text-on-surface uppercase">
            {profile.headline}
          </p>
          <div className="grid grid-cols-2 gap-space-sm sm:flex sm:flex-wrap sm:items-center sm:gap-space-md md:mt-auto">
            <ContactMenu
              align="start"
              className="max-sm:h-12 max-sm:w-full"
              size="lg"
            />
            <CtaLink
              className="max-sm:h-12 max-sm:w-full"
              href="/work"
              size="lg"
              variant="outline"
            >
              View work
            </CtaLink>
          </div>
        </div>
        <Portrait
          className="aspect-square w-full max-w-sm md:col-span-5 md:max-w-none lg:col-span-4"
          priority
          sizes="(min-width: 1024px) 440px, (min-width: 768px) 300px, 384px"
        />
      </div>
      <KeyStats className="mt-space-2xl border-t border-b border-surface-container-high py-space-lg" />
    </section>
  );
}
