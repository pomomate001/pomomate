/**
 * Barrel export for the API client abstraction.
 */
export { HttpClient } from './httpClient';
export { apiClient } from './client';
export { ApiError } from './errors';
export type { ApiErrorKind } from './errors';
export type {
  ApiResponse,
  AuthTokenProvider,
  HttpClientOptions,
  HttpMethod,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';
