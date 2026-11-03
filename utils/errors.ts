import { type ZodError, z } from "zod";

import { isNonEmptyString } from "~/utils/is-non-empty-string";

export const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred.";
const MAX_ERROR_MESSAGE_LENGTH = 200;
const MAX_FIELD_ERRORS = 3;

export function getErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null;
  if ("code" in error && typeof error.code === "string") {
    return error.code.toLowerCase().replaceAll(/[\s]/g, "_");
  }
  return null;
}

const trimMessage = (msg: string): string =>
  msg.length > MAX_ERROR_MESSAGE_LENGTH
    ? `${msg.slice(0, MAX_ERROR_MESSAGE_LENGTH)}...`
    : msg;

// Joins field messages, capped at MAX_FIELD_ERRORS for better UX
const joinFieldErrors = (fieldErrors: string[]): string => {
  if (fieldErrors.length > MAX_FIELD_ERRORS) {
    const remaining = fieldErrors.length - MAX_FIELD_ERRORS;
    const displayed = fieldErrors.slice(0, MAX_FIELD_ERRORS);
    return trimMessage(
      `${displayed.join("; ")}; and ${remaining} more error${remaining > 1 ? "s" : ""}`
    );
  }

  return trimMessage(fieldErrors.join("; "));
};

/**
 * Type guard to check if an error is a ZodError instance
 */
const isZodError = (error: unknown): error is ZodError =>
  error instanceof z.ZodError;

// Any non-null object can be read key by key; every value is `unknown` until checked.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * React Hook Form FieldError structure
 */
type FieldError = {
  message?: string;
  type?: string;
  ref?: unknown;
};

/**
 * Type guard to check if error is react-hook-form's FieldErrors format
 * Example: { email: { message: 'Email is required', type: 'required' } }
 */
const isReactHookFormErrors = (
  error: unknown
): error is Record<string, FieldError> => {
  if (!isRecord(error)) return false;

  // Check if at least one property has the FieldError structure
  return Object.values(error).some(
    (value) => isRecord(value) && typeof value.message === "string"
  );
};

/**
 * Type guard to check if error is an ORPCError JSON structure
 * Example: { code: 'ALREADY_EXISTS', message: 'Resource already exists', data: {...} }
 */
const isORPCError = (
  error: unknown
): error is { code: string; message: string; data?: unknown } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  "message" in error &&
  typeof error.code === "string" &&
  typeof error.message === "string";

/**
 * Convert field path to readable field name
 * Example: ['contactInfo', 'email'] => 'Contact Info > Email'
 * Example: ['favoriteNumbers', 1] => 'Favorite Numbers #2'
 */
const getFieldName = (path: (string | number)[]): string => {
  if (path.length === 0) return "";

  return path
    .map((segment, index) => {
      if (typeof segment === "number") {
        return `#${segment + 1}`;
      }
      // Convert camelCase/snake_case to Title Case
      const formatted = segment
        .replaceAll(/([A-Z])/g, " $1")
        .replaceAll("_", " ")
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return index === 0 ? formatted : formatted;
    })
    .join(" > ");
};

/**
 * Prioritize the most user-friendly error message from multiple messages
 * Prefers custom messages over generic ones
 */
const selectBestMessage = (messages: string[]): string => {
  const [first] = messages;
  if (first === undefined) return "";
  if (messages.length === 1) return first;

  // Priority order:
  // 1. Messages with "required" (most actionable)
  // 2. Messages with specific field names or custom content
  // 3. Generic "Invalid" messages last

  const requiredMsg = messages.find((msg) =>
    msg.toLowerCase().includes("required")
  );
  if (requiredMsg !== undefined) return requiredMsg;

  const specificMsg = messages.find(
    (msg) =>
      !(
        msg.toLowerCase().startsWith("invalid") ||
        msg.toLowerCase().includes("expected")
      )
  );
  if (isNonEmptyString(specificMsg)) return specificMsg;

  // Fall back to first message
  return first;
};

/**
 * Format Zod validation errors using v4 APIs
 * Preserves custom error messages from schema definitions
 */
export function formatZodError(error: ZodError): string {
  // Use Zod v4's flattenError for structured field errors
  const flattened = z.flattenError(error);

  const fieldErrors: string[] = [];

  // Process field-specific errors
  // `ZodError` defaults its output type to `unknown`, which types `fieldErrors` as `{}`, so each value is narrowed here rather than declared.
  for (const [fieldPath, value] of Object.entries<unknown>(
    flattened.fieldErrors
  )) {
    const messages = Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === "string")
      : [];

    if (messages.length > 0) {
      const fieldName = getFieldName(fieldPath.split("."));
      // Select the most user-friendly message when multiple exist
      const message = selectBestMessage(messages);

      if (!message) continue;

      // If message already includes field context, use as-is
      // Otherwise, prepend field name for clarity
      if (
        message.toLowerCase().includes(fieldName.toLowerCase()) ||
        fieldPath === "" ||
        !fieldName
      ) {
        fieldErrors.push(message);
      } else {
        fieldErrors.push(`${fieldName}: ${message}`);
      }
    }
  }

  // Add form-level errors (not tied to specific fields)
  // For form-level errors with multiple messages, also select the best one
  if (flattened.formErrors.length > 0) {
    const bestFormError = selectBestMessage(flattened.formErrors);
    if (bestFormError) {
      fieldErrors.push(bestFormError);
    }
  }

  return joinFieldErrors(fieldErrors);
}

