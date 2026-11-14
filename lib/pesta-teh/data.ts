/**
 * Data & konstanta undangan pernikahan Dinda & Rikky.
 */

const asset = (file: string, width: number, height: number) => ({
  src: `/assets/pesta-teh/${file}`,
  width,
  height,
});

export const ASSETS = {
  envelopeClosed: { ...asset("envelope-closed.webp", 715, 546), seal: { x: 0.503, y: 0.485 } },
  envelopeOpen: asset("envelope-open.webp", 657, 871),
  envelopePocket: asset("envelope-pocket.webp", 657, 871),
  seal: asset("seal.webp", 267, 263),
  flowers: asset("flowers.webp", 386, 669),
  plate: asset("plate.webp", 596, 595),
  swan: asset("swan.webp", 400, 279),
  orchid: asset("orchid.webp", 250, 900),
  rosebud: asset("rosebud.webp", 360, 205),
  venue: asset("venue.webp", 900, 580),
  bow: asset("bow.webp", 289, 359),
  cosmos: asset("cosmos.webp", 196, 360),
  teacup: asset("teacup.webp", 365, 323),
  grass: asset("grass.webp", 1000, 982),
  poses: [
    asset("pose-1.webp", 900, 1095),
    asset("pose-2.webp", 900, 1095),
    asset("pose-3.webp", 900, 1095),
    asset("pose-4.webp", 900, 1095),
  ],
} as const;

export type ArtKey = "flowers" | "cosmos" | "orchid" | "rosebud";

/** Palet default tema Pesta Teh ("Jambu Zaitun") */
export const PALETTE = {
  id: "jambu-zaitun",
  name: "Jambu Zaitun",
  primary: "#6F9440",
  accent: "#EBA7B1",
  bg: "#FFFFFF",
  surface: "#FDEEF2",
  text: "#3F4A2C",
  muted: "#7D8968",
};

/** Warna tambahan khusus Pesta Teh */
export const PT_COLORS = {
  pink: "#F9CBD3",
  leaf: "#E1F1C3",
  pale: "#C5DE9B",
  sage: "#A8BD84",
};

/** CSS variables untuk satu palet (sama seperti util `tG` di bundel asli) */
export function paletteVars(p = PALETTE): Record<string, string> {
  return {
    "--theme-primary": p.primary,
    "--theme-accent": p.accent,
    "--theme-bg": p.bg,
    "--theme-surface": p.surface,
    "--theme-text": p.text,
    "--theme-muted": p.muted,
    "--theme-accent-text": "#2B2725",
    "--theme-primary-text": "#FFFFFF",
    "--pt-pink": PT_COLORS.pink,
    "--pt-leaf": PT_COLORS.leaf,
    "--pt-pale": PT_COLORS.pale,
    "--pt-sage": PT_COLORS.sage,
  };
}

/** Teks statis tema (objek `yER` di bundel asli) */
export const COPY = {
  invited: "The Wedding of",
  swipe: "geser untuk membuka undangan",
  tapMusic: "Tap to Music",
  theDay: "the day!!",
  greeting:
    "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
  coupleTitle: "Mempelai",
  bride: "Mempelai Wanita",
  groom: "Mempelai Pria",
  location: "Lokasi",
  rundownKicker: "Menu Hari Ini",
  rundownTitle: "Susunan Acara",
  storyTitle: "Kisah Kami",
  galleryTitle: "Galeri",
  music: "Ketuk untuk musik",
  dresscodeTitle: "Dress Code",
  galleryHint: "Geser untuk melihat foto lainnya",
  photoboothTitle: "Photobooth",
  photoboothTake: "Ambil Foto",
  photoboothGallery: "Lihat Foto Tamu",
  photoboothNote:
    "Ambil foto bersama bingkai undangan kami. Fotomu akan tersimpan di galeri tamu.",
  rsvp: "Mohon konfirmasi kehadiran serta titipkan doa terbaik untuk kami.",
  wishes: "Tuliskan doa dan ucapan terbaik untuk kami.",
  giftTitle: "Tanda Kasih",
  gift:
    "Doa restu Bapak/Ibu/Saudara/i adalah hadiah terindah bagi kami. Namun jika ingin memberi tanda kasih, dapat melalui:",
  thanksA: "Thank",
  thanksB: "You!",
  thanksNote: "for being part of our special day",
  closing:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
};

