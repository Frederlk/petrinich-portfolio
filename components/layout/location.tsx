import { profile } from "~/lib/content";

// "Remote, worldwide · Central European Time". Below sm the zone shrinks to its initials (CET), with the full name as the abbreviation's title, so the line fits a phone.
export function Location() {
  const [place, zone] = profile.location.split(" · ");
  if (zone === undefined) {
    return profile.location;
  }
  const initials = zone
    .split(" ")
    .map((word) => word[0])
    .join("");
  return (
    <>
      {place} ·{" "}
      <abbr className="no-underline sm:hidden" title={zone}>
        {initials}
      </abbr>
      <span className="max-sm:hidden">{zone}</span>
    </>
  );
}
