import { CtaLink } from "~/ui/cta-link";

import { ROUTES } from "~/constants/routes";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="container flex min-h-screen flex-col justify-center gap-space-lg py-space-3xl">
      <h1 className="type-display text-on-surface">404</h1>
      <p className="max-w-3xl type-h2 text-on-surface">
        This page does not exist or has moved.
      </p>
      <div className="flex flex-wrap items-center gap-space-md">
        <CtaLink href={ROUTES.HOME} size="xl">
          Go home
        </CtaLink>
        <CtaLink href={ROUTES.WORK} size="xl" variant="outline">
          See my work
        </CtaLink>
      </div>
    </main>
  );
}
