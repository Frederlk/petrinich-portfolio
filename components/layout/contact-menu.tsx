import { ContactMenuButton } from "~/components/layout/contact-menu-button";

import { contactChannels } from "~/lib/contact";

import type { ComponentProps } from "react";

// Server side of the contact menu: it reads the channels so the client button never imports the content files.
export function ContactMenu(
  props: Omit<ComponentProps<typeof ContactMenuButton>, "channels">
) {
  return <ContactMenuButton channels={contactChannels} {...props} />;
}
