import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Required in production builds: an unset value defaulted to LOCAL, so a production build that forgot PROD silently shipped with the LOCAL log level.
    NEXT_PUBLIC_ENV:
      process.env.NODE_ENV === "production"
        ? z.enum(["PROD", "DEV", "LOCAL"])
        : z.enum(["PROD", "DEV", "LOCAL"]).default("LOCAL"),
  },
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NODE_ENV: process.env.NODE_ENV,
    SITE_URL: process.env.SITE_URL,
  },
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Canonical origin for metadata, sitemap, robots and structured data. Unset falls back to the current public address in lib/site-url.ts.
    SITE_URL: z.url().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds. Refuses to skip in production runtime — set `NODE_ENV` to anything
   * other than `production` (or unset `SKIP_ENV_VALIDATION`) for that environment.
   */
  skipValidation: (() => {
    const skip = (process.env.SKIP_ENV_VALIDATION ?? "") !== "";
    if (skip && process.env.NODE_ENV === "production") {
      throw new Error(
        "SKIP_ENV_VALIDATION must not be set in production. Unset it or fix the failing env var."
      );
    }
    return skip;
  })(),
});

// The comparison and the import sit in one module so the bundler folds the condition and drops the import from production builds; across a module boundary it does not.
export const loadFpsMeter =
  process.env.NODE_ENV === "development"
    ? async () => await import("~/components/dev/fps-meter")
    : null;
