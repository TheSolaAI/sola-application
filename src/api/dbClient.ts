import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'sonner';

export interface ApiResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  detail: string;
  attr: string | null;
}

export interface ApiError {
  success: false;
  type: string;
  errors: ApiErrorDetail[];
  statusCode?: number;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    if (!authServiceUrl) {
      throw new Error('AUTH_SERVICE_URL environment variable is not defined');
    }
    this.client = axios.create({
      baseURL: authServiceUrl,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    axiosRetry(this.client, {
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
  }

  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return { success: true, data: response.data };
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const { status, data } = error.response;

      if (
        data &&
        typeof data === 'object' &&
        'type' in data &&
        'errors' in data
      ) {
        const apiError: ApiError = {
          success: false,
          type: data.type as string | 'unknown_error',
          errors: data.errors as ApiErrorDetail[],
          statusCode: status,
        };

        if (status >= 500) {
          toast.error(apiError.errors.map((e) => e.detail).join('\n'));
        }

        return apiError;
      }

      // If error does not match expected format, return generic error
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
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await this.client.get<T>(url, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await this.client.post<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await this.client.put<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await this.client.delete<T>(url);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
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

// Export instance
export const dbClient = new ApiClient();
