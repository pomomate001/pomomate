/**
 * API error abstraction.
 *
 * A single, typed error shape the whole app can catch and reason about,
 * decoupled from the underlying transport (fetch).
 */
export type ApiErrorKind =
  | 'network' // request never completed (offline, DNS, CORS, timeout)
  | 'timeout' // request aborted after exceeding the deadline
  | 'http' // server responded with a non-2xx status
  | 'parse' // response body could not be parsed
  | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status code, when available. */
  readonly status?: number;
  /** Parsed error payload from the server, when available. */
  readonly data?: unknown;
  /** Original underlying error, when wrapping one. */
  readonly cause?: unknown;

  constructor(
    message: string,
    kind: ApiErrorKind,
    options: { status?: number; data?: unknown; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.data = options.data;
    this.cause = options.cause;
  }

  get isNetworkError(): boolean {
    return this.kind === 'network' || this.kind === 'timeout';
  }

  /** True for 401/403 — useful for auth refresh flows (implemented in M08). */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}
