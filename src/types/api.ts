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
