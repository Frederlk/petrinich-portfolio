"use client";

import { FunnelSimpleIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

import { BadgeOverflow } from "~/ui/badge-overflow";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxValue,
} from "~/ui/combobox";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "~/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/popover";
import { ScrollArea } from "~/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/ui/select";

import { cn } from "~/lib/cn";
import { WORK_ROLE_LABELS } from "~/lib/labels";

import type { FilterPatch, WorkFilters } from "~/features/work/filters";
import {
  BUILD_LABELS,
  BUILDS,
  type DomainOption,
  type TechOption,
  WORK_ROLES,
  type WorkRow,
} from "~/features/work/work-types";

import type { ReactNode } from "react";

const ALL = "all";

type Option = { label: string; value: string };

type Lists = {
  roles: readonly WorkRow["role"][];
  domains: readonly DomainOption[];
  techs: readonly TechOption[];
  years: readonly number[];
};

type Props = Lists & {
  filters: WorkFilters;
  onChange: (patch: FilterPatch) => void;
  resultCount: number;
};

const fieldLabel = "type-label text-secondary";

// The bordered frame every filter field sits in, the selects and the AI switch alike, so they share border, height and hover.
const fieldFrame =
  "border border-surface-container-high bg-surface-container-lowest";

// The frame is the hit area: the trigger fills it, so a click anywhere in the box opens the list.
function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string | null) => void;
  options: readonly Option[];
  value: string | null;
}) {
  const items = [{ label: "All", value: ALL }, ...options];
  return (
    <div className="flex flex-col gap-space-xs">
      <span aria-hidden className={fieldLabel}>
        {label}
      </span>
      <div className={fieldFrame}>
        <Select
          items={items}
          onValueChange={(next) => {
            onChange(next === null || next === ALL ? null : next);
          }}
          value={value ?? ALL}
        >
          <SelectTrigger aria-label={label}>
            <span className="truncate">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Several technologies at once, typed to narrow the long list, under the /stack group headings; an empty field reads "All" like the selects. `techs` arrive sorted by group, then name.
function TechField({
  onChange,
  techs,
  value,
}: {
  onChange: (value: string[]) => void;
  techs: Lists["techs"];
  value: string[];
}) {
  const groups = Map.groupBy(techs, (t) => t.group)
    .entries()
    .map(([group, list]) => ({
      items: list.map((t) => ({ label: t.name, value: t.id })),
      value: group,
    }))
    .toArray();
  const labelOf = new Map(techs.map((t) => [t.id, t.name]));
  return (
    <div className="flex flex-col gap-space-xs">
      <span aria-hidden className={fieldLabel}>
        Technology
      </span>
      <div className={fieldFrame}>
        <Combobox
          items={groups}
          multiple
          onValueChange={onChange}
          value={value}
        >
          {/* At most two rows of chips, then "+N"; the search input keeps a narrow column beside them, so the field never grows past two rows. */}
          <ComboboxChips className="flex-nowrap">
            {value.length === 0 ? null : (
              <ComboboxValue>
                {(picked: string[]) => (
                  <BadgeOverflow
                    className="min-w-0 flex-1"
                    getKey={(id) => id}
                    items={picked}
                    lineCount={2}
                    renderBadge={(id) => (
                      <ComboboxChip>{labelOf.get(id) ?? id}</ComboboxChip>
                    )}
                    renderOverflow={(count) => (
                      <span className="flex h-7 items-center px-space-xs type-label text-secondary">
                        +{count}
                      </span>
                    )}
                  />
                )}
              </ComboboxValue>
            )}
            <ComboboxChipsInput
              aria-label="Technology"
              className={
                value.length === 0 ? undefined : "w-10 min-w-0 flex-none"
              }
              placeholder={value.length === 0 ? "All" : undefined}
            />
          </ComboboxChips>
          <ComboboxPopup>
            <ComboboxEmpty>No technology found</ComboboxEmpty>
            <ComboboxList>
              {(group: (typeof groups)[number]) => (
                <ComboboxGroup items={group.items} key={group.value}>
                  <ComboboxGroupLabel>{group.value}</ComboboxGroupLabel>
                  <ComboboxCollection>
                    {(item: Option) => (
                      <ComboboxItem key={item.value} value={item.value}>
                        {item.label}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxPopup>
        </Combobox>
      </div>
    </div>
  );
}

function FilterFields({
  domains,
  filters,
  onChange,
  roles,
  techs,
  years,
}: Props) {
  return (
    <div className="flex flex-col gap-space-md p-space-md">
      <TechField
        onChange={(tech) => {
          onChange({ tech: tech.length === 0 ? null : tech });
        }}
        techs={techs}
        value={filters.tech}
      />
      <SelectField
        label="Domain"
        onChange={(domain) => {
          onChange({ domain });
        }}
        options={domains.map((d) => ({ label: d.label, value: d.id }))}
        value={filters.domain}
      />
      <SelectField
        label="Year"
        onChange={(year) => {
          onChange({ year: year === null ? null : Number(year) });
        }}
        options={years.map((y) => ({ label: String(y), value: String(y) }))}
        value={filters.year === null ? null : String(filters.year)}
      />
      <SelectField
        label="Role"
        onChange={(role) => {
          onChange({ role: WORK_ROLES.find((r) => r === role) ?? null });
        }}
        options={roles.map((r) => ({ label: WORK_ROLE_LABELS[r], value: r }))}
        value={filters.role}
      />
      <SelectField
        label="Build"
        onChange={(build) => {
          onChange({ build: BUILDS.find((b) => b === build) ?? null });
        }}
        options={BUILDS.map((b) => ({ label: BUILD_LABELS[b], value: b }))}
        value={filters.build}
      />
    </div>
  );
}

export function activeFilterCount(f: WorkFilters): number {
  return (
    f.tech.length +
    [f.domain, f.year, f.role, f.build].filter((v) => v !== null).length
  );
}

const triggerClass = cn(
  // Layout & Size
  "relative flex h-control shrink-0 cursor-pointer items-center justify-center gap-space-sm border border-surface-container-high bg-surface-container-low px-space-md",
  // Typography & Colors
  "type-button text-on-surface transition-colors hover:bg-surface-container data-popup-open:bg-surface-container",
  // Focus state
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
);

function TriggerBody({ count }: { count: number }): ReactNode {
  return (
    <>
      <FunnelSimpleIcon aria-hidden className="size-4 text-primary-container" />
      Filters
      {count > 0 ? (
        <span className="min-w-5 bg-primary-container px-1 text-center text-on-primary-container">
          {count}
        </span>
      ) : null}
    </>
  );
}

// One Filters button. From md up it is labelled and opens a popover under the button; below md it is a square funnel beside the search field, with the count as a badge on its corner, and the same fields open in the bottom drawer. Both triggers are in the markup and CSS shows one.
export function FiltersControl(props: Props) {
  const count = activeFilterCount(props.filters);
  const clear = (
    <button
      className="cursor-pointer type-label text-secondary hover:text-on-surface focus-visible:outline-2 focus-visible:outline-ring disabled:invisible"
      disabled={count === 0}
      onClick={() => {
        props.onChange({
          build: null,
          domain: null,
          role: null,
          tech: null,
          year: null,
        });
      }}
      type="button"
    >
      Clear filters
    </button>
  );

  return (
    <>
      <Drawer>
        <DrawerTrigger
          render={(triggerProps) => (
            <button
              {...triggerProps}
              aria-label={count > 0 ? `Filters, ${count} active` : "Filters"}
              className={cn(triggerClass, "size-control px-0 md:hidden")}
              type="button"
            >
              <FunnelSimpleIcon
                aria-hidden
                className="size-4 text-primary-container"
              />
              {count > 0 ? (
                <span
                  aria-hidden
                  className="absolute -top-2 -right-2 min-w-5 bg-primary-container px-1 text-center type-meta text-on-primary-container"
                >
                  {count}
                </span>
              ) : null}
            </button>
          )}
        />
        <DrawerContent title="Filters">
          <FilterFields {...props} />
          <div className="flex items-center justify-between gap-space-md border-t border-surface-container-high p-space-md">
            {clear}
            <DrawerClose
              render={
                <button
                  className="min-h-12 cursor-pointer bg-primary-container px-space-lg type-button text-on-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  type="button"
                >
                  Show {props.resultCount}
                </button>
              }
            />
          </div>
        </DrawerContent>
      </Drawer>
      <Popover>
        <PopoverTrigger
          render={(triggerProps) => (
            <button
              {...triggerProps}
              className={cn(triggerClass, "max-md:hidden")}
              type="button"
            >
              <TriggerBody count={count} />
            </button>
          )}
        />
        <PopoverContent className="w-80" positionMethod="fixed" side="bottom">
          <ScrollArea className="max-h-(--available-height)">
            <FilterFields {...props} />
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
}

// The thin row under the toolbar: one removable chip per filter that is set.
export function ActiveChips({
  domains,
  filters,
  onChange,
  techs,
}: Pick<Props, "domains" | "filters" | "onChange" | "techs">) {
  const chips: { clear: FilterPatch; label: string }[] = [
    ...filters.tech.map((id) => {
      const rest = filters.tech.filter((t) => t !== id);
      return {
        clear: { tech: rest.length === 0 ? null : rest },
        label: `Tech: ${techs.find((t) => t.id === id)?.name ?? id}`,
      };
    }),
    ...(filters.domain === null
      ? []
      : [
          {
            clear: { domain: null },
            label: `Domain: ${domains.find((d) => d.id === filters.domain)?.label ?? filters.domain}`,
          },
        ]),
    ...(filters.year === null
      ? []
      : [{ clear: { year: null }, label: `Year: ${filters.year}` }]),
    ...(filters.role === null
      ? []
      : [
          {
            clear: { role: null },
            label: `Role: ${WORK_ROLE_LABELS[filters.role]}`,
          },
        ]),
    ...(filters.build === null
      ? []
      : [
          {
            clear: { build: null },
            label: `Build: ${BUILD_LABELS[filters.build]}`,
          },
        ]),
  ];

  return (
    <ul className="flex flex-wrap items-center gap-space-xs">
      {chips.map((chip) => (
        <li key={chip.label}>
          <button
            aria-label={`Remove filter ${chip.label}`}
            className="group flex min-h-8 cursor-pointer items-center gap-space-xs border border-surface-container-high bg-surface-container-low px-space-sm type-label text-on-surface hover:border-primary-container hover:text-primary-container focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => {
              onChange(chip.clear);
            }}
            type="button"
          >
            {chip.label}
            <XIcon aria-hidden className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
