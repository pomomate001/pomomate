/**
 * Shared, pre-configured HTTP client instance.
 *
 * Feature services (M03) import `apiClient` rather than constructing their own
 * client, so interceptors and the auth-token provider are configured once.
 */
import { config } from '../../config';
import { HttpClient } from './httpClient';

export const apiClient = new HttpClient({
  baseURL: config.apiUrl,
});
