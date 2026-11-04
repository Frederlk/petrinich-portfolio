"use client";

import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { contactRowClass } from "~/components/layout/contact-row";
import { NAV_ITEMS, navTransition } from "~/components/layout/nav-items";
import { ArrowSlide } from "~/components/motion/arrow-slide";

import { ctaLinkVariants } from "~/ui/cta-link";
import { Drawer, DrawerContent, DrawerTrigger } from "~/ui/drawer";

import { cn } from "~/lib/cn";

import type { ComponentProps } from "react";

function MenuButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      {...props}
      aria-label="Menu"
      className={cn(
        ctaLinkVariants({ size: "icon", variant: "outline" }),
        className
      )}
      type="button"
    >
      <ListIcon aria-hidden className="size-4.5" />
    </button>
  );
}

// The rows mount only while the drawer is open, after hydration, so reading the path here needs no Suspense boundary. The current section is marked as in the desktop links, and each link takes the same slide direction.
function NavRows({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <ul>
      {NAV_ITEMS.map((item) => {
        const current =
          !item.href.includes("#") && pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              aria-current={current ? "page" : undefined}
              className={cn(
                contactRowClass,
                "type-button",
                current && "border-l-2 border-l-primary-container"
              )}
              href={item.href}
              onClick={onNavigate}
              transitionTypes={navTransition(pathname, item.href)}
            >
              <span className="flex-1">{item.label}</span>
              <ArrowSlide className="shrink-0" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// The header has no nav links below md, so this bottom drawer holds them there, beside the contact drawer.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger render={(props) => <MenuButton {...props} />} />
        <DrawerContent title="Menu">
          <NavRows
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
