import {
  type KakaoLoginUrlRequest,
  type KakaoLoginUrlResponse,
} from "@daon/shared";
import { apiClient } from "./client";

/**
 * 카카오 로그인 URL 요청
 */
export const requestKakaoLoginUrl = async (
  data: KakaoLoginUrlRequest = { platform: "mobile" },
): Promise<KakaoLoginUrlResponse> => {
  const response = await apiClient.post<{
    success: boolean;
    data: KakaoLoginUrlResponse;
    error?: string;
  }>("/auth/kakao/url", data);

  if (!response.success) {
    console.error("[requestKakaoLoginUrl] error:", response.error);
    throw new Error(response.error || "카카오 로그인 URL 생성에 실패했습니다");
  }

  return response.data;
};

/**
 * 카카오 로그인 URL 요청 관련 에러 타입
 */
export interface KakaoLoginError {
  message: string;
  code?: string;
}

/**
 * 카카오 로그인 콜백 URL에서 파라미터 파싱
 */
export const parseKakaoCallback = (url: string) => {
  try {
    console.log("🔍 Parsing callback URL:", url);

    const urlObj = new URL(url);
    const success = urlObj.searchParams.get("success") === "true";
    const token = urlObj.searchParams.get("token") ?? undefined;
    const refreshToken = urlObj.searchParams.get("refresh_token") ?? undefined;
    const needsChildSetup =
      urlObj.searchParams.get("needs_child_setup") === "true";
    const error = urlObj.searchParams.get("error") ?? undefined;

    const result = {
      success,
      token: token ? `${token.substring(0, 20)}...` : undefined, // 토큰 일부만 로깅
      refreshToken: refreshToken
        ? `${refreshToken.substring(0, 20)}...`
        : undefined,
      needsChildSetup,
      error,
    };

    console.log("📊 Parsed callback result:", result);

    return {
      success,
      token,
      refreshToken,
      needsChildSetup,
      error,
    };
  } catch (error) {
    console.error("❌ 잘못된 콜백 URL 형식입니다", error);
    throw new Error("잘못된 콜백 URL 형식입니다");
  }
};
