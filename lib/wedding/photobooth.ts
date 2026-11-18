/**
 * Photobooth Dinda & Rikky — konfigurasi studio foto (versi kita).
 *
 * Alurnya meniru fitur photobooth inveet tapi dengan desain & implementasi
 * sendiri (tema Pesta Teh): 3 langkah — 1) pilih tata letak, 2) ambil foto
 * (kamera / upload dari galeri), 3) atur bingkai + simpan / bagikan.
 * Semua foto diproses di perangkat tamu, tidak dikirim ke server.
 *
 * == CARA NAMBAH FRAME (buat Roar) ==
 * 1) Frame warna (tanpa file): tambah satu entri ke `FRAMES` di bawah —
 *    cukup isi nama, konsep, dan warna. Langsung jalan.
 * 2) Frame gambar: taruh filenya di `public/assets/photobooth/frames/`,
 *    lalu tambah satu entri ke `IMAGE_FRAMES` (id, nama, konsep, src,
 *    layout yang cocok). Ada dua jenis:
 *    - `layer: "overlay"` (bawaan): gambar digambar DI ATAS foto, jadi
 *      bagian tengah tempat foto harus TRANSPARAN (alpha 0), dan
 *      ukurannya mengikuti ukuran output layout yang didaftarkan
 *      (lihat `layoutGeometry`).
 *    - `layer: "background"` (ala inveet): gambar full digambar DI BAWAH
 *      foto (cover-fit ke kanvas), jadi gambar boleh utuh tanpa bolong —
 *      foto menutupi bagian tengahnya sendiri. Isi `footerFade` dengan
 *      warna krem gambar supaya teks nama/tanggal di footer tetap
 *      terbaca (bagian bawah di-fade ke warna itu).
 *    Contoh siap pakai + panduannya ada di
 *    `public/assets/photobooth/frames/README.md`.
 */

export type LayoutId = "duo" | "trio" | "classic" | "portrait";

export interface PhotoboothLayout {
  id: LayoutId;
  name: string;
  desc: string;
  shots: number;
  orientation: "Vertikal" | "Persegi" | "Horizontal";
  badge?: string;
  /** rasio foto (lebar / tinggi) di dalam strip */
  photoAspect: number;
  /** lebar kanvas output (px) */
  outW: number;
}

/** Empat strip vertikal (desain Roar 2026-11-18, dari mockup + Potret 1 foto
 *  ditambah 2026-11-19): Duo 2 pose, Classic 4 pose (bawaan terpilih),
 *  Trio 3 pose, Potret 1 pose. Grid 2×2 dan Duet dihapus — semua pilihan
 *  sekarang strip vertikal. */
export const LAYOUTS: PhotoboothLayout[] = [
  {
    id: "duo",
    name: "Duo",
    desc: "Dua pose dalam satu strip.",
    shots: 2,
    orientation: "Vertikal",
    photoAspect: 4 / 3,
    outW: 900,
  },
  {
    id: "classic",
    name: "Classic",
    desc: "Empat pose, strip klasik.",
    shots: 4,
    orientation: "Vertikal",
    photoAspect: 4 / 3,
    outW: 900,
  },
  {
    id: "trio",
    name: "Trio",
    desc: "Tiga pose, strip klasik.",
    shots: 3,
    orientation: "Vertikal",
    photoAspect: 4 / 3,
    outW: 900,
  },
  {
    id: "portrait",
    name: "Potret",
    desc: "Satu pose besar, vertikal.",
    shots: 1,
    orientation: "Vertikal",
    photoAspect: 4 / 3,
    outW: 900,
  },
];

/** Layout bawaan terpilih (Classic, sesuai mockup Roar). */
export const DEFAULT_LAYOUT_ID: LayoutId = "classic";

export interface StripGeometry {
  w: number;
  h: number;
  pad: number;
  gap: number;
  footerH: number;
  photoW: number;
  photoH: number;
  /** posisi tiap foto di kanvas output */
  slots: { x: number; y: number; w: number; h: number }[];
}

