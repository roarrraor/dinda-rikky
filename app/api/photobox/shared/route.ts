import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

/**
 * GET /api/photobox/shared — daftar strip yang dibagikan tamu ke galeri,
 * terbaru dulu (maks 50). Dibaca PhotoboothWall ("Galeri Tamu").
 * Kalau bucket belum ada / service key belum diisi, kembalikan list kosong
 * supaya dinding foto tetap jalan (hanya menampilkan "Foto Saya").
 */
const BUCKET = "photobooth";

export async function GET() {
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: true, strips: [] });
  }
  const { data, error } = await supabase.storage.from(BUCKET).list("shared", {
    limit: 50,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !data) {
    return NextResponse.json({ ok: true, strips: [] });
  }
  const strips = data
    .filter((f) => f.name.toLowerCase().endsWith(".jpg"))
    .map((f) => ({
      url: supabase.storage.from(BUCKET).getPublicUrl(`shared/${f.name}`).data.publicUrl,
      createdAt: f.created_at,
    }));
  return NextResponse.json({ ok: true, strips });
}
