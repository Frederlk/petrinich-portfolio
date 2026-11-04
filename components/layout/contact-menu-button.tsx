"use client";

import {
  CaretDownIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";

import { ContactRowLink } from "~/components/layout/contact-row";

import { ctaLinkVariants } from "~/ui/cta-link";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "~/ui/drawer";
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
  // Below sm the drawer opens from a square envelope button instead, for the narrow header row.
  compact?: boolean;
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
      className={cn(ctaLinkVariants({ size, variant }), extra, className)}
      type="button"
    >
      <span>Contact</span>
      <CaretDownIcon aria-hidden className={chevron} />
    </button>
  );
}

// The header's compact trigger: the outline CTA as a square envelope, the menu button's twin.
function ContactIconTrigger({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      aria-label="Contact"
      className={cn(
        ctaLinkVariants({ size: "icon", variant: "outline" }),
        className
      )}
      type="button"
    >
      <EnvelopeSimpleIcon aria-hidden className="size-4.5" />
    </button>
  );
}

// The one contact entry. From md up it is a Base UI menu under the button; below md the same list opens as a bottom drawer. Both triggers are in the markup and CSS shows one, so the server HTML needs no viewport guess.
export function ContactMenuButton({
  align = "end",
  channels,
  className,
  compact = false,
  side = "bottom",
  size,
  variant,
}: Props) {
  return (
    <>
      <Drawer>
        {compact ? (
          <DrawerTrigger
            render={(props) => (
              <ContactIconTrigger {...props} className="sm:hidden" />
            )}
          />
        ) : null}
        <DrawerTrigger
          render={(props) => (
            <ContactTrigger
              {...props}
              className={compact ? "max-sm:hidden md:hidden" : "md:hidden"}
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
                {/* The anchor still navigates (mailto, new tab, download) while Close dismisses the drawer. Close gives a non-button `role="button"`; dropping it keeps the row a link. */}
                <DrawerClose
                  nativeButton={false}
                  render={({ role: _button, ...props }) => (
                    <ContactRowLink {...props} channel={channel} />
                  )}
                />
              </li>
            ))}
          </ul>
        </DrawerContent>
      </Drawer>
      {/* Not modal: a modal menu measures the page for its backdrop and locks the scroll before its first frame, which cost 100+ ms on a long page. Outside click and Esc still close it. */}
      <DropdownMenu modal={false}>
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
