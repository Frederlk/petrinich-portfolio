// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// A thrown value is `unknown`: keep an `Error` as is, wrap anything else so callers can always read `.message`.
const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error), { cause: error });

// Main wrapper function
export async function tryCatch<T>(promise: Promise<T>): Promise<Result<T>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

// Synchronous variant — wraps a thunk that may throw
export function tryCatchSync<T>(fn: () => T): Result<T> {
  try {
    return { data: fn(), error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}
