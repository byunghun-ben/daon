import { supabase, supabaseAdmin } from "@/lib/supabase.js";
import type { Tables } from "@/types/supabase.js";
import { logger } from "@/utils/logger.js";
import type { Session } from "@daon/shared";
import crypto from "crypto";

interface CreateKakaoUserParams {
  email: string;
  name: string;
  avatarUrl?: string;
  kakaoId: string;
}

type User = Tables<"users">;

export class AuthService {
  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // 사용자 없음
        return null;
      }
      logger.error("Failed to get user by email", { email, error });
      throw new Error("Failed to get user by email");
    }

    return user;
  }

  /**
   * 카카오 사용자 생성
   */
  async createKakaoUser(params: CreateKakaoUserParams): Promise<User> {
    const { email, name, avatarUrl, kakaoId } = params;

    // 1. Supabase Auth에 사용자 생성 (관리자 권한으로)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // 이메일 확인된 상태로 생성
        user_metadata: {
          name,
          avatar_url: avatarUrl,
          kakao_id: kakaoId,
          provider: "kakao",
        },
      });

    if (authError || !authData.user) {
      logger.error("Failed to create Kakao user in auth", {
        email,
        error: authError,
      });
      throw new Error("Failed to create user");
    }

    // 2. 사용자 프로필 DB에 저장
    const { data: user, error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
        avatar_url: avatarUrl,
        oauth_provider: "kakao",
        oauth_provider_id: kakaoId,
        registration_status: "incomplete",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError || !user) {
      // Auth 사용자 삭제 (롤백)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      logger.error("Failed to create Kakao user profile", {
        userId: authData.user.id,
        email,
        error: profileError,
      });
      throw new Error("Failed to create user profile");
    }

    logger.info("Kakao user created successfully", {
      userId: user.id,
      email,
      kakaoId,
    });

    return user;
  }

  /**
   * 사용자 세션 생성 (Supabase Admin으로 JWT 토큰 발급)
   */
  async createSession(userId: string): Promise<Session> {
    try {
      // 사용자 정보 조회
      const { data: user, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(userId);

      if (userError || !user.user?.email) {
        logger.error("Failed to get user for session", {
          userId,
          error: userError,
        });
        throw new Error("Failed to get user");
      }

      // 사용자 임시 로그인으로 JWT 토큰 생성
      const tempPassword = crypto.randomBytes(32).toString("hex");

      // 임시 비밀번호로 사용자 업데이트 (Auth 전용)
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: tempPassword,
        });

      if (updateError) {
        logger.error("Failed to set temporary password", {
          userId,
          error: updateError,
        });
        throw new Error("Failed to create session");
      }

      // 임시 비밀번호로 로그인하여 실제 JWT 토큰 획득
      const { data: sessionData, error: sessionError } =
        await supabase.auth.signInWithPassword({
          email: user.user.email,
          password: tempPassword,
        });

      if (sessionError || !sessionData?.session) {
        logger.error("Failed to create session with temp password", {
          userId,
          error: sessionError,
        });
        throw new Error("Failed to create session");
      }

      // 실제 Supabase JWT 토큰 반환
      const session = sessionData.session;
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in ?? 3600,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
        token_type: "bearer",
      };
    } catch (error) {
      logger.error("Failed to create session", { userId, error });
      throw new Error("Failed to create session");
    }
  }

  /**
   * 아이 존재 여부 확인
   */
  async hasChildren(userId: string): Promise<boolean> {
    // 소유한 아이들 확인
    const { data: ownedChildren, error: ownedError } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("owner_id", userId)
      .limit(1);

    if (ownedError) {
      logger.error("Failed to check owned children", {
        userId,
        error: ownedError,
      });
    }

    // 보호자로 등록된 아이들 확인
    const { data: guardianChildren, error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .select("id")
      .eq("user_id", userId)
      .not("accepted_at", "is", null)
      .limit(1);

    if (guardianError) {
      logger.error("Failed to check guardian children", {
        userId,
        error: guardianError,
      });
    }

    const hasOwnedChildren = (ownedChildren?.length ?? 0) > 0;
    const hasGuardianChildren = (guardianChildren?.length ?? 0) > 0;

    return hasOwnedChildren || hasGuardianChildren;
  }

  /**
   * OAuth 제공자로 기존 사용자 찾기
   */
  async getUserByOAuthProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("oauth_provider", provider)
      .eq("oauth_provider_id", providerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return null;
      }
      logger.error("Failed to get user by OAuth provider", {
        provider,
        providerId,
        error,
      });
      throw new Error("Failed to get user by OAuth provider");
    }

    return user;
  }

  /**
   * 사용자의 OAuth 정보 업데이트
   */
  async updateUserOAuthInfo(
    userId: string,
    provider: string,
    providerId: string,
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        oauth_provider: provider,
        oauth_provider_id: providerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      logger.error("Failed to update user OAuth info", {
        userId,
        provider,
        providerId,
        error,
      });
      throw new Error("Failed to update user OAuth info");
    }

    logger.info("Successfully updated user OAuth info", {
      userId,
      provider,
      providerId,
    });
  }
}
