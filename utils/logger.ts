import { Logger } from "tslog";

import { env } from "~/env";

const EnvironmentToLevel = {
  DEV: 2,
  LOCAL: 0,
  PROD: 4,
} satisfies Record<typeof env.NEXT_PUBLIC_ENV, number>;

const logger = new Logger({
  // tslog v5 masks nothing by default — this list must stay explicit or credentials start landing in logs.
  mask: {
    keys: [
      "password",
      "passwordConfirmation",
      "email",
      "credentials",
      "credential",
    ],
  },
  minLevel: EnvironmentToLevel[env.NEXT_PUBLIC_ENV],
  pretty: {
    // Per-level emoji icons dropped in the v5 upgrade: `overwrite.addPlaceholders` was removed and `pretty.template` only resolves tslog's built-in tokens, so a custom `{{icon}}` would need a hand-written LogFormatter replacing the built-in colorized renderer.
    template: "[{{logLevelName}}] ", // default with exclusion of {{filePathWithLine}}`
    timeZone: env.NEXT_PUBLIC_ENV === "DEV" ? "UTC" : "local",
  },
});
export default logger;
