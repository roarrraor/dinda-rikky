import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase server-side.
 *
 * Semua akses database lewat API route server dengan service_role key —
 * jangan pernah pakai anon key di sini, dan jangan import file ini dari
 * komponen client. Kalau env belum diisi, fungsi-fungsi di bawah return
 * null / false supaya route bisa menjawab 503 dengan pesan yang jelas.
 */

let client: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client === undefined) {
    client = createClient(
      process.env.SUPABASE_URL!.trim(),
      process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return client;
}
