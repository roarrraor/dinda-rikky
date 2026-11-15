// Daftar tamu undangan: slug -> nama yang tampil di cover.
//
// Cara kirim link personal ke tamu (pilih salah satu):
//   1. Nama langsung di link (cara yang paling umum di web undangan):
//      https://dinda-rikky-weld.vercel.app/?to=Budi+Santoso
//   2. Slug pendek dari daftar ini (nama asli tidak kelihatan di link):
//      https://dinda-rikky-weld.vercel.app/#tamu-a
//      atau https://dinda-rikky-weld.vercel.app/?to=tamu-a
//
// Nama dari link juga otomatis terisi di kolom nama form RSVP.
//
// Untuk menambah tamu: tambah satu baris di bawah, misal
//   "tamu-d": "Bapak Bambang Sutrisno",
// lalu kirim link #tamu-d ke orangnya. Kirim daftar tamu ke masroar
// dan masroar yang isi file ini sekaligus.

export const GUESTS: Record<string, string> = {
  "tamu-a": "Bapak Budi Santoso",
  "tamu-b": "Ibu Sari Wulandari",
  "keluarga-budi": "Keluarga Bapak Budi Santoso",
};

/** Terima nama mentah (?to= / #hash): kalau cocok slug di daftar, kembalikan nama tamunya; kalau tidak, pakai apa adanya. */
export function resolveGuestName(raw?: string | null): string | undefined {
  const v = raw?.trim();
  if (!v) return undefined;
  return GUESTS[v.toLowerCase()] ?? v;
}
