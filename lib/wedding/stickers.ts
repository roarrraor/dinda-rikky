/**
 * Stiker yang bisa dipilih tamu saat mengirim ucapan.
 *
 * File gambar ada di `public/assets/stickers/` (PNG transparan, 512x512).
 * Untuk menambah opsi stiker baru:
 * 1. Taruh file PNG transparan di folder itu.
 * 2. Tambah satu entri di `STICKERS` di bawah (key unik, tanpa spasi).
 * 3. Tidak perlu migrasi — kolom `sticker` di tabel `wishes` hanya
 *    menyimpan key-nya (lihat `supabase/migrations/0002_wish_sticker.sql`).
 */

export interface StickerOption {
  /** Kunci yang disimpan di database. */
  key: string;
  /** Label untuk screen reader / title. */
  label: string;
  /** Path file di `public/`. */
  src: string;
}

export const STICKERS: StickerOption[] = [
  { key: "hati", label: "Hati", src: "/assets/stickers/s1-hati.png" },
  { key: "cincin", label: "Cincin", src: "/assets/stickers/s2-cincin.png" },
  { key: "kue", label: "Kue", src: "/assets/stickers/s3-kue.png" },
  { key: "teko", label: "Teko", src: "/assets/stickers/s4-teko.png" },
];

/** Path gambar untuk key stiker, atau null kalau key tidak dikenal. */
export function stickerSrc(key: string | null | undefined): string | null {
  if (!key) return null;
  return STICKERS.find((s) => s.key === key)?.src ?? null;
}

/** True kalau key adalah salah satu stiker di atas. */
export function isStickerKey(key: string): boolean {
  return STICKERS.some((s) => s.key === key);
}
