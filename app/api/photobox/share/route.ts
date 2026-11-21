import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

/**
 * POST /api/photobox/share — unggah satu strip photobooth ke galeri tamu.
 *
 * Opt-in: hanya dipanggil kalau tamu mengaktifkan "Bagikan ke galeri tamu"
 * di /photobooth. Gambar disimpan di Supabase Storage (bucket `photobooth`,
 * publik) supaya semua tamu bisa melihatnya lewat GET /api/photobox/shared.
 * Bucket dibuat otomatis kalau belum ada (butuh service_role key).
 */
const BUCKET = "photobooth";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(req: Request) {
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "galeri belum dikonfigurasi" }, { status: 503 });
  }
  let body: { image?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body tidak valid" }, { status: 400 });
  }
  const image = body?.image;
  if (typeof image !== "string" || !image.startsWith("data:image/jpeg;base64,")) {
    return NextResponse.json({ ok: false, error: "gambar harus JPEG" }, { status: 400 });
  }
  const base64 = image.slice("data:image/jpeg;base64,".length);
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: "ukuran gambar di luar batas" }, { status: 400 });
  }
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) {
      return NextResponse.json({ ok: false, error: "gagal menyiapkan galeri" }, { status: 500 });
    }
  }
  const name = `shared/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, bytes, { contentType: "image/jpeg", upsert: false });
  if (error) {
    return NextResponse.json({ ok: false, error: "gagal mengunggah" }, { status: 500 });
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
