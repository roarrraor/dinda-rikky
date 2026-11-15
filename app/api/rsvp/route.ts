import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import { isStickerKey } from "@/lib/wedding/stickers";

const NOT_CONFIGURED = { ok: false, error: "Database belum dikonfigurasi" };

/**
 * POST /api/rsvp — simpan RSVP + ucapan tamu ke Supabase.
 * Body: { slug, name, attendance ("hadir"|"tidak"|null), pax, category, events[], message, sticker }
 * Satu kiriman = satu baris di `rsvps`, dan kalau ada pesan juga satu baris di `wishes`.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!slug || !name) {
    return NextResponse.json({ ok: false, error: "Nama dan slug wajib diisi" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(NOT_CONFIGURED, { status: 503 });
  }

  const attendance =
    body?.attendance === "hadir" || body?.attendance === "tidak" ? body.attendance : null;
  const pax = Number.isFinite(body?.pax) && body.pax > 0 ? Math.floor(body.pax) : 1;
  const events = Array.isArray(body?.events)
    ? body.events.filter((e: unknown): e is string => typeof e === "string")
    : [];
  const category = typeof body?.category === "string" && body.category.trim() ? body.category.trim() : null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const rawSticker = typeof body?.sticker === "string" ? body.sticker.trim() : "";
  const sticker = isStickerKey(rawSticker) ? rawSticker : "";

  const { error: rsvpError } = await supabase.from("rsvps").insert({
    slug,
    name,
    attendance,
    pax,
    events,
    category,
    message: message || null,
  });
  if (rsvpError) {
    console.error("[rsvp] insert rsvps gagal:", rsvpError.message);
    return NextResponse.json({ ok: false, error: "Gagal menyimpan RSVP" }, { status: 500 });
  }

  if (message) {
    const wishRow = {
      slug,
      name,
      message,
      sticker: sticker || null,
      attendance,
      pax,
      events,
      category,
    };
    let { error: wishError } = await supabase.from("wishes").insert(wishRow);
    // Kalau kolom `sticker` belum ada (migrasi 0002 belum dijalankan),
    // kirim ulang tanpa stiker supaya ucapan tetap tersimpan.
    if (wishError && wishError.message.includes("sticker")) {
      const { sticker: _dropped, ...rowWithoutSticker } = wishRow;
      ({ error: wishError } = await supabase.from("wishes").insert(rowWithoutSticker));
    }
    if (wishError) {
      console.error("[rsvp] insert wishes gagal:", wishError.message);
      return NextResponse.json({ ok: false, error: "Gagal menyimpan ucapan" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
