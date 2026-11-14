import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";

const NOT_CONFIGURED = { ok: false, error: "Database belum dikonfigurasi" };

type WishRow = {
  id: string;
  name: string;
  message: string;
  sticker: string | null;
  attendance: string | null;
  parent_id: string | null;
  created_at: string;
};

type PublicWish = {
  id: string;
  name: string;
  message: string;
  sticker: string | null;
  attendance: string | null;
  createdAt: string;
  replies: { id: string; name: string; message: string }[];
};

/**
 * GET /api/wishes/public?slug=dinda-rikky — daftar ucapan dari Supabase,
 * terbaru dulu, balasan (parent_id) disusun ke dalam `replies` induknya.
 * Tanpa database yang dikonfigurasi, jawab 503 — tidak ada fallback
 * diam-diam ke data demo.
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return NextResponse.json({ ok: false, error: "slug wajib diisi" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(NOT_CONFIGURED, { status: 503 });
  }

  let { data, error } = await supabase
    .from("wishes")
    .select("id, name, message, sticker, attendance, parent_id, created_at")
    .eq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(200);

  // Kalau kolom `sticker` belum ada (migrasi 0002 belum dijalankan),
  // baca ulang tanpa stiker supaya list tetap muncul.
  if (error && error.message.includes("sticker")) {
    const retry = await supabase
      .from("wishes")
      .select("id, name, message, attendance, parent_id, created_at")
      .eq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(200);
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error) {
    console.error("[wishes] select gagal:", error.message);
    return NextResponse.json({ ok: false, error: "Gagal memuat ucapan" }, { status: 500 });
  }

  const rows = (data ?? []) as WishRow[];
  const byId = new Map<string, PublicWish>();
  const top: PublicWish[] = [];

  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      name: row.name,
      message: row.message,
      sticker: row.sticker ?? null,
      attendance: row.attendance,
      createdAt: row.created_at,
      replies: [],
    });
  }
  // Balasan tampil kronologis (paling lama dulu) di bawah induknya.
  for (const row of [...rows].reverse()) {
    const item = byId.get(row.id);
    if (!item) continue;
    if (row.parent_id && byId.has(row.parent_id)) {
      byId.get(row.parent_id)!.replies.push({ id: item.id, name: item.name, message: item.message });
    } else if (!row.parent_id) {
      top.push(item);
    }
  }

  return NextResponse.json(top);
}
