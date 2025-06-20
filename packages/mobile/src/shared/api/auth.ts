import * as z from "zod/v4";
import { apiClient, ApiError, authUtils } from "./client";

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

const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

type User = z.infer<typeof UserSchema>;

const AuthResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
  access_token: z.string(),
  refresh_token: z.string().optional(),
});

type AuthResponse = z.infer<typeof AuthResponseSchema>;

type SignInSuccessResponse = {
  success: true;
  data: AuthResponse;
  error?: never;
};
type SignInErrorResponse = {
  success: false;
  data?: never;
  error: string;
};
type SignInResponse = SignInSuccessResponse | SignInErrorResponse;

// Auth API functions
export const authApi = {
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/signup", data);

    // Store tokens
    await authUtils.saveTokens(response.access_token, response.refresh_token);

    return response;
  },

  async signIn(data: SignInRequest): Promise<SignInResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/signin", data);

      // Store tokens
      await authUtils.saveTokens(response.access_token, response.refresh_token);

      return {
        success: true,
        data: response,
      };
    } catch (error: unknown) {
      let errorMessage = "로그인 중 오류가 발생했습니다.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.";
        }

        if (error.status === 429) {
          errorMessage =
            "너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요.";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
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

  async updateProfile(
    data: Partial<Pick<User, "name">>
  ): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>("/auth/profile", data);
  },
};
