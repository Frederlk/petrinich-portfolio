import { RichText } from "~/components/rich-text";

import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

// Plain text children go through RichText, so technology and project names in an article link like they do in the content strings. Elements (a link, `code`) pass through untouched.
const rich = (children: ReactNode): ReactNode =>
  typeof children === "string" ? <RichText>{children}</RichText> : children;

type Props = { children?: ReactNode };

// The article of a project page. The page wraps it in one column; the gap above a heading is larger than the gap below it, so a heading binds to the text under it (docs/research/spacing-2026.md).
const components: MDXComponents = {
  a: ({ children, href }: Props & { href?: string }) => (
    <a
      className="rich-link"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: Props) => (
    <blockquote className="reveal my-space-lg border-l-2 border-primary-container pl-space-md type-body text-on-surface">
      {children}
    </blockquote>
  ),
  code: ({ children }: Props) => (
    <code className="type-code text-on-surface">{children}</code>
  ),
  h2: ({ children }: Props) => (
    <h2 className="reveal mt-space-xl mb-space-sm type-h2 text-on-surface first:mt-0 sm:mt-space-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }: Props) => (
    <h3 className="reveal mt-space-lg mb-space-xs type-h3 text-on-surface">
      {children}
    </h3>
  ),
  li: ({ children }: Props) => <li>{rich(children)}</li>,
  ol: ({ children }: Props) => (
    <ol className="reveal my-space-md list-decimal space-y-space-xs pl-space-lg type-body text-secondary">
      {children}
    </ol>
  ),
  p: ({ children }: Props) => (
    <p className="reveal my-space-md type-body text-secondary first:mt-0">
      {rich(children)}
    </p>
  ),
  strong: ({ children }: Props) => (
    <strong className="font-semibold text-on-surface">{children}</strong>
  ),
  ul: ({ children }: Props) => (
    <ul className="reveal list-square my-space-md space-y-space-xs type-body text-secondary">
      {children}
    </ul>
  ),
};

// Required by @next/mdx for the App Router.
export function useMDXComponents(overrides: MDXComponents): MDXComponents {
  return { ...components, ...overrides };
}
