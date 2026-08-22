import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase.
 * Vercel (browser needs NEXT_PUBLIC_ prefix):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
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
  instagram: string | null;
  facebook: string | null;
  youtube: string | null;
  whatsapp: string | null;
  x: string | null;
  bluesky: string | null;
  pinterest: string | null;
  reddit: string | null;
  blog1: string | null;
  blog2: string | null;
  substack: string | null;
  website: string | null;
};

/** Columns selected on every profile search */
export const PROFILE_SELECT =
  "id, username, created_at, instagram, facebook, youtube, whatsapp, x, bluesky, pinterest, reddit, blog1, blog2, substack, website";
