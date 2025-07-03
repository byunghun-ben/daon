import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";

// API base configuration
const API_BASE_URL = __DEV__
  ? "http://localhost:3001/api/v1"
  : "https://api.daon.app/v1"; // Replace with your production URL

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@daon:access_token",
  REFRESH_TOKEN: "@daon:refresh_token",
  USER_DATA: "@daon:user_data",
} as const;

// API Error types
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// HTTP client with authentication using axios
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn("Failed to get auth token:", error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          let errorMessage = error.message;
          if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
          ) {
            errorMessage = data.error;
          }
          throw new ApiError(status, errorMessage || "API Error", data);
        } else if (error.request) {
          // Network error
          throw new ApiError(0, "Network Error", { originalError: error });
        } else {
          // Other error
          throw new ApiError(0, error.message || "Unknown Error", {
            originalError: error,
          });
        }
      },
    );
  }

  // HTTP methods
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(endpoint, config);
    return response.data;
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data, config);
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(endpoint, config);
    return response.data;
  }

  // File upload support
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Auth utilities
export const authUtils = {
  async saveTokens(accessToken: string, refreshToken?: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  },

  async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error("Failed to get stored token:", error);
      return null;
    }
  },
};
