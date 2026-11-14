import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

/**
 * Format tanggal ISO (hanya bagian YYYY-MM-DD yang dipakai, supaya tidak geser zona waktu).
 * Token mengikuti dayjs: "DD . MM . YYYY", "MMMM", "dddd", "D MMM YYYY", dst.
 */
export function formatDate(iso: string | Date, pattern: string): string {
  const base = typeof iso === "string" ? iso.slice(0, 10) : iso;
  return dayjs(base).locale("id").format(pattern);
}

/** Nama panggilan atau nama depan, huruf pertama kapital */
export function displayName(full: string, nickname?: string | null): string {
  const n = nickname?.trim() || full.split(",")[0].trim();
  return n ? n.charAt(0).toUpperCase() + n.slice(1) : "";
}
