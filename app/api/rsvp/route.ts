import { NextResponse } from "next/server";

// Stub: belum menyimpan apa pun. Sambungkan ke database kamu (Supabase, Postgres, dll).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.slug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
