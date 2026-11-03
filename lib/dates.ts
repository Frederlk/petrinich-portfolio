const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export interface DatePoint {
  // ISO "YYYY-MM" or "YYYY"; null for an open end such as "Present".
  iso: string | null;
  text: string;
}

// A season with no recorded month ("Autumn 2022") reads as its first month, a zero-based index like MONTHS.
const SEASON_START: Readonly<Record<string, number>> = {
  autumn: 8,
  fall: 8,
  spring: 2,
  summer: 5,
  winter: 11,
};

function toIso(text: string): string | null {
  const year = /^\d{4}$/.exec(text);
  if (year) return text;
  const monthYear = /^([A-Za-z]+) (\d{4})$/.exec(text);
  const monthName = monthYear?.[1];
  const name = monthName?.toLowerCase();
  const month =
    name === undefined ? -1 : (SEASON_START[name] ?? MONTHS.indexOf(name));
  if (monthYear && month >= 0) {
    return `${monthYear[2]}-${String(month + 1).padStart(2, "0")}`;
  }
  return null;
}

// Splits the free-text dates of the content files ("February 2024 – Present", "2018-2022") into a start and an optional end.
export function parseDateRange(dates: string): {
  end: DatePoint | null;
  start: DatePoint;
} {
  const [start = dates, end] = dates.split(/\s*[–—]\s*|(?<=\d)-(?=\d)/);
  return {
    end:
      end === undefined || end === "" ? null : { iso: toIso(end), text: end },
    start: { iso: toIso(start), text: start },
  };
}
