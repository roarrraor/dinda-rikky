import { WEDDING, type WeddingData } from "@/lib/wedding/data";
import { getSupabase } from "@/lib/supabase-server";

/**
 * Pengaturan undangan dari tabel `wedding_settings` (key 'wedding').
 *
 * SERVER-ONLY: file ini mengimpor service_role client — hanya boleh
 * di-import dari Server Component / Route Handler, jangan pernah dari
 * komponen client. Admin mengubahnya lewat /api/admin/settings.
 */

export type WeddingSettings = Partial<WeddingData>;

/** Isi mentah baris 'wedding' di wedding_settings, atau null kalau belum ada. */
export async function getWeddingSettings(): Promise<WeddingSettings | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("wedding_settings")
    .select("value")
    .eq("key", "wedding")
    .maybeSingle();
  if (error || !data || typeof data.value !== "object" || data.value === null) return null;
  return data.value as WeddingSettings;
}

/** Data undangan: WEDDING default, ditimpa pengaturan dari database (kalau ada). */
export async function getWeddingData(): Promise<WeddingData> {
  try {
    const settings = await getWeddingSettings();
    if (!settings) return WEDDING;
    return { ...WEDDING, ...settings };
  } catch {
    return WEDDING;
  }
}
