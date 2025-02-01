import axios, { AxiosInstance, AxiosResponse } from "axios";

class ApiClient {
  private static api: AxiosInstance = axios.create({
    headers: { "Content-Type": "application/json" },
  });

  
  static setAccessToken(token: string) {
    this.api.defaults.headers["Authorization"] = `Bearer ${token}`;
  }


  static async get<T>(url: string): Promise<T | null> {
    try {
      const response: AxiosResponse<T> = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error("GET Request Error:", error);
      return null;
    }
  }


  static async post<T>(url: string, data: any): Promise<T | null> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      console.error("POST Request Error:", error);
      return null;
    }
  }
}

export default ApiClient;