/** Terjemahan UI bahasa Indonesia (`ranum` di bundel asli) */
const CHILD_ORDER: Record<string, string> = {
  pertama: "Pertama",
  sulung: "Sulung",
  kedua: "Kedua",
  ketiga: "Ketiga",
  keempat: "Keempat",
  kelima: "Kelima",
  keenam: "Keenam",
  bungsu: "Bungsu",
  tunggal: "Tunggal",
};

export const ID = {
  defaults: { guest: "Tamu Undangan" },
  cover: { dear: "Kepada Yth. Bapak/Ibu/Saudara/i", open: "Buka undangan" },
  couple: {
    childOf: (relation: "son" | "daughter", order?: string | null) => {
      const label = order ? CHILD_ORDER[order] ?? "" : "";
      return `${relation === "son" ? "Putra" : "Putri"}${label ? ` ${label}` : ""} dari`;
    },
  },
  saveDate: {
    addToCalendar: "Simpan Tanggal",
    calendarTitle: (names: string) => `Pernikahan ${names}`,
  },
  events: { location: "Lihat Lokasi" },
  gallery: {
    view: (n: number) => `Lihat foto ${n}`,
    photo: (n: number) => `Foto ${n}`,
  },
  gift: {
    sendTo: "Kirim kado ke",
    address: "Alamat",
    copy: "Salin",
    copied: "Tersalin",
    zoomQris: "Perbesar QRIS",
  },
  rsvp: {
    wishesTitle: "Doa & Ucapan",
    thanks: "Terima kasih",
    received: (pax: number, events: string[] | null) =>
      `Kehadiran ${pax} orang${events?.length ? ` di ${events.join(" dan ")}` : ""} sudah kami terima.`,
    wishReceived: "Doa dan ucapanmu sudah kami terima.",
    again: "Kirim lagi",
    name: "Nama lengkap",
    nameLabel: "Nama",
    attendance: "Kehadiran",
    guestOf: "Tamu dari",
    events: "Acara yang akan dihadiri",
    paxLabel: "Jumlah tamu",
    people: (n: number) => `${n} orang`,
    messageLabel: "Ucapan",
    message: "Tulis doa dan ucapan",
    sending: "Mengirim…",
    send: "Kirim",
  },
  closing: { wassalam: "Wassalamu'alaikum Warahmatullahi Wabarakatuh" },
};

// DUGAAN: daftar kategori asli (`iqg`) tidak ikut ter-capture; tidak dipakai di demo (showCategory = false).
export const GUEST_CATEGORIES = [
  { value: "keluarga", label: "Keluarga" },
  { value: "teman", label: "Teman" },
];

/** Data undangan yang dipakai halaman utama (/) */
export interface WeddingData {
  id: string;
  slug: string;
  groom: string;
  bride: string;
  groomNickname: string;
  brideNickname: string;
  groomInstagram?: string;
  brideInstagram?: string;
  groomPhoto: string;
  bridePhoto: string;
  fatherGroom: string;
  motherGroom: string;
  fatherBride: string;
  motherBride: string;
  groomChildOrder?: string | null;
  brideChildOrder?: string | null;
  nameOrder?: "bride-first" | "groom-first";
  date: string;
  venue: string;
  akadTitle: string;
  resepsiTitle: string;
  akad: string;
  resepsi: string;
  akadVenue: string;
  resepsiVenue: string;
  akadAddress: string;
  resepsiAddress: string;
  akadMapsUrl: string;
  mapsUrl: string;
  openingGreeting?: string | null;
  isMuslimGreeting?: boolean;
  isQuote?: boolean;
  quoteText?: string | null;
  quoteSource?: string | null;
  isCouplePhoto?: boolean;
  isDressCode?: boolean;
  isRsvp?: boolean;
  isWishes?: boolean;
  dresscode?: string;
  dresscodeColors?: { wear: { name: string; color: string }[] };
  qrisPhoto?: string;
  giftAddress?: string;
  giftReceiver?: string;
  hashtag?: string;
  story: { title: string; description: string; date: string; photoUrl: string | null }[];
  photos: string[];
  gifts: { bank: string; accountNumber: string; accountName: string }[];
  rundown: { time: string; label: string; icon: string }[];
  musicUrl?: string;
}

