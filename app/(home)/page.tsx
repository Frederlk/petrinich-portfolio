import { JsonLd } from "~/components/json-ld";
import { PageTransition } from "~/components/motion/page-transition";

import { profilePageJsonLd } from "~/lib/structured-data";

import { About } from "~/features/home/components/about";
import { Engagement } from "~/features/home/components/engagement";
import { Experience } from "~/features/home/components/experience";
import { Hero } from "~/features/home/components/hero";
import { HomeMarker } from "~/features/home/components/home-marker";
import { SelectedWork } from "~/features/home/components/selected-work";
import { StackTeaser } from "~/features/home/components/stack-teaser";

// Screening order: a recruiter checks fit (hero facts), then keywords (stack), then history (experience), then a hiring manager looks for proof (work); About details and contact close the page.
export default function Home() {
  return (
    <>
      <PageTransition />
      <main
        className="min-h-screen w-full bg-surface text-on-surface"
        data-home
      >
        <HomeMarker />
        <JsonLd data={profilePageJsonLd("")} />
        <Hero />
        <StackTeaser />
        <Experience />
        <SelectedWork />
        <About />
        <Engagement />
      </main>
    </>
  );
}
