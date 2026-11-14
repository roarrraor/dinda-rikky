import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

/** GET /api/admin/rsvps — daftar RSVP (read-only), terbaru dulu. Butuh service key. */
export async function GET() {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ ok: false, error: "Tidak login" }, { status: 401 });
  }
  const supabase = getServiceSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Daftar RSVP butuh SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 },
    );
  }
  const { data, error } = await supabase
    .from("rsvps")
    .select("id, slug, name, attendance, pax, events, category, message, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("[admin/rsvps] select gagal:", error.message);
    return NextResponse.json({ ok: false, error: "Gagal memuat RSVP" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: data ?? [] });
}
