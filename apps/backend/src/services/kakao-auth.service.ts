import { logger } from "@/utils/logger.js";
import {
  KakaoUserInfoSchema,
  type KakaoCallbackQuery,
  type KakaoLoginUrlResponse,
  type KakaoUserInfo,
} from "@daon/shared";
import crypto from "crypto";

interface KakaoTokenResponse {
  token_type: string;
  access_token: string;
  id_token?: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
}

export class KakaoAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly states = new Map<string, { timestamp: number }>();

  constructor() {
    const clientId = process.env.KAKAO_CLIENT_ID;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error("Kakao OAuth configuration is missing");
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;

    // 5분마다 만료된 state 정리
    setInterval(
      () => {
        this.cleanupExpiredStates();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * 카카오 로그인 URL 생성
   */
  generateLoginUrl(): KakaoLoginUrlResponse {
    const state = this.generateState();

    // state 저장 (10분 만료)
    this.states.set(state, {
      timestamp: Date.now() + 10 * 60 * 1000,
    });

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      state,
      scope: "profile_nickname,profile_image,account_email", // 필요한 권한만 요청
    });

    const loginUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;

    logger.info("Generated Kakao login URL", {
      state,
      redirectUri: this.redirectUri,
    });

    return {
      loginUrl,
      state,
    };
  }

  /**
   * 카카오 콜백 처리 및 토큰 교환
   */
  async handleCallback(query: KakaoCallbackQuery): Promise<KakaoUserInfo> {
    const { code, state, error, error_description } = query;

    // 에러 체크
    if (error) {
      logger.error("Kakao OAuth error", { error, error_description });
      throw new Error(`Kakao OAuth error: ${error_description ?? error}`);
    }

    // state 검증
    if (!this.validateState(state)) {
      logger.error("Invalid or expired state", { state });
      throw new Error("Invalid or expired state parameter");
    }

    try {
      // 1. Access Token 교환
      const tokenResponse = await this.exchangeCodeForToken(code);

      // 2. 사용자 정보 조회
      const userInfo = await this.getUserInfo(tokenResponse.access_token);

      logger.info("Kakao OAuth success", {
        kakaoId: userInfo.id,
        email: userInfo.kakao_account.email,
        nickname: userInfo.kakao_account.profile?.nickname,
      });

      return userInfo;
    } catch (error) {
      logger.error("Failed to handle Kakao callback", {
        error: error instanceof Error ? error.message : "Unknown error",
        code: `${code.substring(0, 10)}...`, // 로그에는 일부만 기록
      });
      throw error;
    } finally {
      // state 정리
      this.states.delete(state);
    }
  }

  /**
   * 인증 코드를 액세스 토큰으로 교환
   */
  private async exchangeCodeForToken(
    code: string,
  ): Promise<KakaoTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to exchange code for token", {
        status: response.status,
        error: errorText,
      });
      throw new Error(`Failed to exchange code for token: ${response.status}`);
    }

    const tokenData = (await response.json()) as KakaoTokenResponse;
    return tokenData;
  }

  /**
   * 액세스 토큰으로 사용자 정보 조회
   */
  private async getUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Failed to get user info", {
        status: response.status,
        error: errorText,
      });
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    const userData = await response.json();

    // Zod로 응답 검증
    const validationResult = KakaoUserInfoSchema.safeParse(userData);
    if (!validationResult.success) {
      logger.error("Invalid Kakao user info response", {
        error: validationResult.error,
        data: userData,
      });
      throw new Error("Invalid user info response from Kakao");
    }

    return validationResult.data;
  }

  /**
   * 랜덤 state 생성
   */
  private generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * state 유효성 검증
   */
  private validateState(state: string): boolean {
    const stateData = this.states.get(state);
    if (!stateData) {
      return false;
    }

    // 만료 시간 체크
    if (Date.now() > stateData.timestamp) {
      this.states.delete(state);
      return false;
    }

    return true;
  }

  /**
   * 만료된 state 정리
   */
  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [state, data] of this.states.entries()) {
      if (now > data.timestamp) {
        this.states.delete(state);
      }
    }
  }
}