/** Geometri kanvas output untuk satu layout (dipakai preview & unduhan).
 *  Semua layout sekarang strip vertikal satu kolom. */
export function layoutGeometry(layout: PhotoboothLayout): StripGeometry {
  const pad = 48;
  const gap = 24;
  const footerH = 192;
  const photoW = layout.outW - pad * 2;
  const photoH = Math.round(photoW / layout.photoAspect);
  const cols = 1;
  const rows = layout.shots;
  const h = pad + rows * photoH + (rows - 1) * gap + footerH + pad;
  const slots = Array.from({ length: layout.shots }, (_, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return {
      x: pad + c * (photoW + gap),
      y: pad + r * (photoH + gap),
      w: photoW,
      h: photoH,
    };
  });
  return { w: layout.outW, h, pad, gap, footerH, photoW, photoH, slots };
}

export type FrameConcept = "Klasik" | "Taman" | "Modern";

export interface PhotoboothFrame {
  id: string;
  name: string;
  concept: FrameConcept;
  /** warna latar strip */
  bg: string;
  /** warna teks footer */
  ink: string;
  /** warna aksen (garis pemisah, hiasan) */
  accent: string;
  /** warna garis tepi strip */
  border: string;
}

/** Bingkai warna bawaan (tema Pesta Teh). Tambah entri baru = frame baru. */
export const FRAMES: PhotoboothFrame[] = [
  { id: "teh-melati", name: "Teh Melati", concept: "Klasik", bg: "#FFFDF8", ink: "#3F4A2C", accent: "#EBA7B1", border: "#6F9440" },
  { id: "kebun-teh", name: "Kebun Teh", concept: "Klasik", bg: "#6F9440", ink: "#FDEEF2", accent: "#F9CBD3", border: "#FDEEF2" },
  { id: "jambu", name: "Jambu", concept: "Klasik", bg: "#FDEEF2", ink: "#6F9440", accent: "#EBA7B1", border: "#EBA7B1" },
  { id: "sogan", name: "Sogan", concept: "Klasik", bg: "#7A5A3A", ink: "#FFF6E8", accent: "#E8C97A", border: "#E8C97A" },
  { id: "porselen", name: "Porselen", concept: "Klasik", bg: "#FFFFFF", ink: "#2E4A6B", accent: "#7FA8C9", border: "#2E4A6B" },
  { id: "daun", name: "Daun", concept: "Klasik", bg: "#2F4A2C", ink: "#E1F1C3", accent: "#A8BD84", border: "#A8BD84" },
  { id: "kertas", name: "Kertas", concept: "Klasik", bg: "#F3EDE2", ink: "#3F4A2C", accent: "#6F9440", border: "#6F9440" },
  { id: "malam", name: "Malam", concept: "Klasik", bg: "#232323", ink: "#FDEEF2", accent: "#EBA7B1", border: "#EBA7B1" },
];

export const FRAME_CONCEPTS: ("Semua" | FrameConcept)[] = ["Semua", "Klasik", "Taman", "Modern"];

/** Bingkai gambar — lihat README di folder frames. */
export interface ImageFrame {
  id: string;
  name: string;
  concept: FrameConcept;
  /** path di public/, mis. /assets/photobooth/frames/renda-teh-strip.svg */
  src: string;
  layouts: LayoutId[];
  /** "drawn": teks footer tetap digambar kode; "none": frame sudah membawa teks sendiri */
  footer: "drawn" | "none";
  /** "overlay" (bawaan): gambar di atas foto, tengah harus transparan.
   *  "background": gambar full di bawah foto (cover-fit, ala inveet). */
  layer?: "overlay" | "background";
  /** khusus background: warna krem untuk fade footer supaya teks terbaca */
  footerFade?: string;
}

