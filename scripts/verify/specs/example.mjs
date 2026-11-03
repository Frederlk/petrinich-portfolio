// Format example: copy it, mark the elements with `data-v="<section>-<part>"` and replace `body` with those selectors.
export default /** @satisfies {import("../lib/measure.mjs").Spec} */ ({
  name: "example: body fills the viewport",
  url: "/",
  selectors: ["body"],
  expect(m, { width }) {
    const body = m.body;
    return [
      { metric: "body width", target: width, measured: body.w },
      {
        metric: "body textTransform",
        target: "none",
        measured: body.textTransform,
      },
    ];
  },
});
