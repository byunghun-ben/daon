import {
  AuthResponseSchema,
  UserResponseSchema,
  type AuthResponse,
  type SignInRequest,
  type SignUpRequest,
  type UserApi,
} from "@daon/shared";
import { z } from "zod/v4";
import { apiClient, ApiError, authUtils } from "./client";

interface SignInSuccessResponse {
  success: true;
  data: AuthResponse;
  error?: never;
}
interface SignInErrorResponse {
  success: false;
  data?: never;
  error: string;
}
type SignInResponse = SignInSuccessResponse | SignInErrorResponse;

interface SignUpSuccessResponse {
  success: true;
  data: AuthResponse;
  error?: never;
}

interface SignUpErrorResponse {
  success: false;
  data?: never;
  error: string;
}
type SignUpResponse = SignUpSuccessResponse | SignUpErrorResponse;

// Auth API functions
export const authApi = {
  async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    try {
      const response = await apiClient.post("/auth/signup", data);

      // Validate response with Zod
      const validatedResponse = AuthResponseSchema.parse(response);

      // Store tokens
      await authUtils.saveTokens(
        validatedResponse.session.access_token,
        validatedResponse.session.refresh_token,
      );

      return {
        success: true,
        data: validatedResponse,
      };
    } catch (error: unknown) {
      console.log("[authApi] signUp error", error);
      return {
        success: false,
        error: "회원가입 중 오류가 발생했습니다.",
      };
    }
  },

  async signIn(data: SignInRequest): Promise<SignInResponse> {
    try {
      const response = await apiClient.post("/auth/signin", data);

      console.log("[authApi] signIn response", response);

      // Validate response with Zod
      const validatedResponse = AuthResponseSchema.parse(response);

      // Store tokens
      await authUtils.saveTokens(
        validatedResponse.session.access_token,
        validatedResponse.session.refresh_token,
      );

      return {
        success: true,
        data: validatedResponse,
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

  async signOut(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.post<{
        message: string;
        success: boolean;
      }>("/auth/signout");

      console.log("[authApi] signOut response", response);

      return {
        success: true,
        message: response.message,
      };
    } catch (error) {
      console.warn(
        "[authApi] signOut failed, but clearing local tokens",
        error,
      );
      return {
        success: false,
        message: "로그아웃 처리 중 오류가 발생했습니다.",
      };
    } finally {
      // Always clear local tokens even if API call fails
      await authUtils.clearTokens();
    }
  },

  async getProfile(): Promise<{ user: UserApi }> {
    const response = await apiClient.get("/auth/profile");
    // Validate response with Zod
    console.log("[authApi] getProfile response", response);
    const validatedResponse = UserResponseSchema.parse(response);
    return validatedResponse;
  },

  async updateProfile(
    data: Partial<Pick<UserApi, "name">>,
  ): Promise<{ user: UserApi }> {
    const response = await apiClient.put("/auth/profile", data);
    // Validate response with Zod
    const validatedResponse = UserResponseSchema.parse(response);
    return validatedResponse;
  },

  async checkRegistrationStatus(): Promise<{
    statusUpdated: boolean;
    user: UserApi;
  }> {
    const response = await apiClient.post("/auth/check-registration");
    // Define inline schema for this specific response
    const CheckRegistrationResponseSchema = UserResponseSchema.extend({
      statusUpdated: z.boolean(),
    });
    // Validate response with Zod
    const validatedResponse = CheckRegistrationResponseSchema.parse(response);
    return validatedResponse;
  },
};
