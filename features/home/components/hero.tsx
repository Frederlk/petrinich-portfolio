import { KeyStats } from "~/components/key-stats";
import { ContactMenu } from "~/components/layout/contact-menu";
import { Portrait } from "~/components/layout/portrait";

import { CtaLink } from "~/ui/cta-link";

import { profile } from "~/lib/content";

// Never animated in: it holds the LCP element. The portrait is a square. "Book a call" joins the actions when profile.json carries a booking link.
export function Hero() {
  return (
    <section className="container pt-space-xl pb-space-3xl">
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-8">
          <div className="space-y-space-sm">
            <h1 className="-ml-1 type-display text-on-surface select-none">
              {profile.name}
            </h1>
            <p className="type-h3 text-primary-container uppercase">
              {profile.title}
            </p>
            <p className="type-meta text-secondary">{profile.location}</p>
          </div>
          <p className="max-w-3xl type-h2 text-on-surface uppercase">
            {profile.headline}
          </p>
          <div className="flex flex-wrap items-center gap-space-md lg:mt-auto">
            <ContactMenu align="start" size="lg" />
            <CtaLink href="/work" size="lg" variant="outline">
              View work
            </CtaLink>
          </div>
        </div>
        <Portrait
          className="aspect-square w-full max-w-sm lg:col-span-4 lg:max-w-none"
          priority
          sizes="(min-width: 1024px) 440px, 384px"
        />
      </div>
      <KeyStats className="mt-space-2xl border-t border-b border-surface-container-high py-space-lg" />
    </section>
  );
}
