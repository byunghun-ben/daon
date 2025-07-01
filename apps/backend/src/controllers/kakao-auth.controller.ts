import { AuthService } from "@/services/auth.service.js";
import { KakaoAuthService } from "@/services/kakao-auth.service.js";
import type { Tables } from "@/types/supabase.js";
import { logger } from "@/utils/logger.js";
import {
  KakaoCallbackQuerySchema,
  KakaoLoginUrlRequestSchema,
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
  generateLoginUrl = (req: Request, res: Response): void => {
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
      const result = this.kakaoAuthService.generateLoginUrl();

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
   * 카카오 OAuth 콜백 처리
   * GET /auth/kakao/callback?code=xxx&state=xxx
   */
  handleCallback = async (req: Request, res: Response): Promise<void> => {
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
    // 여기서는 카카오 ID를 별도 테이블에 저장하거나
    // 사용자 메타데이터에 저장할 수 있습니다
    // 현재는 로깅만 수행
    logger.info("Linking Kakao account", { userId, kakaoId });
    return Promise.resolve();
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
      redirectUrl: `${redirectUrl.substring(0, 50)}...`,
    });

    res.redirect(redirectUrl);
  }
}
