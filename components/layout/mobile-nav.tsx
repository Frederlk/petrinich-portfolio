"use client";

import { ListIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { NAV_ITEMS } from "~/components/layout/nav-items";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

// The Stitch header has no menu below md. The round 32px chip that sits at the right edge there is this menu's button on small screens, so the footprint stays the reference's and the links stay reachable.
export function MobileNav() {
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              aria-label="Menu"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary"
              type="button"
            />
          }
        >
          <ListIcon aria-hidden className="size-4.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" indicator="none">
          {NAV_ITEMS.map((item) => (
            <DropdownMenuItem
              key={item.href}
              render={<Link href={item.href} />}
              variant="nav"
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