/**
 * Format react-hook-form FieldErrors
 * Converts form validation errors to user-friendly messages
 */
const formatReactHookFormErrors = (
  errors: Record<string, FieldError>
): string => {
  const fieldErrors: string[] = [];

  for (const [fieldName, fieldError] of Object.entries(errors)) {
    const message = fieldError?.message;
    if (!isNonEmptyString(message)) continue;

    const readableFieldName = getFieldName([fieldName]);

    // If message already includes field context with word boundary, use as-is
    // Use word boundary regex to avoid false matches (e.g., "id" in "invalid")
    const fieldNameRegex = new RegExp(
      `\\b${readableFieldName.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i"
    );
    const messageIncludesFieldName = fieldNameRegex.test(message);

    if (messageIncludesFieldName) {
      fieldErrors.push(message);
    } else if (
      message.includes("received undefined") ||
      (message.includes("expected") && message.includes("received"))
    ) {
      // Make generic messages more specific
      fieldErrors.push(`${readableFieldName} is required`);
    } else {
      fieldErrors.push(`${readableFieldName}: ${message}`);
    }
  }

  return joinFieldErrors(fieldErrors);
};

/**
 * Format a validation issue path to a readable string
 * Used by oRPC middleware for validation error formatting
 * Example: ["user", 0, "email"] => "user[0].email"
 */
export function formatIssuePath(path: readonly unknown[]): string {
  if (path.length === 0) return "root";

  return path.reduce<string>((result, entry, i) => {
    // Standard Schema allows a segment to be `{ key }` instead of a bare key.
    const segment =
      typeof entry === "object" && entry !== null && "key" in entry
        ? entry.key
        : entry;
    if (i === 0) return String(segment);
    if (typeof segment === "number") return `${result}[${segment}]`;
    return `${result}.${String(segment)}`;
  }, "");
}

interface ValidationIssueBase {
  message: string;
  path?: readonly unknown[] | undefined;
}

interface ValidationIssueWithCode extends ValidationIssueBase {
  code: string;
  expected?: unknown;
}

/**
 * Type guard to check if a validation issue has a code property
 */
export function hasIssueCode(
  issue: ValidationIssueBase
): issue is ValidationIssueWithCode {
  return "code" in issue && typeof issue.code === "string";
}

interface FormattedIssue {
  code?: string;
  expected?: unknown;
  message: string;
  path: string;
}

/**
 * Format a validation issue for logging/error response
 */
export function formatValidationIssue(
  issue: ValidationIssueBase
): FormattedIssue {
  const base: FormattedIssue = {
    message: issue.message,
    path: formatIssuePath(issue.path ?? []),
  };

  if (hasIssueCode(issue)) {
    base.code = issue.code;
    if (issue.code === "invalid_type" && issue.expected !== undefined) {
      base.expected = issue.expected;
    }
  }

  return base;
}

export const getErrorMessage = (error: unknown): string => {
  if (error === undefined || error === null || error === "") {
    return DEFAULT_ERROR_MESSAGE;
  }

  // Handle Zod validation errors with v4 APIs
  if (isZodError(error)) {
    const formatted = formatZodError(error);
    return formatted || DEFAULT_ERROR_MESSAGE;
  }

  // Handle react-hook-form FieldErrors format
  if (isReactHookFormErrors(error)) {
    const formatted = formatReactHookFormErrors(error);
    return formatted || DEFAULT_ERROR_MESSAGE;
  }

  // Handle ORPCError JSON structures
  if (isORPCError(error)) {
    return trimMessage(error.message);
  }

  // String error
  if (typeof error === "string") {
    return trimMessage(error);
  }

  // Native Error instance
  if (error instanceof Error) {
    return trimMessage(error.message || DEFAULT_ERROR_MESSAGE);
  }

  // Generic object error handling
  if (isRecord(error)) {
    // Try common properties
    const candidates = [
      error.message,
      error.error,
      error.serverError,
      error.fetchError,
      error.detail,
      error.description,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return trimMessage(candidate);
      }
    }

    // If validationErrors is an array of strings
    if (
      Array.isArray(error.validationErrors) &&
      error.validationErrors.every((v) => typeof v === "string")
    ) {
      return trimMessage(error.validationErrors.join("; "));
    }

    // If object values contain errors, recursively extract messages
    const nestedMessages = Object.values(error)
      .map((v) => getErrorMessage(v))
      .filter((msg) => msg !== DEFAULT_ERROR_MESSAGE);

    if (nestedMessages.length > 0) {
      return trimMessage(nestedMessages.join("; "));
    }
  }

  return DEFAULT_ERROR_MESSAGE;
};
