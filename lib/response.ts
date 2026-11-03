// Plain-text responses of the static route handlers; JSON ones use Response.json.
const text = (type: string) => (body: string) =>
  new Response(body, { headers: { "content-type": `${type}; charset=utf-8` } });

export const markdownResponse = text("text/markdown");
export const textResponse = text("text/plain");
