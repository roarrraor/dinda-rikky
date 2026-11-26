/**
 * Data & konstanta undangan pernikahan Dinda & Rikky.
 */

const asset = (file: string, width: number, height: number) => ({
  src: `/assets/wedding/${file}`,
  width,
  height,
});

export const ASSETS = {
  envelopeClosed: { ...asset("envelope-closed.webp", 715, 546), seal: { x: 0.503, y: 0.485 } },
  envelopeOpen: asset("envelope-open.webp", 657, 871),
  envelopePocket: asset("envelope-pocket.webp", 657, 871),
  seal: asset("seal.webp", 267, 263),
  sealMonogram: asset("seal-monogram.webp", 400, 614),
  flowers: asset("flowers.webp", 386, 669),
  plate: asset("plate.webp", 596, 595),
  swan: asset("swan.webp", 400, 279),
  orchid: asset("orchid.webp", 250, 900),
  rosebud: asset("rosebud.webp", 360, 205),
  venue: asset("venue.webp", 900, 580),
  bow: asset("bow.webp", 289, 359),
  ovalFrame: asset("oval-frame.webp", 1096, 1409),
  cosmos: asset("cosmos.webp", 196, 360),
  teacup: asset("teacup.webp", 365, 323),
  grass: asset("grass.webp", 1000, 982),
  dresscode: asset("dresscode-illustration.png", 968, 751),
  // Aset hiasan RSVP (dipotong dari referensi Roar): 4 potret bundar tamu,
  // kalender tanggal 20, kue, dan party popper.
  rsvp: {
    guests: [
      asset("rsvp-p1-man-curly.webp", 340, 340),
      asset("rsvp-p2-couple.webp", 340, 340),
      asset("rsvp-p3-man-beige.webp", 340, 340),
      asset("rsvp-p4-woman.webp", 340, 340),
    ],
    calendar: asset("rsvp-calendar.png", 335, 356),
    cake: asset("rsvp-cake.png", 298, 290),
    popper: asset("rsvp-popper.png", 387, 337),
  },
  // Pose ilustrasi couple (10 kartun chibi Rikky & Dinda).
  poses: [
    asset("pose-1.webp", 896, 1200),
    asset("pose-2.webp", 896, 1200),
    asset("pose-3.webp", 896, 1200),
    asset("pose-4.webp", 896, 1200),
    asset("pose-5.webp", 896, 1200),
    asset("pose-6.webp", 896, 1200),
    asset("pose-7.webp", 896, 1200),
    asset("pose-8.webp", 896, 1200),
    asset("pose-9.webp", 896, 1200),
    asset("pose-10.webp", 896, 1200),
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
  photoboothCta: "Coba Photobooth",
  photoboothLayoutsLabel: "4 pilihan tata letak, gratis buat semua tamu",
  photoboothPrivacy: "Foto diproses di perangkatmu. Hanya strip yang dibagikan yang tampil di galeri.",
  photoboothNote: "Berpose sebentar, bawa pulang ceritanya.",
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
    alreadySent: "Satu browser hanya bisa mengirim satu ucapan.",
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
    title: "Cerita Awal",
    description:
      "Berawal dari sebuah percakapan sederhana di Telegram pada 19 Oktober 2020. Dua orang asing dipertemukan tanpa pernah menyangka bahwa percakapan itu akan menjadi awal dari sebuah perjalanan panjang.",
    date: "2020",
  },
  {
    title: "Pertemuan Pertama",
    description:
      "Pada 28 Desember 2022, akhirnya kami bertemu untuk pertama kalinya di kota Malang, Jawa Timur. Dari yang sebelumnya hanya saling mengenal melalui layar, kini kami mulai menciptakan cerita bersama.",
    date: "2022",
  },
  {
    title: "Menuju Masa Depan",
    description:
      "Perjalanan membawa kami pada langkah yang lebih serius. Dengan bertemunya kedua keluarga dan doa serta restu orang tua, kami memantapkan hati untuk melangkah bersama menuju kehidupan baru.",
    date: "2025",
  },
];

// Foto galeri: tambah file gallery-4.webp dst ke public/assets/illustrations/
// lalu uncomment baris di bawah.
const galleryPhotos = [
  "/assets/illustrations/gallery-1.webp",
  "/assets/illustrations/gallery-2.webp",
  "/assets/illustrations/gallery-3.webp",
  "/assets/illustrations/gallery-4.webp",
  "/assets/illustrations/gallery-5.webp",
];

export const WEDDING: WeddingData = {
  id: "bbbbbbbb-0000-0000-0000-000000000001",
  slug: "dinda-rikky",
  groom,
  bride,
  groomNickname: "Rikky",
  brideNickname: "Dinda",
  groomInstagram: "rikky",
  brideInstagram: "dinda",
  nameOrder: "bride-first",
  groomPhoto: "/assets/illustrations/groom.webp",
  bridePhoto: "/assets/illustrations/bride.webp",
  fatherGroom: "Bapak Sopandi",
  motherGroom: "Ibu Yani Mulyani",
  fatherBride: "Bapak Juwari",
  motherBride: "Ibu Khusnul Khotimah",
  date: "2026-12-20T06:00:00+07:00",
  venue: "Rumah Mempelai Wanita",
  mapsUrl: "https://maps.google.com/?q=Dusun+Krajan+Wetan+Mojosari+Sumbersuko+Lumajang",
  akadTitle: "Akad Nikah",
  resepsiTitle: "Resepsi Nikah",
  akad: "06:00 – 12:00 WIB",
  resepsi: "",
  akadVenue: "Rumah Mempelai Wanita",
  resepsiVenue: "",
  akadAddress: "Dusun Krajan Wetan, Mojosari, Sumbersuko, Lumajang, Jawa Timur 67316",
  resepsiAddress: "",
  akadMapsUrl: "https://maps.google.com/?q=Dusun+Krajan+Wetan+Mojosari+Sumbersuko+Lumajang",
  isQuote: true,
  quoteText: null,
  quoteSource: null,
  isDressCode: true,
  dresscode:
    "Kami akan sangat senang jika Bapak/Ibu/Saudara/i berkenan hadir dengan busana formal bernuansa Cream, Milo, Coksu, atau Putih.\n\nKehadiran dengan busana terbaik akan menyempurnakan suasana di hari bahagia kami.",
  dresscodeColors: {
    wear: [
      { name: "Cream", color: "#EFD6B8" },
      { name: "Milo", color: "#BC8F70" },
      { name: "Coksu", color: "#CCA68F" },
      { name: "Putih", color: "#FFFFFF" },
    ],
  },
  qrisPhoto: "/assets/illustrations/qris.webp",
  giftAddress: "Jl. H. Pratama Wibowo No.12, Kebayoran Baru, Jakarta Selatan 12110",
  giftReceiver: groom,
  hashtag: "taNDAkeseRIusan",
  story: story.map((s) => ({ ...s, photoUrl: null })),
  photos: galleryPhotos,
  gifts: [
    { bank: "BCA", accountNumber: "8105364110", accountName: groom },
    { bank: "BCA", accountNumber: "1251027329", accountName: bride },
  ],
  rundown: [
    { time: "08:00 WIB", label: "Kedatangan Tamu & Registrasi", icon: "arrive" },
    { time: "09:00 WIB", label: "Prosesi Akad Nikah", icon: "ceremony" },
    { time: "10:30 WIB", label: "Ramah Tamah & Foto Bersama", icon: "drinks" },
    { time: "13:00 WIB", label: "Pemotongan Kue & Acara Santai", icon: "cake" },
  ],
  musicUrl: "/assets/bgm.mp3",
};
