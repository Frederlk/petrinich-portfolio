import { Fragment } from "react";

// A heading's text as one masked span per word, for a `.reveal-words` parent (styles/motion.css). The words and the spaces between them stay plain text, so the heading reads, copies and indexes exactly as before.
export function SplitWords({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    // A heading can repeat a word, so the position is the only stable key.
    // oxlint-disable-next-line react/no-array-index-key
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span>
        <span style={{ "--i": i }}>{word}</span>
      </span>
    </Fragment>
  ));
}
