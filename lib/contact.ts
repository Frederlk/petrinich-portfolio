import { profile } from "~/lib/content";

const mailto = profile.contacts.find((c) => c.url.startsWith("mailto:"))?.url;
if (mailto === undefined) {
  throw new Error("profile.json: contacts has no mailto: entry");
}

export const email = mailto.replace("mailto:", "");

// Owner-approved wording of the home page and footer; the content files carry no availability field.
export const AVAILABILITY = "Open to full-time, contract and freelance work";

// The CV file lives at one public path and is saved under the same name, so a copy on a recruiter's disk says whose CV it is. `/cv.pdf` redirects here (next.config.ts).
export const CV_PDF_NAME = "Sergey-Petrinich-Lead-Full-Stack-Developer-CV.pdf";
export const CV_PDF_PATH = `/${CV_PDF_NAME}`;
// The Umami event on every CV download link; the tracker counts a click on any element carrying `data-umami-event`, and `data-umami-event-place` says which link it was.
export const CV_DOWNLOAD_EVENT = "cv-download";
export const webContacts = profile.contacts.filter((c) =>
  c.url.startsWith("http")
);
export const telegramUrl = profile.contacts.find(
  (c) => c.label === "Telegram"
)?.url;

const withSubject = (subject: string) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`;

export const hireMeHref = withSubject("Hiring inquiry");
export const startProjectHref = withSubject("Project inquiry");

// Optional: "Book a call" appears in the contact menu once profile.json carries a contact labelled "Calendly".
export const calendlyUrl = profile.contacts.find(
  (c) => c.label === "Calendly"
)?.url;

export const CONTACT_IDS = [
  "call",
  "email",
  "telegram",
  "linkedin",
  "github",
  "cv",
] as const;

export type ContactChannel = {
  download?: boolean;
  external?: boolean;
  // The muted second line of a menu row: the address, the @handle or the file type.
  handle: string;
  href: string;
  id: (typeof CONTACT_IDS)[number];
  label: string;
};

// The handle is the path of the profile URL: /Frederlk becomes @Frederlk, /in/petrinichsergey stays in/petrinichsergey.
const handleOf = (url: string, id: ContactChannel["id"]) => {
  const path = new URL(url).pathname.slice(1);
  return id === "linkedin" ? path : `@${path}`;
};

const socialChannels = (
  [
    ["telegram", "Telegram"],
    ["linkedin", "LinkedIn"],
    ["github", "GitHub"],
  ] as const
).flatMap(([id, label]): ContactChannel[] => {
  const href = profile.contacts.find((c) => c.label === label)?.url;
  return href === undefined
    ? []
    : [{ external: true, handle: handleOf(href, id), href, id, label }];
});

const callChannels: ContactChannel[] =
  calendlyUrl === undefined
    ? []
    : [
        {
          external: true,
          handle: new URL(calendlyUrl).hostname,
          href: calendlyUrl,
          id: "call",
          label: "Book a call",
        },
      ];

// What the contact menu lists, in order.
export const contactChannels: readonly ContactChannel[] = [
  ...callChannels,
  { handle: email, href: hireMeHref, id: "email", label: "Email" },
  ...socialChannels,
  {
    download: true,
    handle: "PDF",
    href: CV_PDF_PATH,
    id: "cv",
    label: "Download CV",
  },
];
