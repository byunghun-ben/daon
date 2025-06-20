import { apiClient, authUtils } from "./client";

// Auth API types
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  refresh_token?: string;
}

// Auth API functions
export const authApi = {
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);
    
    // Store tokens
    await authUtils.saveTokens(response.access_token, response.refresh_token);
    
    return response;
  },

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signin", data);
    
    // Store tokens
    await authUtils.saveTokens(response.access_token, response.refresh_token);
    
    return response;
  },

  async signOut(): Promise<void> {
    try {
      await apiClient.post("/auth/signout");
    } finally {
      // Always clear local tokens even if API call fails
      await authUtils.clearTokens();
    }
  },

  async getProfile(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>("/auth/profile");
  },

  async updateProfile(data: Partial<Pick<User, "name">>): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>("/auth/profile", data);
  },
};