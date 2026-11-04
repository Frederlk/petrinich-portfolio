import { Suspense } from "react";

import { JsonLd } from "~/components/json-ld";
import { PageTransition } from "~/components/motion/page-transition";

import { pageMetadata } from "~/lib/site-pages";
import { stackJsonLd } from "~/lib/structured-data";

import { Engagement } from "~/features/home/components/engagement";
import {
  StackBrowser,
  StackView,
} from "~/features/stack/components/stack-browser";
import { StackHeader } from "~/features/stack/components/stack-header";
import { coreStack, otherGroups } from "~/features/stack/stack-groups";

import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata("/stack");

const stackProps = {
  core: coreStack?.items ?? [],
  groups: otherGroups,
};

export default function StackPage() {
  return (
    <>
      <PageTransition />
      <main className="min-h-screen w-full bg-surface">
        <JsonLd data={stackJsonLd()} />
        <div className="container pt-space-xl pb-space-2xl">
          <StackHeader />
          {/* The fallback is the full list, so the first HTML names every technology; the client browser takes over and narrows it from the q param. */}
          <Suspense fallback={<StackView {...stackProps} query="" />}>
            <StackBrowser {...stackProps} />
          </Suspense>
        </div>
        <Engagement />
      </main>
    </>
  );
}
