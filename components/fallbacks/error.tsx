"use client";

import {
  WarningCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  WifiSlashIcon,
} from "@phosphor-icons/react/dist/ssr";
import { usePathname } from "next/navigation";

import { StatusTitle } from "~/components/fallbacks/status-title";

import { Button } from "~/ui/button";
import { CtaLink, ctaLinkVariants } from "~/ui/cta-link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/ui/empty";

import { cn } from "~/lib/cn";

import { ROUTES } from "~/constants/routes";

import {
  DEFAULT_ERROR_MESSAGE,
  getErrorCode,
  getErrorMessage,
} from "~/utils/errors";

import { getErrorConfig, isRetryable } from "./error-config";

import type { ReactNode } from "react";

const iconByCode: Record<string, ReactNode> = {
  connection_error: <WifiSlashIcon />,
  gateway_timeout: <ClockIcon />,
  not_found: <MagnifyingGlassIcon />,
  timeout: <ClockIcon />,
};

interface ErrorStateProps {
  className?: string;
  description?: string;
  dismissLabel?: string;
  error: unknown;
  icon?: ReactNode;
  onDismiss?: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  severity?: "error" | "warning";
  title?: string | undefined;
}

export function ErrorState({
  error,
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  onDismiss,
  dismissLabel = "Dismiss",
  icon,
  className = "col-span-full h-96",
  severity,
}: ErrorStateProps) {
  const code = getErrorCode(error);
  const config = getErrorConfig(code);
  const retryable = isRetryable(code);

  const errorMessage = getErrorMessage(error);
  const resolvedTitle = title ?? config.title;
  const resolvedDescription =
    description ??
    (errorMessage === DEFAULT_ERROR_MESSAGE
      ? config.description
      : errorMessage);
  const resolvedSeverity = severity ?? config.severity;
  const resolvedIcon = icon ?? iconByCode[code ?? ""] ?? <WarningCircleIcon />;

  const showRetry = onRetry !== undefined && retryable;
  const showDismiss = onDismiss !== undefined && !retryable;

  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant={resolvedSeverity === "error" ? "error" : "icon"}>
          {resolvedIcon}
        </EmptyMedia>
        <EmptyTitle>{resolvedTitle}</EmptyTitle>
        <EmptyDescription>{resolvedDescription}</EmptyDescription>
      </EmptyHeader>
      {(showRetry || showDismiss) && (
        <EmptyContent>
          {showRetry && (
            <Button onClick={onRetry} size="sm" variant="outline">
              {retryLabel}
            </Button>
          )}
          {showDismiss && (
            <Button onClick={onDismiss} size="sm" variant="outline">
              {dismissLabel}
            </Button>
          )}
        </EmptyContent>
      )}
    </Empty>
  );
}

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const pathname = usePathname();
  // In production Next.js replaces a server error's message with a generic one; the digest then ties the page to the server log.
  const facts = [
    { label: "Code", value: "500", tone: "text-primary-container" },
    { label: "Digest", value: error.digest ?? "–", tone: "text-on-surface" },
    { label: "Route", value: pathname, tone: "text-on-surface" },
  ];
  return (
    <main className="container pt-space-xl pb-space-2xl">
      <StatusTitle code="500" />
      <p className="mb-space-2xl max-w-3xl type-h2 text-on-surface">
        Something broke on my side, not yours.
      </p>
      <dl className="grid grid-cols-1 border-t border-b border-surface-container-high sm:grid-cols-3">
        {facts.map((f) => (
          <div
            className="border-surface-container-high p-space-md not-last:border-b sm:p-space-lg sm:not-last:border-r sm:not-last:border-b-0"
            key={f.label}
          >
            <dt className="type-label text-secondary">{f.label}</dt>
            <dd className={cn("mt-space-xs type-h3 break-all", f.tone)}>
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-space-lg flex items-center gap-space-sm border border-surface-container-high bg-surface-container-lowest p-space-md">
        <span className="type-label text-primary-container">[ERR]</span>
        <span className="min-w-0 type-code break-words text-on-surface">
          {getErrorMessage(error)}
        </span>
        <span aria-hidden className="size-2 shrink-0 bg-primary-container" />
      </p>
      <div className="mt-space-2xl flex flex-wrap items-center gap-space-md">
        <button
          className={ctaLinkVariants({ size: "xl" })}
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <CtaLink href={ROUTES.HOME} size="xl" variant="outline">
          Go home
        </CtaLink>
      </div>
    </main>
  );
}
