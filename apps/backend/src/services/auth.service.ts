import { supabaseAdmin } from "@/lib/supabase.js";
import type { Tables } from "@/types/supabase.js";
import { logger } from "@/utils/logger.js";
import type { Session } from "@daon/shared";

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

      // 관리자 권한으로 액세스 토큰 생성
      const { data: sessionData, error: sessionError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: user.user.email,
        });

      if (sessionError || !sessionData) {
        logger.error("Failed to generate session tokens", {
          userId,
          error: sessionError,
        });
        throw new Error("Failed to create session");
      }

      // 임시로 기본 세션 정보 반환
      // 실제 운영에서는 더 적절한 토큰 생성 방법 필요
      return {
        access_token: `temp_${userId}_${Date.now()}`,
        refresh_token: `refresh_${userId}_${Date.now()}`,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
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
}
