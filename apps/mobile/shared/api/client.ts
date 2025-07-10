import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import axios from "axios";
import axiosRetry from "axios-retry";

// Add type declaration for _retry property
declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

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
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupRetry();
    this.setupInterceptors();
  }

  private setupRetry() {
    // Configure retry logic
    axiosRetry(this.client, {
      retries: 3, // Number of retry attempts
      retryDelay: (retryCount) => {
        // Exponential backoff: 1s, 2s, 4s
        return retryCount * 1000;
      },
      retryCondition: (error) => {
        // Retry on network errors or 5xx errors
        return (
          !error.response ||
          (error.response.status >= 500 && error.response.status <= 599) ||
          error.code === "ECONNABORTED" ||
          error.code === "ETIMEDOUT" ||
          error.code === "ENOTFOUND" ||
          error.code === "ENETUNREACH"
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.log(`Retrying request (${retryCount}):`, requestConfig.url);
      },
    });
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN,
      );
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Save new tokens
      await this.saveTokens(accessToken, newRefreshToken);

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear tokens and redirect to login
      await this.clearTokens();
      throw error;
    }
  }

  private async saveTokens(accessToken: string, refreshToken?: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
    } catch (error) {
      console.error("Failed to save tokens:", error);
    }
  }

  private async clearTokens() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      // Notify auth store to handle auth error
      const { useAuthStore } = await import("../store/authStore");
      useAuthStore.getState().handleAuthError();
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
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

    // Response interceptor to handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            // If a refresh is already in progress, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);

            if (originalRequest.headers && newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

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

  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error("Failed to get stored refresh token:", error);
      return null;
    }
  },
};
