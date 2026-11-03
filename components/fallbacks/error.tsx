"use client";

import {
  WarningCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  WifiSlashIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Button } from "~/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/ui/empty";

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
  return (
    <main className="container flex flex-1 items-center py-16">
      <Empty>
        <EmptyHeader>
          <p className="type-label text-primary">Application error</p>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            {getErrorMessage(error) || "This page failed to load."}
          </EmptyDescription>
        </EmptyHeader>
        {/* oxlint-disable-next-line shadcn/no-restyle -- same as not-found.tsx: the gap travels with the row layout this line switches to. */}
        <EmptyContent className="flex-row flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button render={<Link href={ROUTES.HOME} />} variant="outline">
            Go home
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
