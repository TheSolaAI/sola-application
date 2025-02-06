import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';
import { ApiError, ApiErrorDetail, ApiResponse } from '../types/api.ts';
import { useUserHandler } from '../models/UserHandler.ts';

type ServiceType = 'auth' | 'data';

export class ApiClient {
  private authClient: AxiosInstance;
  private dataClient: AxiosInstance;

  constructor() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const dataServiceUrl = process.env.DATA_SERVICE_URL;

    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL environment variable is not defined');
    }
    if (!dataServiceUrl) {
      throw new Error('DATA_SERVICE_URL environment variable is not defined');
    }

    this.authClient = this.createClient(authServiceUrl);
    this.dataClient = this.createClient(dataServiceUrl);
  }

  private createClient(baseURL: string): AxiosInstance {
    const client = axios.create({
      baseURL,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add a request interceptor that attaches the Authorization header dynamically.
    client.interceptors.request.use(
      (config) => {
        // Get the latest token from the Zustand store
        const authToken = useUserHandler.getState().authToken;
        if (authToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Configure axios-retry for network errors and server errors (status >= 500)
    axiosRetry(client, {
      retries: 3,
      retryDelay: (retryCount) => {
        const delay = axiosRetry.exponentialDelay(retryCount);
        console.log(
          `Retrying request... Attempt ${retryCount}, waiting ${delay}ms`,
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
   * Returns the appropriate Axios client based on service type.
   */
  private getClient(service: ServiceType): AxiosInstance {
    return service === 'auth' ? this.authClient : this.dataClient;
  }

  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return { success: true, data: response.data };
  }

  /**
   * Handle errors for both auth and data services.
   */
  private handleError(error: AxiosError, service: ServiceType): ApiError {
    if (error.response) {
      const { status, data } = error.response;

      if (service === 'auth') {
        // Auth service error structure:
        // {
        //   type: string,
        //   errors: [ { code: string, detail: string, attr: string | null } ]
        // }
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
        // Generic fallback for auth service errors
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
        // Data service error structure: { error: string }
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
        // Generic fallback for data service errors
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
    service: ServiceType = 'auth',
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const client = this.getClient(service);
      const response = await client.get<T>(url, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError, service);
    }
  }

  async post<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth',
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const client = this.getClient(service);
      const response = await client.post<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError, service);
    }
  }

  async put<T>(
    url: string,
    data: any,
    service: ServiceType = 'auth',
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const client = this.getClient(service);
      const response = await client.put<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError, service);
    }
  }

  async delete<T>(
    url: string,
    service: ServiceType = 'auth',
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const client = this.getClient(service);
      const response = await client.delete<T>(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError, service);
    }
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

export const apiClient = new ApiClient();
