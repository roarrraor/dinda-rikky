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
  // ... stiker yang sudah ada
  {
    key: "burning-on-fire",
    label: "Burning On Fire",
    src: "/assets/stickers/burning-on-fire-gif.gif",
  },
  {
    key: "cat-love",
    label: "Cat Love",
    src: "/assets/stickers/cat-love-gif.gif",
  },
  {
    key: "cat-travelling",
    label: "Cat Travelling",
    src: "/assets/stickers/cat-travelling-gif-by-bichi-mao.gif",
  },
  {
    key: "dance-party-dancing",
    label: "Dance Party Dancing",
    src: "/assets/stickers/dance-party-dancing-gif.gif",
  },
  {
    key: "emoji-1",
    label: "Emoji 1",
    src: "/assets/stickers/emoji-gif-1.gif",
  },
  {
    key: "emoji-2",
    label: "Emoji 2",
    src: "/assets/stickers/emoji-gif-2.gif",
  },
  {
    key: "emoji",
    label: "Emoji",
    src: "/assets/stickers/emoji-gif.gif",
  },
  {
    key: "excited-sparkle",
    label: "Excited Sparkle",
    src: "/assets/stickers/excited-sparkle-gif.gif",
  },
  {
    key: "funny-face-omg",
    label: "Funny Face Omg",
    src: "/assets/stickers/funny-face-omg-gif.gif",
  },
  {
    key: "gif",
    label: "Gif",
    src: "/assets/stickers/gif.gif",
  },
  {
    key: "happy-celebration",
    label: "Happy Celebration",
    src: "/assets/stickers/happy-celebration-gif.gif",
  },
  {
    key: "happy-feeling-good",
    label: "Happy Feeling Good",
    src: "/assets/stickers/happy-feeling-good-gif.gif",
  },
  {
    key: "happy-line-sticker",
    label: "Happy Line Sticker",
    src: "/assets/stickers/happy-line-sticker-gif.gif",
  },
  {
    key: "heart-love",
    label: "Heart Love",
    src: "/assets/stickers/heart-love-gif.gif",
  },
  {
    key: "text-brat",
    label: "Text Brat",
    src: "/assets/stickers/text-brat-gif.gif",
  },
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
