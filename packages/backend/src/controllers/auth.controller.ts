import { Request, Response } from "express";
import { z } from "zod";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { logger } from "../utils/logger";
import type { AuthenticatedRequest } from "../middleware/auth";

// Zod schemas for request validation
const SignUpSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

const SignInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
});

/**
 * Sign up a new user
 */
export async function signUp(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = SignUpSchema.parse(req.body);
    const { email, password, name } = validatedData;

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

    if (!data.user) {
      res.status(400).json({ error: "Failed to create user" });
      return;
    }

    // Create user profile in our database
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email: data.user.email!,
      name,
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
      message: "User created successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
      },
      session: data.session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
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
    const validatedData = SignInSchema.parse(req.body);
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

    logger.info("User signed in successfully", { userId: data.user.id, email });

    res.json({
      message: "Signed in successfully",
      user: profile || {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
      return;
    }

    logger.error("Sign in error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Sign out user
 */
export async function signOut(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Sign out error:", error);
      res.status(500).json({ error: "Failed to sign out" });
      return;
    }

    logger.info("User signed out", { userId: req.user.id });
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    logger.error("Sign out error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
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

    res.json({ user: profile });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const validatedData = UpdateProfileSchema.parse(req.body);

    const { data: updatedProfile, error } = await supabaseAdmin
      .from("users")
      .update(validatedData)
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
    res.json({
      message: "Profile updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
      return;
    }

    logger.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
