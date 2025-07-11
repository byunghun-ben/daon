import type { Database } from "@/types/supabase.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure environment variables are loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error(
    `Missing Supabase environment variables:\n` +
      `SUPABASE_URL: ${supabaseUrl ? "✓" : "✗"}\n` +
      `SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✓" : "✗"}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "✓" : "✗"}`,
  );
}

// Client for authenticated requests
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export type SupabaseClient = typeof supabase;
export type SupabaseAdminClient = typeof supabaseAdmin;