export const IMAGE_FRAMES: ImageFrame[] = [
  {
    id: "renda-teh",
    name: "Renda Teh",
    concept: "Klasik",
    src: "/assets/photobooth/frames/renda-teh-strip.svg",
    layouts: ["trio"],
    footer: "drawn",
    layer: "overlay",
  },
  {
    id: "botanical",
    name: "Botanical",
    concept: "Klasik",
    src: "/assets/photobooth/frames/botanical.webp",
    layouts: ["duo", "trio", "classic", "portrait"],
    footer: "drawn",
    layer: "background",
    footerFade: "#F3EADB",
  },
];

export interface PhotoboothFont {
  id: string;
  name: string;
  /** nama family yang dipakai canvas + CSS */
  family: string;
  /** ukuran contoh "Aa" di tab Font — disamakan tampaknya (script lebih besar, Cinzel lebih kecil) */
  samplePx: number;
}

/** Pilihan font — disamakan dengan inveet (Playfair default). */
export const FONTS: PhotoboothFont[] = [
  { id: "playfair", name: "Playfair", family: "'Playfair Display', serif", samplePx: 26 },
  { id: "cormorant", name: "Cormorant", family: "'Cormorant Garamond', serif", samplePx: 26 },
  { id: "cinzel", name: "Cinzel", family: "Cinzel, serif", samplePx: 21 },
  { id: "dancing", name: "Dancing", family: "'Dancing Script', cursive", samplePx: 30 },
  { id: "caveat", name: "Caveat", family: "Caveat, cursive", samplePx: 30 },
  { id: "montserrat", name: "Montserrat", family: "Montserrat, sans-serif", samplePx: 25 },
];

export type ShapeId = "kotak" | "lembut" | "polaroid";

export const SHAPES: { id: ShapeId; name: string; desc: string }[] = [
  { id: "kotak", name: "Kotak", desc: "Sudut tegas, tanpa lengkung." },
  { id: "lembut", name: "Lembut", desc: "Sudut membulat, halus." },
  { id: "polaroid", name: "Polaroid", desc: "Bingkai putih tebal ala polaroid." },
];

export type FilterOp = ["grayscale" | "sepia" | "saturate" | "contrast" | "brightness" | "hue-rotate", number];

export interface PhotoboothFilter {
  id: string;
  name: string;
  /** nilai CSS filter — dipakai di preview video & saat menggambar ke kanvas */
  css: string;
  /** langkah yang sama dalam bentuk data — dipakai fallback piksel di
   *  browser yang tidak mendukung ctx.filter (mis. Safari lama) */
  ops: FilterOp[];
}

export const FILTERS: PhotoboothFilter[] = [
  { id: "asli", name: "Asli", css: "none", ops: [] },
  { id: "klasik", name: "Klasik", css: "saturate(1.15) contrast(1.06) sepia(0.12)", ops: [["saturate", 1.15], ["contrast", 1.06], ["sepia", 0.12]] },
  { id: "mono", name: "Mono", css: "grayscale(1)", ops: [["grayscale", 1]] },
  { id: "noir", name: "Noir", css: "grayscale(1) contrast(1.35) brightness(0.95)", ops: [["grayscale", 1], ["contrast", 1.35], ["brightness", 0.95]] },
  { id: "sepia", name: "Sepia", css: "sepia(0.85)", ops: [["sepia", 0.85]] },
  { id: "hangat", name: "Hangat", css: "sepia(0.4) saturate(1.5) contrast(1.05)", ops: [["sepia", 0.4], ["saturate", 1.5], ["contrast", 1.05]] },
  { id: "sejuk", name: "Sejuk", css: "saturate(1.15) hue-rotate(-18deg) brightness(1.06)", ops: [["saturate", 1.15], ["hue-rotate", -18], ["brightness", 1.06]] },
  { id: "pudar", name: "Pudar", css: "contrast(0.82) brightness(1.12) saturate(0.65)", ops: [["contrast", 0.82], ["brightness", 1.12], ["saturate", 0.65]] },
];

export const DEFAULT_FILTER_ID = "klasik";
export const DEFAULT_FRAME_ID = "teh-melati";
export const DEFAULT_FONT_ID = "playfair";
export const DEFAULT_SHAPE_ID: ShapeId = "lembut";

