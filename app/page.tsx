import type { Metadata } from "next";
import { getWeddingData } from "@/lib/wedding/settings";
import { resolveGuestName } from "@/lib/wedding/guests";
import { Wedding } from "@/components/wedding/wedding";

const SITE_URL = "https://dinda-rikky-weld.vercel.app";
const OG_IMAGE = "/assets/illustrations/gallery-1.webp";

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
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "The Wedding of Dinda & Rikky",
      images: [{ url: OG_IMAGE, width: 1092, height: 1440, alt: "Dinda & Rikky" }],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}

// Nama tamu bisa dikirim lewat query: /?to=Budi
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  const data = await getWeddingData();
  return <Wedding data={data} guestName={to} />;
}
