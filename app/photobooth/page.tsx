import type { Metadata } from "next";
import { PhotoboothStudio } from "@/components/wedding/photobooth";
import { WEDDING } from "@/lib/wedding/data";
import { formatDate } from "@/lib/wedding/format";

const SITE_URL = "https://dinda-rikky.love";
// Thumbnail OG photobooth: ilustrasi karakter chibi (pose dadah), bukan foto.
const OG_IMAGE = "/assets/wedding/pose-1.webp";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Photobooth — The Wedding of Dinda & Rikky",
  description:
    "Berpose sebentar, bawa pulang ceritanya. Photobooth Dinda & Rikky — pilih tata letak, ambil foto, atur bingkai, lalu simpan stripnya.",
  openGraph: {
    title: "Photobooth — The Wedding of Dinda & Rikky",
    description:
      "Berpose sebentar, bawa pulang ceritanya. Photobooth Dinda & Rikky — pilih tata letak, ambil foto, atur bingkai, lalu simpan stripnya.",
    url: `${SITE_URL}/photobooth`,
    siteName: "The Wedding of Dinda & Rikky",
    images: [{ url: OG_IMAGE, width: 896, height: 1200, alt: "Dinda & Rikky — Photobooth" }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photobooth — The Wedding of Dinda & Rikky",
    description:
      "Berpose sebentar, bawa pulang ceritanya. Photobooth Dinda & Rikky — pilih tata letak, ambil foto, atur bingkai, lalu simpan stripnya.",
    images: [OG_IMAGE],
  },
};

export default function PhotoboothPage() {
  return (
    <PhotoboothStudio
      caption={{
        names: "Dinda & Rikky",
        date: formatDate(WEDDING.date, "DD.MM.YY"),
        tag: WEDDING.hashtag ? `#${WEDDING.hashtag}` : null,
      }}
    />
  );
}