/** Teks UI studio (Bahasa Indonesia). */
export const PHOTOBOOTH_COPY = {
  title: "Photobooth",
  tagline: "Berpose sebentar. Bawa pulang ceritanya.",
  /** label strip yang terpilih di langkah 1 */
  selected: "Terpilih",
  /** tombol langkah 1: buka galeri strip tersimpan di perangkat ini */
  viewGuestPhotos: "Lihat foto tamu",
  step1: "Pilih tata letak",
  step1Desc: "Pilih satu gaya, lalu abadikan momenmu dalam beberapa jepretan.",
  step2: "Ambil foto",
  step3: "Buat hasil",
  tip: "Tip: minta pasanganmu berpose di sampingmu. Bingkai dan teks bisa kamu atur setelah berfoto.",
  backToInvite: "Kembali ke undangan",
  cameraTitle: "Akses kamera",
  cameraDesc: "Kamera hanya dipakai di sesi ini untuk mengambil fotomu.",
  toCamera: "Lanjutkan ke kamera",
  fromGallery: "Pilih foto dari galeri",
  later: "Nanti saja",
  waitingCamera: "Menunggu izin kamera",
  waitingCameraDesc: "Selesaikan prompt izin dari browser. Kalau tidak terlihat, periksa ikon kamera di bilah alamat.",
  cameraDenied: "Kamera tidak bisa dipakai",
  cameraDeniedDesc:
    "Izin kamera ditolak atau perangkatmu tidak punya kamera. Kamu tetap bisa pilih foto dari galeri.",
  shotsTaken: (n: number, total: number) => `${n} dari ${total} foto sudah diambil`,
  reviewTitle: "Mana pose favoritmu?",
  reviewDesc: "Ketuk satu foto untuk mengulang, atau lanjutkan ke pilihan bingkai.",
  retakeOne: (n: number) => `Ulangi bidikan ${n}`,
  retakeAll: "Ulang semua",
  toFrame: "Pilih bingkai",
  resultTitle: "Pilih sentuhan akhirnya",
  resultDesc: "Pilih bingkai untuk membalut potretmu.",
  tabFrame: "Bingkai",
  tabFont: "Font",
  tabShape: "Bentuk",
  tabFilter: "Filter",
  frameConcept: "Konsep bingkai",
  fontHint: "Mulai dengan yang terasa paling kamu.",
  shapeHint: "Satu detail kecil yang mengubah suasana.",
  filterHint: "Siap dibawa pulang. Simpan untuk dikenang di hari-hari nanti.",
  save: "Simpan",
  share: "Bagikan",
  shareText:
    "Baru aja mengabadikan momen di pernikahan Dinda & Rikky, 20 Desember 2026! 📸✨ #taNDAkeseRIusan",
  restart: "Ulang",
  saved: "Strip tersimpan di perangkatmu.",
  shareFallback:
    "Bagikan tidak didukung di browser ini — strip sudah diunduh, teks caption sudah disalin, tinggal tempel.",
  privacy: "Foto diproses di perangkatmu dan tidak dikirim ke server.",
  privacyShort: "Foto diproses di perangkatmu",
  auto: "Otomatis",
  autoOn: "Mode otomatis aktif — semua pose diambil berurutan.",
  grid: "Garis bantu",
  zoom: "Zoom",
  switchCamera: "Ganti kamera",
  lastShot: "Bidikan terakhir",
  myPhotos: "Foto Saya",
  myPhotosEmpty: "Belum ada strip yang kamu simpan di perangkat ini.",
  myPhotosNote: "Strip yang kamu simpan lewat tombol Simpan muncul di sini.",
  delete: "Hapus",
  download: "Unduh",
};

/** Nama file unduhan strip. */
export function stripFileName(): string {
  return `photobooth-dinda-rikky-${new Date().toISOString().slice(0, 10)}.png`;
}

/** Kunci localStorage untuk strip yang disimpan di perangkat ini. */
export const MY_STRIPS_KEY = "dinda-rikky-photobooth-mine";
export const MY_STRIPS_MAX = 12;
