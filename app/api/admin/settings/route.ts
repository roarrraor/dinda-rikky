import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { getWeddingData, getWeddingSettings } from "@/lib/wedding/settings";

/** Field WeddingData yang bisa diubah dari halaman /admin. */
const EDITABLE_FIELDS = [
  "bride",
  "groom",
  "brideNickname",
  "groomNickname",
  "date",
  "venue",
  "akadTitle",
  "resepsiTitle",
  "akad",
  "resepsi",
  "akadVenue",
  "resepsiVenue",
  "akadAddress",
  "resepsiAddress",
  "akadMapsUrl",
  "mapsUrl",
  "fatherGroom",
  "motherGroom",
  "fatherBride",
  "motherBride",
  "hashtag",
  "dresscode",
  "giftAddress",
  "giftReceiver",
] as const;

/** GET /api/admin/settings — data undangan hasil merge (default + database). */
export async function GET() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ ok: false, error: "Tidak login" }, { status: 401 });
  }
  const data = await getWeddingData();
  return NextResponse.json({ ok: true, data });
}

/**
 * POST /api/admin/settings — simpan field-field di atas sebagai satu baris
 * wedding_settings key='wedding' (merge dengan yang sudah tersimpan).
 * Butuh service key (anon tidak boleh menulis pengaturan).
 */
export async function POST(req: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ ok: false, error: "Tidak login" }, { status: 401 });
  }
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Ubah data undangan butuh SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 },
    );
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: "Body tidak valid" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  for (const key of EDITABLE_FIELDS) {
    const v = (body as Record<string, unknown>)[key];
    if (typeof v === "string") patch[key] = v.trim();
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "Tidak ada field yang diubah" }, { status: 400 });
  }

  const current = (await getWeddingSettings()) ?? {};
  const merged = { ...current, ...patch };

  const { error } = await supabase.from("wedding_settings").upsert({
    key: "wedding",
    value: merged,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("[admin/settings] upsert gagal:", error.message);
    return NextResponse.json({ ok: false, error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