const groom = "Rikky Arisendi";
const bride = "Dinda Intan Pratiwi";

const story = [
  {
    title: "Pertemuan Tak Terduga",
    description:
      "Kami pertama bertemu dalam sebuah pertemuan sederhana yang tak pernah terbayangkan sebelumnya. Satu percakapan menjadi awal dari segalanya.",
    date: "2021",
  },
  {
    title: "Bertumbuh Bersama",
    description:
      "Dari perkenalan yang sederhana, tumbuh kebersamaan yang hangat. Kami belajar saling memahami, mempercayai, dan mendukung satu sama lain.",
    date: "2022",
  },
  {
    title: "Ikrar Suci",
    description:
      "Kini dengan penuh rasa syukur dan doa dari kedua keluarga, kami mantap melangkah bersama menuju bahtera rumah tangga yang sakinah, mawaddah, warahmah.",
    date: "2024",
  },
];

// Foto galeri: tambah file gallery-3.webp dst ke public/assets/illustrations/
// lalu uncomment baris di bawah.
const galleryPhotos = [
  "/assets/illustrations/gallery-1.webp",
  "/assets/illustrations/gallery-2.webp",
  // "/assets/illustrations/gallery-3.webp",
  // "/assets/illustrations/gallery-4.webp",
  // "/assets/illustrations/gallery-5.webp",
];

export const WEDDING: WeddingData = {
  id: "bbbbbbbb-0000-0000-0000-000000000001",
  slug: "dinda-rikky",
  groom,
  bride,
  groomNickname: "Rikky",
  brideNickname: "Dinda",
  nameOrder: "bride-first",
  groomPhoto: "/assets/illustrations/groom.webp",
  bridePhoto: "/assets/illustrations/bride.webp",
  fatherGroom: "H. Pratama Wibowo",
  motherGroom: "Hj. Rahmawati",
  fatherBride: "H. Salman Al-Farisi",
  motherBride: "Hj. Nur Azizah",
  date: "2025-11-22T09:00:00.000Z",
  venue: "Masjid Raya Balikpapan",
  mapsUrl: "https://maps.google.com/?q=Grand+Senyiur+Hotel+Balikpapan",
  akadTitle: "Akad Nikah",
  resepsiTitle: "Resepsi Nikah",
  akad: "09:00 – 11:00 WITA",
  resepsi: "12:00 – 16:00 WITA",
  akadVenue: "Masjid Raya Balikpapan",
  resepsiVenue: "Grand Senyiur Hotel Balikpapan",
  akadAddress: "Jl. Jend. Sudirman No.20, Balikpapan",
  resepsiAddress: "Jl. Jend. Sudirman No.20, Balikpapan",
  akadMapsUrl: "https://maps.google.com/?q=Grand+Senyiur+Hotel+Balikpapan",
  isQuote: true,
  quoteText: null,
  quoteSource: null,
  isDressCode: false,
  dresscode: "Batik Sogan & Royal Navy",
  qrisPhoto: "/assets/illustrations/qris.webp",
  giftAddress: "Jl. H. Pratama Wibowo No.12, Kebayoran Baru, Jakarta Selatan 12110",
  giftReceiver: groom,
  hashtag: "DindaRikky",
  story: story.map((s) => ({ ...s, photoUrl: null })),
  photos: galleryPhotos,
  gifts: [
    { bank: "BCA", accountNumber: "1234567890", accountName: groom },
    { bank: "Mandiri", accountNumber: "0987654321", accountName: bride },
  ],
  rundown: [
    { time: "08:00 WIB", label: "Kedatangan Tamu & Registrasi", icon: "arrive" },
    { time: "09:00 WIB", label: "Prosesi Akad Nikah", icon: "ceremony" },
    { time: "10:30 WIB", label: "Ramah Tamah & Foto Bersama", icon: "drinks" },
    { time: "11:00 WIB", label: "Resepsi Nikah & Santap Siang", icon: "dinner" },
    { time: "13:00 WIB", label: "Pemotongan Kue & Acara Santai", icon: "cake" },
  ],
  musicUrl: "/assets/bgm.mp3",
};
