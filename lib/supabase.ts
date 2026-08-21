import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase.
 * Vercel Environment Variables (must be NEXT_PUBLIC_ for browser):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * If you only have SUPABASE_URL / SUPABASE_ANON_KEY, add the same values
 * again with the NEXT_PUBLIC_ prefix in Vercel → Settings → Environment Variables.
 */
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !anon) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel."
    );
  }
  if (!client) {
    client = createClient(url, anon);
  }
  return client;
}

export type Profile = {
  id: string;
  username: string | null;
  created_at: string | null;
};
