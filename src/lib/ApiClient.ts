import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';
import { ApiError, ApiErrorDetail, ApiResponse } from '@/types/api';
import { GOAT_INDEX_API_URL } from '@/config/api_urls';
import { useUserHandler } from '@/store/UserHandler';

type ServiceType = 'auth' | 'data' | 'wallet' | 'goatIndex' | 'local';

interface ApiClientOptions {
  authToken?: string | null;
  enableLogging?: boolean;
  isServer?: boolean;
}

export class ApiClient {
  private authClient: AxiosInstance;
  private dataClient: AxiosInstance;
  private walletClient: AxiosInstance;
  private goatIndexClient: AxiosInstance;
  private localClient: AxiosInstance;
  private options: ApiClientOptions;

  constructor(options: ApiClientOptions = {}) {
    const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
    const dataServiceUrl = process.env.NEXT_PUBLIC_DATA_SERVICE_URL;
    const walletServiceUrl = process.env.NEXT_PUBLIC_WALLET_SERVICE_URL;
    const goatIndexServiceUrl = GOAT_INDEX_API_URL;

    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL environment variable is not defined');
    }
    if (!dataServiceUrl) {
      throw new Error('DATA_SERVICE_URL environment variable is not defined');
    }
    if (!walletServiceUrl) {
      throw new Error('WALLET_SERVICE_URL environment variable is not defined');
    }

    this.options = {
      ...options,
      enableLogging: options.enableLogging ?? true,
      isServer: options.isServer ?? typeof window === 'undefined',
    };

