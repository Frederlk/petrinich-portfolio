import {
  CalendarBlankIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  TelegramLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

import { ArrowSlide } from "~/components/motion/arrow-slide";

import { cn } from "~/lib/cn";
import { CV_DOWNLOAD_EVENT, type ContactChannel } from "~/lib/contact";

import type { ComponentProps } from "react";

const ICONS = {
  call: CalendarBlankIcon,
  cv: DownloadSimpleIcon,
  email: EnvelopeSimpleIcon,
  github: GithubLogoIcon,
  linkedin: LinkedinLogoIcon,
  telegram: TelegramLogoIcon,
} as const satisfies Record<ContactChannel["id"], unknown>;

// One row of the contact list, shared by the desktop menu, the mobile drawer and the home contact block below lg: icon, label over a muted handle, and an up-right arrow on every row, since each one leaves the page (another site, the mail app, a download). On hover or focus the vermilion fill sweeps in from the left, the text turns dark and the arrow slides; the focus ring is dark and inset, so it shows on the fill. The mobile nav drawer's rows take the same look.
export const contactRowClass = cn(
  // Layout & Size
  "group flex min-h-12 w-full items-center gap-space-md border-b border-surface-container-high px-space-md py-space-sm last:border-b-0",
  // Typography & Colors
  "fill-sweep text-on-surface sweep-primary-container hover:text-on-primary-container data-highlighted:text-on-primary-container",
  // Focus state
  "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-on-primary-container"
);

const onFill =
  "transition-colors duration-300 group-hover:text-on-primary-container group-data-highlighted:text-on-primary-container";

// The anchor of one channel. Menu items and the drawer's Close pass Base UI's props through `rest`.
export function ContactRowLink({
  channel,
  className,
  ...rest
}: { channel: ContactChannel } & ComponentProps<"a">) {
  const Icon = ICONS[channel.id];
  const external = channel.external === true;
  return (
    <a
      {...rest}
      className={cn(className, contactRowClass)}
      data-umami-event={channel.id === "cv" ? CV_DOWNLOAD_EVENT : undefined}
      data-umami-event-place={channel.id === "cv" ? "contacts" : undefined}
      download={channel.download}
      href={channel.href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      <Icon
        aria-hidden
        className={cn("size-5 shrink-0 text-primary-container", onFill)}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-button">{channel.label}</span>
        <span className={cn("truncate type-meta text-secondary", onFill)}>
          {channel.handle}
        </span>
      </span>
      <ArrowSlide className="shrink-0" external />
    </a>
  );
}
