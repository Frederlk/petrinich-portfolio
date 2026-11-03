// Strips the protocol and a trailing slash so a link can be shown as plain text.
export const bare = (url: string) =>
  url.replace(/^(https?:\/\/|mailto:)/, "").replace(/\/$/, "");
