import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import {
  LEDGER_COLUMNS,
  LedgerHeader,
  type LedgerSort,
} from "~/components/layout/ledger-header";
import { LinkPending } from "~/components/layout/link-pending";
import { StackBadges } from "~/components/stack-badges";

import { Tip } from "~/ui/tooltip";

import {
  WORK_KIND_LABELS,
  WORK_ROLE_HINTS,
  WORK_ROLE_SHORT,
} from "~/lib/labels";

import { BUILD_LABELS, type WorkRow } from "~/features/work/work-types";

const rowClass =
  "group row-accent block w-full border-b border-surface-container-high hover:bg-surface-container";

function RowBody({ row }: { row: WorkRow }) {
  return (
    <div className="row-shift grid grid-cols-1 items-start gap-y-2 px-space-md py-space-md lg:grid-cols-12 lg:items-center lg:gap-gutter">
      <div className="type-meta text-tertiary group-hover:text-on-surface lg:col-span-1">
        {row.year ?? "–"}
      </div>
      <div className="flex flex-col lg:col-span-3">
        <h3 className="type-h3 text-on-surface uppercase group-hover:text-primary-container">
          {row.name}
          {row.href !== null && !row.href.startsWith("/") ? (
            <ArrowUpRightIcon
              aria-hidden
              className="ml-space-xs inline size-4 align-baseline"
            />
          ) : null}
        </h3>
        {/* The kind as a short label, then each domain as its own tag, in the stack tags' style. */}
        <div className="mt-1 flex flex-wrap items-center gap-space-xs">
          <span className="type-label text-tertiary">
            {WORK_KIND_LABELS[row.kind]}
          </span>
          {row.domains.map((d) => (
            <span
              className="border border-surface-container-high px-space-xs py-0.5 type-meta text-on-surface-variant group-hover:text-on-surface"
              key={d.id}
            >
              {d.label}
            </span>
          ))}
        </div>
      </div>
      <div className="line-clamp-2 type-body text-secondary lg:col-span-4">
        {row.summary}
      </div>
      <div className="type-meta text-on-surface lg:col-span-1">
        <Tip label={WORK_ROLE_HINTS[row.role]}>
          <span>{WORK_ROLE_SHORT[row.role]}</span>
        </Tip>
      </div>
      <StackBadges
        className="lg:col-span-3"
        lead={row.build === "ai" ? BUILD_LABELS.ai : undefined}
        names={row.stack}
      />
    </div>
  );
}

// A project or an early entry links to its page, an open-source row to the project's own site, and a row with no address is plain text, so no row points at a page that does not exist.
function Row({ row }: { row: WorkRow }) {
  if (row.href === null) {
    return (
      <div className="block w-full border-b border-surface-container-high">
        <RowBody row={row} />
      </div>
    );
  }
  if (row.href.startsWith("/")) {
    return (
      <Link className={rowClass} href={row.href}>
        <RowBody row={row} />
        <LinkPending />
      </Link>
    );
  }
  return (
    <a
      className={rowClass}
      href={row.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <RowBody row={row} />
    </a>
  );
}

// Presentational and hook-free: the server renders it in full as the Suspense fallback, the client filter renders the narrowed rows with it. Rows arrive newest first, so grouping by year keeps that order and puts a row without a year last. Sorted by name or role, the year groups would only interleave, so `grouped={false}` renders one flat list.
export function WorkLedger({
  grouped = true,
  rows,
}: {
  grouped?: boolean;
  rows: readonly WorkRow[];
}) {
  if (!grouped) {
    return (
      <div className="flex w-full flex-col">
        {rows.map((row) => (
          <Row key={row.id} row={row} />
        ))}
      </div>
    );
  }
  const groups = [...Map.groupBy(rows, (row) => row.year)];

  return (
    <div className="flex w-full flex-col">
      {groups.map(([year, items]) => (
        <div className="w-full" key={year ?? "undated"}>
          <div className="flex w-full items-baseline gap-space-sm border-b border-surface-container-high bg-surface-container-low px-space-md py-space-xs type-meta">
            <span className="type-label text-on-surface">
              {year ?? "Undated"}
            </span>
            <span className="text-secondary">
              {items.length} {items.length === 1 ? "project" : "projects"}
            </span>
          </div>
          {items.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </div>
      ))}
    </div>
  );
}

// The column labels of the ledger, shown from lg up where the rows are a grid. /work sticks it under the toolbar; the page fallback renders it above the rows.
export function WorkLedgerHeader({ sort }: { sort?: LedgerSort }) {
  return (
    <LedgerHeader
      className="hidden border-t lg:grid"
      columns={LEDGER_COLUMNS}
      sort={sort}
    />
  );
}
