/**
 * PomoMate — Abstract HTTP Client
 *
 * A thin, fetch-based client that provides:
 *   - get / post / put / delete / patch helpers
 *   - request & response interceptor pipelines
 *   - a pluggable auth-token injection hook (implemented in M08)
 *   - unified error handling via ApiError
 *   - timeout support via AbortController
 *
 * NOTE (M01): This is transport plumbing only. Concrete endpoints (auth,
 * rooms, tasks, ...) are implemented against this client in M03.
 */
import { ApiError } from './errors';
import type {
  ApiResponse,
  AuthTokenProvider,
  HttpClientOptions,
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
} from './types';

const DEFAULT_TIMEOUT_MS = 15_000;

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeoutMs: number;

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private authTokenProvider: AuthTokenProvider | null = null;

  constructor(options: HttpClientOptions) {
    this.baseURL = options.baseURL.replace(/\/$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.defaultHeaders,
    };
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /* ------------------------------ configuration ------------------------- */

  /**
   * Registers the function used to obtain the auth token for each request.
   * Wired up in M08. Returns a disposer to unregister.
   */
  setAuthTokenProvider(provider: AuthTokenProvider | null): void {
    this.authTokenProvider = provider;
  }

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(
        (i) => i !== interceptor,
      );
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(
        (i) => i !== interceptor,
      );
    };
  }

  /* ------------------------------ HTTP verbs ---------------------------- */

  get<T = unknown>(
    url: string,
    config: Partial<Omit<RequestConfig, 'url' | 'method'>> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  post<T = unknown>(
    url: string,
    body?: unknown,
    config: Partial<Omit<RequestConfig, 'url' | 'method' | 'body'>> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', body });
  }

  put<T = unknown>(
    url: string,
    body?: unknown,
    config: Partial<Omit<RequestConfig, 'url' | 'method' | 'body'>> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', body });
  }

  patch<T = unknown>(
    url: string,
    body?: unknown,
    config: Partial<Omit<RequestConfig, 'url' | 'method' | 'body'>> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', body });
  }

  delete<T = unknown>(
    url: string,
    config: Partial<Omit<RequestConfig, 'url' | 'method'>> = {},
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  /* ------------------------------ core ---------------------------------- */

  async request<T = unknown>(initialConfig: RequestConfig): Promise<ApiResponse<T>> {
    let config = await this.applyRequestInterceptors(initialConfig);
    config = await this.injectAuthToken(config);

    const url = this.buildUrl(config.url, config.params);
    const { signal, cleanup } = this.buildAbortSignal(
      config.signal,
      config.timeoutMs ?? this.timeoutMs,
    );

    let rawResponse: Response;
    try {
      rawResponse = await fetch(url, {
        method: config.method,
        headers: { ...this.defaultHeaders, ...config.headers },
        body: this.serialiseBody(config.body),
        signal,
      });
    } catch (error) {
      cleanup();
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', 'timeout', { cause: error });
      }
      throw new ApiError('Network request failed', 'network', { cause: error });
    }
    cleanup();

    const data = await this.parseBody(rawResponse);

    if (!rawResponse.ok) {
      throw new ApiError(
        `Request failed with status ${rawResponse.status}`,
        'http',
        { status: rawResponse.status, data },
      );
    }

    const response: ApiResponse<T> = {
      data: data as T,
      status: rawResponse.status,
      headers: rawResponse.headers,
    };

    return (await this.applyResponseInterceptors(response)) as ApiResponse<T>;
  }

  /* ------------------------------ helpers ------------------------------- */

  private async applyRequestInterceptors(
    config: RequestConfig,
  ): Promise<RequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async applyResponseInterceptors(
    response: ApiResponse,
  ): Promise<ApiResponse> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async injectAuthToken(config: RequestConfig): Promise<RequestConfig> {
    if (config.skipAuth || !this.authTokenProvider) {
      return config;
    }
    const token = await this.authTokenProvider();
    if (!token) {
      return config;
    }
    return {
      ...config,
      headers: { ...config.headers, Authorization: `Bearer ${token}` },
    };
  }

  private buildUrl(
    path: string,
    params?: RequestConfig['params'],
  ): string {
    const base = /^https?:\/\//i.test(path)
      ? path
      : `${this.baseURL}/${path.replace(/^\//, '')}`;

    if (!params) return base;

    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&');

    if (!query) return base;
    return base.includes('?') ? `${base}&${query}` : `${base}?${query}`;
  }

  private serialiseBody(body: unknown): string | undefined {
    if (body === undefined || body === null) return undefined;
    if (typeof body === 'string') return body;
    return JSON.stringify(body);
  }

  private async parseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    if (response.status === 204 || contentType === '') return null;

    try {
      if (contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      throw new ApiError('Failed to parse response body', 'parse', {
        status: response.status,
        cause: error,
      });
    }
  }

  private buildAbortSignal(
    external: AbortSignal | undefined,
    timeoutMs: number,
  ): { signal: AbortSignal; cleanup: () => void } {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (external) {
      if (external.aborted) controller.abort();
      else external.addEventListener('abort', onExternalAbort);
    }

    const cleanup = () => {
      clearTimeout(timer);
      external?.removeEventListener('abort', onExternalAbort);
    };

    return { signal: controller.signal, cleanup };
  }
}
