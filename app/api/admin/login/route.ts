import { NextResponse } from "next/server";
import { ADMIN_COOKIE, safeEqual } from "@/lib/admin-auth";

/** POST /api/admin/login — { password }. Kalau cocok, set cookie sesi admin 7 hari. */
export async function POST(req: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD belum dikonfigurasi" },
      { status: 503 },
    );
  }
  const body = await req.json().catch(() => null);
  const attempt = typeof body?.password === "string" ? body.password : "";
  if (!attempt || !safeEqual(attempt, password)) {
    return NextResponse.json({ ok: false, error: "Password salah" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, password, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
