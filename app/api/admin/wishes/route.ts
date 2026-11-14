import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getSupabase } from "@/lib/supabase-server";

/** GET /api/admin/wishes — daftar ucapan (termasuk balasan), terbaru dulu. */
export async function GET() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ ok: false, error: "Tidak login" }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Database belum dikonfigurasi" }, { status: 503 });
  }
  const { data, error } = await supabase
    .from("wishes")
    .select("id, slug, name, message, attendance, parent_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[admin/wishes] select gagal:", error.message);
    return NextResponse.json({ ok: false, error: "Gagal memuat ucapan" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: data ?? [] });
}

/** DELETE /api/admin/wishes?id= — hapus satu ucapan (balasannya ikut terhapus). */
export async function DELETE(req: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ ok: false, error: "Tidak login" }, { status: 401 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Database belum dikonfigurasi" }, { status: 503 });
  }
  const id = new URL(req.url).searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id wajib diisi" }, { status: 400 });
  }
  const { error } = await supabase.from("wishes").delete().eq("id", id);
  if (error) {
    console.error("[admin/wishes] delete gagal:", error.message);
    return NextResponse.json({ ok: false, error: "Gagal menghapus ucapan" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
