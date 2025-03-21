import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';
import { ApiError, ApiErrorDetail, ApiResponse } from '@/types/api';
import { useUserHandler } from '@/store/UserHandler';
import { GOAT_INDEX_API_URL } from '@/config/api_urls';

type ServiceType = 'auth' | 'data' | 'wallet' | 'goatIndex';

export class ApiClient {
  private authClient: AxiosInstance;
  private dataClient: AxiosInstance;
  private walletClient: AxiosInstance;
  private goatIndexClient: AxiosInstance;

  constructor() {
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

    // Create Axios instances for all services
    this.authClient = this.createClient(authServiceUrl);
    this.dataClient = this.createClient(dataServiceUrl);
    this.walletClient = this.createClient(walletServiceUrl);
    this.goatIndexClient = this.createClient(goatIndexServiceUrl);
  }

  /**
   * Creates an Axios client with common configuration, the auth header interceptor,
   * and axios-retry settings.
   */
  private createClient(baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach the latest auth token from the Zustand store to every request.
    client.interceptors.request.use(
      (config) => {
        const token = useUserHandler.getState().authToken;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

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
   *  - Checks for token expiration errors.
   *  - If detected, calls refetchAPI from the Zustand store and reattempts the request once.
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
        if (!retryAttempted && this.isTokenExpiredError(error)) {
          retryAttempted = true;
          await useUserHandler.getState().updateAuthToken();
          continue;
        }
        return this.handleError(error, service);
      }
    }
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

          if (status >= 500) {
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

          if (status >= 500) {
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

  async get<T>(
    url: string,
    params?: Record<string, any>,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);
    return this.request<T>(() => client.get<T>(url, { params }), service);
  }

  async post<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);
    return this.request<T>(() => client.post<T>(url, data), service);
  }

  async put<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);
    return this.request<T>(() => client.put<T>(url, data), service);
  }

  async patch<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);
    return this.request<T>(() => client.patch<T>(url, data), service);
  }

  async delete<T>(
    url: string,
    service: ServiceType = 'auth'
  ): Promise<ApiResponse<T> | ApiError> {
    const client = this.getClient(service);
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
}

// Export a singleton instance (or export the class and create instances as needed)
export const apiClient = new ApiClient();
