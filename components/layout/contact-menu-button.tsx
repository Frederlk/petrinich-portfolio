"use client";

import { CaretDownIcon } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { ContactRowLink } from "~/components/layout/contact-row";

import { ctaLinkVariants } from "~/ui/cta-link";
import { Drawer, DrawerContent, DrawerTrigger } from "~/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

import { cn } from "~/lib/cn";
import type { ContactChannel } from "~/lib/contact";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

type Props = {
  align?: ComponentProps<typeof DropdownMenuContent>["align"];
  channels: readonly ContactChannel[];
  className?: string;
  side?: ComponentProps<typeof DropdownMenuContent>["side"];
} & VariantProps<typeof ctaLinkVariants>;

const chevron =
  "size-4 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-data-popup-open:rotate-180";

// The button both triggers render. `extra` is the caller's class, kept apart from the per-trigger `className` so each trigger's own class stays a static string.
function ContactTrigger({
  className,
  extra,
  size,
  variant,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof ctaLinkVariants> & { extra?: string | undefined }) {
  return (
    <button
      {...props}
      className={cn(
        ctaLinkVariants({ size, variant }),
        "gap-space-xs",
        extra,
        className
      )}
      type="button"
    >
      Contact
      <CaretDownIcon aria-hidden className={chevron} />
    </button>
  );
}

// The one contact entry. From md up it is a Base UI menu under the button; below md the same list opens as a bottom drawer. Both triggers are in the markup and CSS shows one, so the server HTML needs no viewport guess.
export function ContactMenuButton({
  align = "end",
  channels,
  className,
  side = "bottom",
  size,
  variant,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Drawer onOpenChange={setDrawerOpen} open={drawerOpen}>
        <DrawerTrigger
          render={(props) => (
            <ContactTrigger
              {...props}
              className="md:hidden"
              extra={className}
              size={size}
              variant={variant}
            />
          )}
        />
        <DrawerContent title="Contact">
          <ul>
            {channels.map((channel) => (
              <li key={channel.id}>
                <ContactRowLink
                  channel={channel}
                  onClick={() => {
                    setDrawerOpen(false);
                  }}
                />
              </li>
            ))}
          </ul>
        </DrawerContent>
      </Drawer>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(props) => (
            <ContactTrigger
              {...props}
              className="max-md:hidden"
              extra={className}
              size={size}
              variant={variant}
            />
          )}
        />
        <DropdownMenuContent
          align={align}
          className="min-w-64"
          indicator="none"
          matchTriggerWidth
          side={side}
        >
          {channels.map((channel) => (
            <DropdownMenuItem
              key={channel.id}
              render={(props) => (
                <ContactRowLink {...props} channel={channel} />
              )}
              variant="contact"
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
