import { AuthService } from "@/services/auth.service.js";
import { KakaoAuthService } from "@/services/kakao-auth.service.js";
import type { Tables } from "@/types/supabase.js";
import { logger } from "@/utils/logger.js";
import {
  KakaoCallbackQuerySchema,
  KakaoLoginUrlRequestSchema,
  KakaoSdkAuthRequestSchema,
  type KakaoUserInfo,
  type Session,
} from "@daon/shared";
import { type Request, type Response } from "express";

type User = Tables<"users">;

export class KakaoAuthController {
  private kakaoAuthService: KakaoAuthService;
  private authService: AuthService;

  constructor() {
    this.kakaoAuthService = new KakaoAuthService();
    this.authService = new AuthService();
  }

  /**
   * 카카오 로그인 URL 생성
   * POST /auth/kakao/url
   */
  generateLoginUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      // 요청 데이터 검증
      const validationResult = KakaoLoginUrlRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: "잘못된 요청 데이터입니다",
          details: validationResult.error.issues,
        });
        return;
      }

      // 카카오 로그인 URL 생성
      const result = await this.kakaoAuthService.generateLoginUrl();

      logger.info("Generated Kakao login URL", {
        state: result.state,
        platform: validationResult.data.platform,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Failed to generate Kakao login URL", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(500).json({
        success: false,
        error: "로그인 URL 생성에 실패했습니다",
      });
    }
  };

  /**
   * 카카오 SDK 로그인 처리
   * POST /auth/kakao/sdk
   */
  handleSdkLogin = async (req: Request, res: Response): Promise<void> => {
    logger.info("Kakao SDK login attempt", {
      bodyKeys: Object.keys(req.body),
    });

    try {
      // 요청 데이터 검증
      const validationResult = KakaoSdkAuthRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        logger.error("Kakao SDK login validation failed", {
          errors: validationResult.error.issues,
          body: req.body,
        });

        res.status(400).json({
          success: false,
          error: "잘못된 요청 데이터입니다",
          details: validationResult.error.issues,
        });
        return;
      }

      const { accessToken, refreshToken } = validationResult.data;
      logger.debug("Kakao SDK tokens validated", {
        accessTokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length,
      });

      // 카카오 액세스 토큰으로 사용자 정보 조회
      logger.debug("Fetching Kakao user info with access token");
      const kakaoUserInfo =
        await this.kakaoAuthService.getUserInfo(accessToken);

      logger.info("Kakao user info retrieved", {
        kakaoId: kakaoUserInfo.id,
        hasEmail: !!kakaoUserInfo.kakao_account.email,
        hasProfile: !!kakaoUserInfo.kakao_account.profile,
      });

      // Supabase에서 사용자 처리 (로그인/회원가입)
      const authResult = await this.handleKakaoUser(kakaoUserInfo);

      logger.info("Kakao SDK login success", {
        userId: authResult.user.id,
        email: authResult.user.email,
        isNewUser: authResult.isNewUser,
        needsChildSetup: authResult.needs_child_setup,
      });

      // API 응답 (앱 리다이렉트 대신 JSON 응답)
      res.status(200).json({
        success: true,
        data: {
          session: authResult.session,
          user: authResult.user,
          needs_child_setup: authResult.needs_child_setup,
        },
      });
    } catch (error) {
      logger.error("Failed to handle Kakao SDK login", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name,
      });

      // 더 구체적인 에러 메시지 제공
      let errorMessage = "로그인 처리 중 오류가 발생했습니다";
      let statusCode = 500;

      if (error instanceof Error) {
        if (
          error.message.includes(
            "카카오 계정에서 이메일 정보를 가져올 수 없습니다",
          )
        ) {
          errorMessage = error.message;
          statusCode = 400;
        } else if (error.message.includes("Failed to get user info")) {
          errorMessage =
            "카카오 사용자 정보를 가져올 수 없습니다. 토큰이 유효한지 확인해주세요.";
          statusCode = 401;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  };

  /**
   * 카카오 OAuth 콜백 처리
   * GET /auth/kakao/callback?code=xxx&state=xxx
   */
  handleCallback = async (req: Request, res: Response): Promise<void> => {
    logger.debug("Kakao callback received", {
      query: req.query,
    });
    try {
      // 쿼리 파라미터 검증
      const validationResult = KakaoCallbackQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        logger.error("Invalid callback query parameters", {
          query: req.query,
          error: validationResult.error,
        });

        // 에러를 앱으로 리다이렉트
        this.redirectToApp(res, {
          success: false,
          error: "잘못된 콜백 파라미터입니다",
        });
        return;
      }

      const { code, state, error, error_description } = validationResult.data;

      // 카카오에서 에러 반환한 경우
      if (error) {
        logger.error("Kakao OAuth error", { error, error_description });
        this.redirectToApp(res, {
          success: false,
          error: error_description ?? error,
        });
        return;
      }

      // 카카오 사용자 정보 획득
      const kakaoUserInfo = await this.kakaoAuthService.handleCallback({
        code,
        state,
      });

      // Supabase에서 사용자 처리 (로그인/회원가입)
      const authResult = await this.handleKakaoUser(kakaoUserInfo);

      logger.info("Kakao login success", {
        userId: authResult.user.id,
        email: authResult.user.email,
        isNewUser: authResult.isNewUser,
      });

      // 성공 시 앱으로 리다이렉트
      this.redirectToApp(res, {
        success: true,
        token: authResult.session.access_token,
        refreshToken: authResult.session.refresh_token,
        user: authResult.user,
        needsChildSetup: authResult.needs_child_setup,
      });
    } catch (error) {
      logger.error("Failed to handle Kakao callback", {
        error: error instanceof Error ? error.message : "Unknown error",
        query: req.query,
      });

      // 에러 시 앱으로 리다이렉트
      this.redirectToApp(res, {
        success: false,
        error: "로그인 처리 중 오류가 발생했습니다",
      });
    }
  };

  /**
   * 카카오 사용자 정보로 Supabase 로그인/회원가입 처리
   */
  private async handleKakaoUser(kakaoUserInfo: KakaoUserInfo): Promise<{
    session: Session;
    user: User;
    needs_child_setup: boolean;
    isNewUser: boolean;
  }> {
    const { id: kakaoId, kakao_account } = kakaoUserInfo;
    const email = kakao_account.email;
    const name = kakao_account.profile?.nickname ?? kakao_account.name;
    const avatarUrl = kakao_account.profile?.profile_image_url;

    if (!email) {
      throw new Error("카카오 계정에서 이메일 정보를 가져올 수 없습니다");
    }

    // 이메일로 기존 사용자 확인
    const existingUser = await this.authService.getUserByEmail(email);

    if (existingUser) {
      // 기존 사용자 로그인
      logger.info("Existing user login via Kakao", {
        userId: existingUser.id,
        email,
        kakaoId,
      });

      // 카카오 ID 연동 (필요시)
      await this.linkKakaoAccount(existingUser.id, kakaoId);

      // 세션 생성
      const session = await this.authService.createSession(existingUser.id);

      return {
        session,
        user: existingUser,
        needs_child_setup: existingUser.registration_status === "incomplete",
        isNewUser: false,
      };
    } else {
      // 새 사용자 회원가입
      logger.info("New user signup via Kakao", {
        email,
        kakaoId,
        name,
      });

      const newUser = await this.authService.createKakaoUser({
        email,
        name: name ?? "",
        avatarUrl,
        kakaoId: kakaoId.toString(),
      });

      // 세션 생성
      const session = await this.authService.createSession(newUser.id);

      return {
        session,
        user: newUser,
        needs_child_setup: true, // 새 사용자는 항상 아이 설정 필요
        isNewUser: true,
      };
    }
  }

  /**
   * 기존 사용자에게 카카오 계정 연동
   */
  private async linkKakaoAccount(
    userId: string,
    kakaoId: number,
  ): Promise<void> {
    try {
      // 1. 다른 사용자가 이미 이 카카오 계정을 사용하고 있는지 확인
      const existingUser = await this.authService.getUserByOAuthProvider(
        "kakao",
        kakaoId.toString(),
      );

      if (existingUser && existingUser.id !== userId) {
        logger.warn("Kakao account already linked to another user", {
          userId,
          kakaoId,
          existingUserId: existingUser.id,
        });
        throw new Error("This Kakao account is already linked to another user");
      }

      // 2. 현재 사용자의 OAuth 정보 업데이트
      await this.authService.updateUserOAuthInfo(
        userId,
        "kakao",
        kakaoId.toString(),
      );

      logger.info("Successfully linked Kakao account", { userId, kakaoId });
    } catch (error) {
      logger.error("Error in linkKakaoAccount", { userId, kakaoId, error });
      throw error;
    }
  }

  /**
   * 앱으로 딥링크 리다이렉트
   */
  private redirectToApp(
    res: Response,
    data: {
      success: boolean;
      token?: string;
      refreshToken?: string;
      user?: unknown;
      needsChildSetup?: boolean;
      error?: string;
    },
  ): void {
    const params = new URLSearchParams();

    if (data.success) {
      params.set("success", "true");
      if (data.token) params.set("token", data.token);
      if (data.refreshToken) params.set("refresh_token", data.refreshToken);
      if (data.needsChildSetup !== undefined) {
        params.set("needs_child_setup", data.needsChildSetup.toString());
      }
    } else {
      params.set("success", "false");
      if (data.error) params.set("error", data.error);
    }

    // 커스텀 URL 스킴으로 리다이렉트
    const redirectUrl = `daon://auth/kakao/callback?${params.toString()}`;

    logger.info("Redirecting to app", {
      redirectUrl:
        redirectUrl.length > 100
          ? `${redirectUrl.substring(0, 100)}...`
          : redirectUrl,
      fullUrl: redirectUrl, // 전체 URL 로깅 (디버깅용)
    });

    res.redirect(redirectUrl);
  }
}
