import "react";

declare module "react" {
  // A custom property is how a runtime value reaches `style` here (`style={{ "--x-w": … }}` + `w-(--x-w)`, the channel `shadcn/no-inline-styles` allows); React's own type has no `--*` keys, which otherwise costs an `as CSSProperties` cast per site.
  interface CSSProperties {
    // oxlint-disable-next-line typescript/consistent-indexed-object-style -- a module augmentation merges only into an interface; a `Record` alias would declare a new type instead of extending React's
    [key: `--${string}`]: string | number | undefined;
  }
}
