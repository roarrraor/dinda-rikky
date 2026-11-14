import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

/** POST /api/admin/logout — hapus cookie sesi admin. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
