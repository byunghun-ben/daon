import { Request, RequestHandler, Response } from "express";
import z from "zod/v4";
import { supabase, supabaseAdmin } from "../lib/supabase";
import { isAuthenticatedRequest } from "../middleware/auth";
import type { TablesUpdate } from "../types/supabase";
import { logger } from "../utils/logger";

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

const CreateChildSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must be in YYYY-MM-DD format"),
  gender: z.enum(["male", "female"]),
  photo_url: z.string().url().optional(),
  birth_weight: z.number().positive().optional(),
  birth_height: z.number().positive().optional(),
});

const JoinChildSchema = z.object({
  invite_code: z.string().min(1, "Invite code is required"),
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

    // Create user profile in our database (registration incomplete)
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email: data.user.email!,
      name,
      registration_status: "incomplete",
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
      ...(children || []),
      ...(guardianChildren?.map((g) => g.children) || []),
    ];

    logger.info("User signed in successfully", {
      userId: data.user.id,
      email,
      hasChildren: allChildren.length > 0,
    });

    res.json({
      message: "Signed in successfully",
      user: profile || {
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
 * Sign out user
 */
export const signOut: RequestHandler = async (req, res) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

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
};

/**
 * Get current user profile
 */
export const getProfile: RequestHandler = async (req, res) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

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
};

/**
 * Update user profile
 */
export const updateProfile: RequestHandler = async (req, res) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

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
        details: error.issues,
      });
      return;
    }

    logger.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Create a new child (Step 2A of registration)
 */
export const createChild: RequestHandler = async (req, res) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const validatedData = CreateChildSchema.parse(req.body);

    // Create the child
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .insert({
        ...validatedData,
        owner_id: req.user.id,
      })
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

    res.status(201).json({
      message: "Child created successfully",
      child: {
        ...child,
        invite_code: child.invite_code, // Include invite code for sharing
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
};

/**
 * Join an existing child using invite code (Step 2B of registration)
 */
export const joinChild: RequestHandler = async (req, res) => {
  try {
    if (!isAuthenticatedRequest(req)) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const validatedData = JoinChildSchema.parse(req.body);
    const { invite_code } = validatedData;

    // Find the child by invite code
    const { data: child, error: childError } = await supabaseAdmin
      .from("children")
      .select("*")
      .eq("invite_code", invite_code)
      .single();

    if (childError || !child) {
      logger.warn("Invalid invite code", {
        userId: req.user.id,
        inviteCode: invite_code,
        error: childError,
      });
      res.status(404).json({ error: "Invalid invite code" });
      return;
    }

    // Check if user is already connected to this child
    const { data: existingConnection } = await supabaseAdmin
      .from("child_guardians")
      .select("id")
      .eq("child_id", child.id)
      .eq("user_id", req.user.id)
      .single();

    if (existingConnection) {
      res
        .status(400)
        .json({ error: "You are already connected to this child" });
      return;
    }

    // Create guardian relationship
    const { error: guardianError } = await supabaseAdmin
      .from("child_guardians")
      .insert({
        child_id: child.id,
        user_id: req.user.id,
        role: "guardian",
        accepted_at: new Date().toISOString(),
      });

    if (guardianError) {
      logger.error("Failed to create guardian relationship", {
        userId: req.user.id,
        childId: child.id,
        error: guardianError,
      });
      res.status(500).json({ error: "Failed to join child" });
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

    logger.info("User joined child successfully", {
      userId: req.user.id,
      childId: child.id,
      inviteCode: invite_code,
    });

    res.json({
      message: "Successfully joined child",
      child: {
        id: child.id,
        name: child.name,
        birth_date: child.birth_date,
        gender: child.gender,
        photo_url: child.photo_url,
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

    logger.error("Join child error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
