// The 404 and 500 pages open with the code in the project page's title style: display type and the vermilion dot.
export function StatusTitle({ code }: { code: string }) {
  return (
    <div className="mb-space-lg w-full overflow-hidden">
      <h1 className="type-display text-on-surface select-none" data-fit="code">
        {code}
        <span className="text-primary-container">.</span>
      </h1>
    </div>
  );
}
