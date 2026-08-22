/**
 * Request / response types and interceptor contracts for the HTTP client.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  /** Path appended to the client's baseURL, or an absolute URL. */
  url: string;
  method: HttpMethod;
  /** Query string parameters. */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Parsed request body — serialised to JSON unless it is a string. */
  body?: unknown;
  headers?: Record<string, string>;
  /** Per-request timeout in milliseconds (overrides client default). */
  timeoutMs?: number;
  /** Escape hatch to skip auth token injection for public endpoints. */
  skipAuth?: boolean;
  /** Allows passing an AbortSignal to cancel the request. */
  signal?: AbortSignal;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Runs before the request leaves the client. May mutate/return a new config
 * (e.g. add auth headers). Async to allow token refresh, etc. (M08).
 */
export type RequestInterceptor = (
  config: RequestConfig,
) => RequestConfig | Promise<RequestConfig>;

/**
 * Runs after a successful response is parsed. May transform the response.
 */
export type ResponseInterceptor = (
  response: ApiResponse,
) => ApiResponse | Promise<ApiResponse>;

/**
 * Returns the current auth token (or null). Implementation lands in M08;
 * M01 only defines the injection point.
 */
export type AuthTokenProvider = () =>
  | string
  | null
  | Promise<string | null>;

export interface HttpClientOptions {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}
