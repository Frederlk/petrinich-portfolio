type ErrorConfig = {
  description: string;
  retryable: boolean;
  severity: "error" | "warning";
  title: string;
};

const errorConfigs: Record<string, ErrorConfig> = {
  already_exists: {
    description: "A resource with this name already exists.",
    retryable: false,
    severity: "warning",
    title: "Already exists",
  },
  bad_gateway: {
    description: "The server is temporarily unavailable. Try again.",
    retryable: true,
    severity: "error",
    title: "Service unavailable",
  },
  bad_request: {
    description: "The request was invalid. Check your input and try again.",
    retryable: false,
    severity: "warning",
    title: "Invalid request",
  },
  conflict: {
    description: "Someone else changed this resource. Refresh and try again.",
    retryable: false,
    severity: "warning",
    title: "Conflict",
  },
  connection_error: {
    description:
      "Could not connect to the server. Check your internet connection.",
    retryable: true,
    severity: "warning",
    title: "Connection failed",
  },
  database_error: {
    description: "A database error occurred. Please try again.",
    retryable: true,
    severity: "error",
    title: "Database error",
  },
  forbidden: {
    description: "You don't have permission to access this resource.",
    retryable: false,
    severity: "error",
    title: "Access denied",
  },
  gateway_timeout: {
    description: "The server took too long to respond. Please try again.",
    retryable: true,
    severity: "warning",
    title: "Gateway timed out",
  },
  input_validation_failed: {
    description: "Some fields are invalid. Please check your input.",
    retryable: false,
    severity: "warning",
    title: "Validation error",
  },
  internal_server_error: {
    description: "An unexpected server error occurred. Please try again.",
    retryable: true,
    severity: "error",
    title: "Something went wrong",
  },

  // Permanent errors
  not_found: {
    description:
      "This resource may have been deleted or you don't have access to it.",
    retryable: false,
    severity: "warning",
    title: "Not found",
  },
  output_validation_failed: {
    description:
      "The server returned an unexpected response. Please try again.",
    retryable: true,
    severity: "error",
    title: "Unexpected response",
  },
  service_unavailable: {
    description:
      "The service is temporarily unavailable. Please try again later.",
    retryable: true,
    severity: "warning",
    title: "Service unavailable",
  },
  // Retryable errors
  timeout: {
    description: "The server took too long to respond. Please try again.",
    retryable: true,
    severity: "warning",
    title: "Request timed out",
  },
  too_many_requests: {
    description:
      "You're sending requests too quickly. Wait a moment and try again.",
    retryable: true,
    severity: "warning",
    title: "Too many requests",
  },
  unauthorized: {
    description: "You need to sign in to access this resource.",
    retryable: false,
    severity: "error",
    title: "Unauthorized",
  },
  unprocessable_content: {
    description: "The server could not process this request.",
    retryable: false,
    severity: "warning",
    title: "Unprocessable content",
  },
  validation_error: {
    description: "Some fields are invalid. Please check your input.",
    retryable: false,
    severity: "warning",
    title: "Validation error",
  },
};

const defaultConfig: ErrorConfig = {
  description: "Something failed. Try again.",
  retryable: true,
  severity: "error",
  title: "An unexpected error occurred",
};

export function getErrorConfig(code: string | null): ErrorConfig {
  if (code === null || code === "") return defaultConfig;
  return errorConfigs[code] ?? defaultConfig;
}

export function isRetryable(code: string | null): boolean {
  return getErrorConfig(code).retryable;
}
