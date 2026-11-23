import type { Metadata } from "next";
import { getWeddingData } from "@/lib/wedding/settings";
import { resolveGuestName } from "@/lib/wedding/guests";
import { Wedding } from "@/components/wedding/wedding";

const SITE_URL = "https://dinda-rikky.love";
// 5 foto Prawed untuk thumbnail OG — dipilih acak per tamu (hash nama),
// jadi tiap link personal tampil foto yang beda, bukan cuma gallery-1 terus.
const OG_IMAGES = [
  "/assets/illustrations/gallery-1.webp",
  "/assets/illustrations/gallery-2.webp",
  "/assets/illustrations/gallery-3.webp",
  "/assets/illustrations/gallery-4.webp",
  "/assets/illustrations/gallery-5.webp",
];

/** Pilih 1 dari 5 foto: stabil per nama tamu (hash), acak kalau tanpa nama. */
function pickOgImage(seed?: string | null): string {
  if (!seed) return OG_IMAGES[Math.floor(Math.random() * OG_IMAGES.length)];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return OG_IMAGES[h % OG_IMAGES.length];
}

// Metadata OG dinamis: kalau link pakai ?to=Nama+Tamu, judul + deskripsi
// preview WhatsApp ikut nama tamunya. Tanpa ?to=, pakai judul umum.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}): Promise<Metadata> {
  const { to } = await searchParams;
  const guest = resolveGuestName(to);
  const title = guest
    ? `Halo, ${guest}! Jangan Lupa Datang Ya`
    : "The Wedding of Dinda & Rikky";
  const description = guest
    ? `Halo ${guest}, kamu diundang ke pernikahan Dinda & Rikky, Minggu, 20 Desember 2026. Kami tunggu kehadiranmu!`
    : "Undangan pernikahan digital Dinda Intan Pratiwi & Rikky Arisendi. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.";
  const url = to
    ? `${SITE_URL}/?to=${encodeURIComponent(to)}`
    : SITE_URL;
  // Thumbnail OG acak per tamu (hash nama) — tiap link personal beda foto.
  const ogImage = pickOgImage(to);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "The Wedding of Dinda & Rikky",
      images: [{ url: ogImage, width: 1080, height: 1935, alt: "Dinda & Rikky" }],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// Nama tamu bisa dikirim lewat query: /?to=Budi
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  const data = await getWeddingData();
  return <Wedding data={data} guestName={to} />;
}
