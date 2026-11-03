import { buildDate } from "~/lib/build-date";
import { email } from "~/lib/contact";
import { coreStackNames, profile } from "~/lib/content";
import { siteUrl } from "~/lib/site-url";

// RFC 9116 wants an Expires under a year ahead: one day short of a year from the build date, so every deploy renews it.
export const securityExpires = () => {
  const date = new Date(`${buildDate}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString();
};

export const securityTxt = () =>
  [
    `Contact: mailto:${email}`,
    `Expires: ${securityExpires()}`,
    "Preferred-Languages: en",
    `Canonical: ${siteUrl}/.well-known/security.txt`,
    "",
  ].join("\n");

export const humansTxt = () =>
  [
    "/* TEAM */",
    `Name: ${profile.name}`,
    `Role: ${profile.title}`,
    `Location: ${profile.location}`,
    `Contact: ${email}`,
    ...profile.contacts
      .filter((c) => c.url.startsWith("http"))
      .map((c) => `${c.label}: ${c.url}`),
    "",
    "/* SITE */",
    `Last update: ${buildDate}`,
    "Language: English",
    "Standards: HTML5, schema.org JSON-LD, llms.txt, JSON Resume, RFC 9116",
    `Software: ${coreStackNames.join(", ")}`,
    "",
  ].join("\n");