    // Create Axios instances for all services
    this.authClient = this.createClient(authServiceUrl, options.authToken);
    this.dataClient = this.createClient(dataServiceUrl, options.authToken);
    this.walletClient = this.createClient(walletServiceUrl, options.authToken);
    this.goatIndexClient = this.createClient(
      goatIndexServiceUrl,
      options.authToken
    );
    // local NextJS API routes
    this.localClient = this.createClient('', options.authToken);
  }

  /**
   * Creates an Axios client with common configuration, the auth header interceptor,
   * and axios-retry settings.
   */
  private createClient(
    baseURL: string,
    authToken?: string | null
  ): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: baseURL ? 10000 : 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    if (typeof window !== 'undefined') {
      client.interceptors.request.use(
        (config) => {
          const token = authToken || useUserHandler.getState().authToken;
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );
    } else if (authToken) {
      // For server-side, directly set the token if provided
      client.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }

    // Add request logging interceptors for server-side
    if (this.options.isServer && this.options.enableLogging) {
      // Request interceptor for logging
      client.interceptors.request.use(
        (config) => {
          const requestId = this.generateRequestId();
          config.headers = config.headers || {};
          config.headers['X-Request-ID'] = requestId;

          console.log(`[SERVER] [${requestId}] Request:`, {
            method: config.method?.toUpperCase(),
            url: this.getFullUrl(config),
            headers: this.sanitizeHeaders(config.headers),
            params: config.params,
            data: this.truncateData(config.data),
            timestamp: new Date().toISOString(),
          });

          return config;
        },
        (error) => {
          console.error('[SERVER] Request Error:', error);
          return Promise.reject(error);
        }
      );

      // Response interceptor for logging
      client.interceptors.response.use(
        (response) => {
          const requestId = response.config.headers?.['X-Request-ID'];
          const duration = this.calculateDuration(response.config);

          console.log(`[SERVER] [${requestId}] Response: ${response.status}`, {
            status: response.status,
            statusText: response.statusText,
            headers: this.sanitizeHeaders(response.headers),
            data: this.truncateData(response.data),
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });

          return response;
        },
        (error) => {
          const requestId = error.config?.headers?.['X-Request-ID'];
          const duration = this.calculateDuration(error.config);

          console.error(
            `[SERVER] [${requestId}] Response Error: ${error.response?.status || 'Network Error'}`,
            {
              status: error.response?.status,
              statusText: error.response?.statusText,
              headers: error.response
                ? this.sanitizeHeaders(error.response.headers)
                : {},
              data: error.response
                ? this.truncateData(error.response.data)
                : {},
              duration: `${duration}ms`,
              timestamp: new Date().toISOString(),
              message: error.message,
              stack: this.options.enableLogging ? error.stack : undefined,
            }
          );

          return Promise.reject(error);
        }
      );
    }

    // Retry on network errors or server errors (>=500)
    axiosRetry(client, {
      retries: 3,
      retryDelay: (retryCount) => {
        const delay = axiosRetry.exponentialDelay(retryCount);
        console.log(
          `Retrying request... Attempt ${retryCount}, waiting ${delay}ms`
        );
        return delay;
      },
      retryCondition: (error) => {
        if (error.code === 'ECONNABORTED' || axiosRetry.isNetworkError(error)) {
          return true;
        }
        return !!(error.response && error.response.status >= 500);
      },
    });

    return client;
  }

  /**
   * Helper methods for logging
   */
  private generateRequestId(): string {
    return `req_${Math.random().toString(36).substring(2, 10)}`;
  }

  private getFullUrl(config: any): string {
    const baseURL = config.baseURL || '';
    const url = config.url || '';
    return url.startsWith('http') ? url : `${baseURL}${url}`;
  }

  private sanitizeHeaders(headers: any): any {
    if (!headers) return {};

    const sanitized = { ...headers };
    // Remove sensitive information
    if (sanitized.Authorization) {
      sanitized.Authorization = sanitized.Authorization.replace(
        /Bearer\s+(.{4}).*(.{4})$/,
        'Bearer $1...$2'
      );
    }
    return sanitized;
  }

  private truncateData(data: any): any {
    if (!data) return data;

    try {
      const stringified = JSON.stringify(data);
      if (stringified.length > 500) {
        return JSON.parse(stringified.substring(0, 500) + '... [truncated]');
      }
      return data;
    } catch (e) {
      return '[Unserializable data]';
    }
  }

  private calculateDuration(config: any): number {
    const startTime = config.headers?.['X-Request-Start-Time'];
    if (!startTime) return 0;
    return Date.now() - parseInt(startTime);
  }

  /**
   * Returns the appropriate Axios client based on the service type.
   */
  private getClient(service: ServiceType): AxiosInstance {
    switch (service) {
      case 'auth':
        return this.authClient;
      case 'data':
        return this.dataClient;
      case 'wallet':
        return this.walletClient;
      case 'goatIndex':
        return this.goatIndexClient;
      case 'local':
        return this.localClient;
      default:
        throw new Error(`Unsupported service type: ${service}`);
    }
  }

  /**
   * A helper to check if the error indicates that the token has expired.
   */
  private isTokenExpiredError(error: AxiosError): boolean {
    if (error.response && error.response.data) {
      const data = error.response.data as any;
      // For data service errors
      if (data.error && data.error === 'Invalid or expired token') return true;
      if (data.detail && data.detail === 'Token has expired') return true;
      // For auth service errors. We only care about the first error as per Django DRF error struct
      if (data.errors && Array.isArray(data.errors)) {
        const firstError = data.errors[0];
        if (
          firstError.detail === 'Token has expired' ||
          firstError.code === 'Invalid or expired token'
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Generic request handler that:
   *  - Executes the provided request function.
   *  - Handles token-related logic based on environment
   */
  private async request<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    service: ServiceType
  ): Promise<ApiResponse<T> | ApiError> {
    let retryAttempted = false;
    while (true) {
      try {
        const response = await requestFn();
        return this.handleResponse(response);
      } catch (err) {
        const error = err as AxiosError;

        // On client side, use Zustand store for token refresh
        if (typeof window !== 'undefined') {
          if (!retryAttempted && this.isTokenExpiredError(error)) {
            retryAttempted = true;
            const updatedToken = await this.refreshTokenOnClient();

            // Retry with new token if refresh was successful
            if (updatedToken) {
              continue;
            }
          }
        }

        return this.handleError(error, service);
      }
    }
  }

  /**
   * Refresh token method for client-side
   * This is a placeholder - implement actual token refresh logic in your Zustand store
   */
  private async refreshTokenOnClient(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      // Implement your token refresh logic here
      // This might involve calling a refresh token endpoint or using Zustand store method
      console.warn('Token refresh not implemented');
      return null;
    }
    return null;
  }

  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return { success: true, data: response.data };
  }

  /**
   * Handles errors for both auth and data services.
   */
  private handleError(error: AxiosError, service: ServiceType): ApiError {
    if (error.response) {
      const { status, data } = error.response;

      if (service === 'auth') {
        if (
          data &&
          typeof data === 'object' &&
          'type' in data &&
          'errors' in data
        ) {
          const apiError: ApiError = {
            success: false,
            type: data.type as string,
            errors: data.errors as ApiErrorDetail[],
            statusCode: status,
          };

          if (status >= 500 && typeof window !== 'undefined') {
            toast.error(apiError.errors.map((e) => e.detail).join('\n'));
          }
          return apiError;
        }
        return {
          success: false,
          type: 'unknown_error',
          errors: [
            {
              code: 'unknown',
              detail: 'An unexpected error occurred.',
              attr: null,
            },
          ],
          statusCode: status,
        };
      } else if (service === 'data') {
        if (data && typeof data === 'object' && 'error' in data) {
          const detail = (data as any).error as string;
          const apiError: ApiError = {
            success: false,
            type: 'data_error',
            errors: [
              {
                code: 'error',
                detail,
                attr: null,
              },
            ],
            statusCode: status,
          };

          if (status >= 500 && typeof window !== 'undefined') {
            toast.error(detail);
          }
          return apiError;
        }
        return {
          success: false,
          type: 'unknown_error',
          errors: [
            {
              code: 'unknown',
              detail: 'An unexpected error occurred.',
              attr: null,
            },
          ],
          statusCode: status,
        };
      }
    }

    // No response (network error)
    return {
      success: false,
      type: 'network_error',
      errors: [
        {
          code: 'network',
          detail: error.message || 'Network error',
          attr: null,
        },
      ],
    };
  }

  // Existing request methods remain the same
  async get<T>(
    url: string,
    params?: Record<string, any>,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);

    // Add request start time for duration calculation
    if (this.options.isServer && this.options.enableLogging) {
      client.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        config.headers['X-Request-Start-Time'] = Date.now().toString();
        return config;
      });
    }

    return this.request<T>(() => client.get<T>(url, { params }), service);
  }

  async post<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);

    // Add request start time for duration calculation
    if (this.options.isServer && this.options.enableLogging) {
      client.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        config.headers['X-Request-Start-Time'] = Date.now().toString();
        return config;
      });
    }

    return this.request<T>(() => client.post<T>(url, data), service);
  }

  async put<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);

    // Add request start time for duration calculation
    if (this.options.isServer && this.options.enableLogging) {
      client.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        config.headers['X-Request-Start-Time'] = Date.now().toString();
        return config;
      });
    }

    return this.request<T>(() => client.put<T>(url, data), service);
  }

  async patch<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);

    // Add request start time for duration calculation
    if (this.options.isServer && this.options.enableLogging) {
      client.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        config.headers['X-Request-Start-Time'] = Date.now().toString();
        return config;
      });
    }

    return this.request<T>(() => client.patch<T>(url, data), service);
  }

  async delete<T>(
    url: string,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);

    // Add request start time for duration calculation
    if (this.options.isServer && this.options.enableLogging) {
      client.interceptors.request.use((config) => {
        config.headers = config.headers || {};
        config.headers['X-Request-Start-Time'] = Date.now().toString();
        return config;
      });
    }

    return this.request<T>(() => client.delete<T>(url), service);
  }

  // Type checker functions
  static isApiResponse<T>(response: any): response is ApiResponse<T> {
    return response && response.success === true;
  }

  static isApiError(response: any): response is ApiError {
    return (
      response && response.success === false && Array.isArray(response.errors)
    );
  }

  /**
   * Enable or disable logging
   */
  setLogging(enabled: boolean): void {
    this.options.enableLogging = enabled;
  }
}

// Client-side singleton
export const apiClient = new ApiClient();

// Server-side method to create an API client with a specific token
export function createServerApiClient(
  authToken: string | null,
  enableLogging = true
) {
  return new ApiClient({
    authToken,
    enableLogging,
    isServer: true,
  });
}
