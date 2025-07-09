import { supabase, supabaseAdmin } from "@/lib/supabase.js";
import type { TablesUpdate } from "@/types/supabase.js";
import { createAuthenticatedHandler } from "@/utils/auth-handler.js";
import { logger } from "@/utils/logger.js";
import {
  CreateChildRequestSchema,
  SignInRequestSchema,
  SignUpRequestSchema,
  UpdateUserProfileRequestSchema,
  apiToDb,
  dbToApi,
} from "@daon/shared";
import type { Request, Response } from "express";
import z from "zod/v4";

// Token refresh request schema
const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Using shared schemas for request validation

/**
 * Sign up a new user
 */
export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = SignUpRequestSchema.parse(req.body);
    const { email, password, name, phone } = validatedData;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.warn("Sign up failed", { email, error: error.message });
      res.status(400).json({ error: error.message });
      return;
    }

    if (!data.user?.email) {
      res.status(400).json({ error: "Failed to create user" });
      return;
    }

    // Create user profile in our database (registration incomplete)
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      name,
      registration_status: "incomplete",
      phone,
    });

    if (profileError) {
      logger.error("Failed to create user profile", {
        userId: data.user.id,
        error: profileError,
      });
      res.status(500).json({ error: "Failed to create user profile" });
      return;
    }

    logger.info("User signed up successfully", { userId: data.user.id, email });

    res.status(201).json({
      message:
        "User created successfully. Please complete registration by adding a child.",
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        registration_status: "incomplete",
        phone,
      },
      session: data.session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Sign up error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Sign in user
 */
export async function signIn(req: Request, res: Response): Promise<void> {
  try {
    logger.debug("[signIn] data", req.body);
    const validatedData = SignInRequestSchema.parse(req.body);
    const { email, password } = validatedData;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn("[signIn] Sign in failed", { email, error: error.message });
      res.status(401).json({ error: error.message });
      return;
    }

    if (!data.session || !data.user) {
      res
        .status(401)
        .json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
      return;
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      logger.error("[signIn] Failed to get user profile", {
        userId: data.user.id,
        error: profileError,
      });
    }

    // Check if user has connected children
    const { data: children, error: childrenError } = await supabaseAdmin
      .from("children")
      .select("id, name")
      .eq("owner_id", data.user.id);

    const { data: guardianChildren, error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .select("child_id, children!inner(id, name)")
      .eq("user_id", data.user.id)
      .not("accepted_at", "is", null);

    if (childrenError || guardianError) {
      logger.error("[signIn] Failed to get user's children", {
        userId: data.user.id,
        childrenError,
        guardianError,
      });
    }

    const allChildren = [
      ...(children ?? []),
      ...(guardianChildren?.map((g) => g.children) ?? []),
    ];

    logger.info("User signed in successfully", {
      userId: data.user.id,
      email,
      hasChildren: allChildren.length > 0,
    });

    res.json({
      message: "Signed in successfully",
      user: profile ?? {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
      children: allChildren,
      needs_child_setup: allChildren.length === 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Sign in error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = RefreshTokenRequestSchema.parse(req.body);
    const { refreshToken } = validatedData;

    // Use Supabase to refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      logger.warn("Token refresh failed", { error: error?.message });
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    logger.info("Token refreshed successfully", {
      userId: data.user?.id,
    });

    res.json({
      message: "Token refreshed successfully",
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Token refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Sign out user
 */
export const signOut = createAuthenticatedHandler(async (req, res) => {
  try {
    // Get the current user's token from the request header for proper logout
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (token) {
      // Create a Supabase client with the user's token for proper session invalidation
      const { error } = await supabase.auth.admin.signOut(token);

      if (error) {
        logger.warn("Failed to invalidate session on server", {
          userId: req.user.id,
          error: error.message,
        });
      }
    }

    logger.info("User signed out", { userId: req.user.id });
    res.json({
      message: "Signed out successfully",
      success: true,
    });
  } catch (error) {
    logger.error("Sign out error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get current user profile
 */
export const getProfile = createAuthenticatedHandler(async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) {
      logger.error("Failed to get user profile", {
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to get profile" });
      return;
    }

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiUser = dbToApi(profile);

    res.json({ user: apiUser });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Update user profile
 */
export const updateProfile = createAuthenticatedHandler(async (req, res) => {
  try {
    // API 요청 검증 (camelCase)
    const validatedApiData = UpdateUserProfileRequestSchema.parse(req.body);

    // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
    const dbData = apiToDb(validatedApiData);

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("users")
      .update(dbData)
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update user profile", {
        userId: req.user.id,
        error,
      });
      res.status(500).json({ error: "Failed to update profile" });
      return;
    }

    logger.info("User profile updated", { userId: req.user.id });
    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiUser = dbToApi(updatedProfile);

    res.json({
      message: "Profile updated successfully",
      user: apiUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Create a new child (Step 2A of registration)
 */
export const createChild = createAuthenticatedHandler(async (req, res) => {
  try {
    // API 요청 검증 (camelCase)
    const validatedApiData = CreateChildRequestSchema.parse(req.body);

    // DB 저장을 위한 데이터 변환 (camelCase → snake_case)
    const dbData = {
      name: validatedApiData.name,
      birth_date: validatedApiData.birthDate,
      gender: validatedApiData.gender,
      photo_url: validatedApiData.photoUrl,
      birth_weight: validatedApiData.birthWeight,
      birth_height: validatedApiData.birthHeight,
      owner_id: req.user.id,
    };

    // Create the child
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .insert(dbData)
      .select()
      .single();

    if (childError) {
      logger.error("Failed to create child", {
        userId: req.user.id,
        error: childError,
      });
      res.status(500).json({ error: "Failed to create child" });
      return;
    }

    // Update user registration status to completed
    const { error: statusError } = await supabaseAdmin
      .from("users")
      .update({ registration_status: "completed" } as TablesUpdate<"users">)
      .eq("id", req.user.id);

    if (statusError) {
      logger.error("Failed to update registration status", {
        userId: req.user.id,
        error: statusError,
      });
    }

    logger.info("Child created successfully", {
      userId: req.user.id,
      childId: child.id,
      inviteCode: child.invite_code,
    });

    // DB 데이터를 API 형식으로 변환 (snake_case → camelCase)
    const apiChild = dbToApi(child);

    res.status(201).json({
      message: "Child created successfully",
      child: {
        ...apiChild,
        inviteCode: child.invite_code, // Include invite code for sharing
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.issues,
      });
      return;
    }

    logger.error("Create child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Check and update registration status
 * If user has children but status is incomplete, update to complete
 */
export const checkRegistrationStatus = createAuthenticatedHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if user has any children
  const { data: children, error: childrenError } = await supabaseAdmin
    .from("child_guardians")
    .select("child_id")
    .eq("user_id", userId);

  if (childrenError) {
    logger.error("Failed to check children", {
      userId,
      error: childrenError,
    });
    res.status(500).json({ error: "Failed to check registration status" });
    return;
  }

  const hasChildren = children && children.length > 0;
  
  // Get current user data from database
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !userData) {
    logger.error("Failed to fetch user data", {
      userId,
      error: userError,
    });
    res.status(500).json({ error: "Failed to fetch user data" });
    return;
  }

  const currentStatus = userData.registration_status;

  // If user has children but status is incomplete, update it
  if (hasChildren && currentStatus === "incomplete") {
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ registration_status: "completed" } as TablesUpdate<"users">)
      .eq("id", userId);

    if (updateError) {
      logger.error("Failed to update registration status", {
        userId,
        error: updateError,
      });
      res.status(500).json({ error: "Failed to update registration status" });
      return;
    }

    // Fetch updated user data
    const { data: updatedUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !updatedUser) {
      logger.error("Failed to fetch updated user", {
        userId,
        error: userError,
      });
      res.status(500).json({ error: "Failed to fetch updated user" });
      return;
    }

    logger.info("Registration status auto-updated to completed", {
      userId,
      hasChildren,
    });

    res.json({
      statusUpdated: true,
      user: dbToApi(updatedUser),
    });
  } else {
    // Fetch full user data to return
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !currentUser) {
      logger.error("Failed to fetch current user", {
        userId,
        error: userError,
      });
      res.status(500).json({ error: "Failed to fetch current user" });
      return;
    }

    res.json({
      statusUpdated: false,
      user: dbToApi(currentUser),
    });
  }
});
