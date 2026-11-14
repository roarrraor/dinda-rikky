import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/** Nama cookie sesi admin. Isinya password admin itu sendiri. */
export const ADMIN_COOKIE = "dinda_admin";

/** Perbandingan string timing-safe (tidak bocor lewat waktu respons). */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** True kalau cookie sesi cocok dengan ADMIN_PASSWORD dari env. */
export async function isAdminLoggedIn(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!cookie) return false;
  return safeEqual(cookie, password);
}
