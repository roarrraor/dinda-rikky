import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase server-side (jangan import dari komponen client).
 *
 * Dua tingkat akses:
 * - Publik (ucapan + RSVP): cukup SUPABASE_ANON_KEY (publishable key).
 *   Policy RLS di migrasi mengizinkan anon membaca ucapan, mengirim
 *   ucapan/RSVP, dan membaca data undangan — dan tidak lebih dari itu.
 * - Admin (ubah data undangan, hapus ucapan, baca daftar RSVP):
 *   butuh SUPABASE_SERVICE_ROLE_KEY.
 *
 * Kalau service key ada, semua route memakainya. Kalau tidak ada,
 * route publik memakai anon key; route admin menjawab 503.
 */

let publicClient: SupabaseClient | null | undefined;
let serviceClient: SupabaseClient | null | undefined;

function getUrl(): string | null {
  return process.env.SUPABASE_URL?.trim() || null;
}

function getAnonKey(): string | null {
  return process.env.SUPABASE_ANON_KEY?.trim() || null;
}

function getServiceKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

/** True kalau URL + salah satu key (service atau anon) sudah diisi. */
export function isSupabaseConfigured(): boolean {
  return Boolean(getUrl() && (getServiceKey() || getAnonKey()));
}

/** True kalau service_role key sudah diisi (syarat fitur /admin). */
export function isServiceConfigured(): boolean {
  return Boolean(getUrl() && getServiceKey());
}

/**
 * Client untuk flow publik. Pakai service key kalau ada, kalau tidak
 * pakai anon key (policy RLS membatasi apa yang boleh dilakukan anon).
 * Return null kalau belum ada key sama sekali.
 */
export function getSupabase(): SupabaseClient | null {
  const url = getUrl();
  const key = getServiceKey() || getAnonKey();
  if (!url || !key) return null;
  if (publicClient === undefined) {
    publicClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}

/**
 * Client service_role untuk /admin. Return null kalau service key
 * belum diisi — route admin harus menjawab 503 dalam kasus itu.
 */
export function getServiceSupabase(): SupabaseClient | null {
  const url = getUrl();
  const key = getServiceKey();
  if (!url || !key) return null;
  if (serviceClient === undefined) {
    serviceClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}
