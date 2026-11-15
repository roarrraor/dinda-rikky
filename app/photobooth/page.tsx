import type { Metadata } from "next";
import { PhotoboothStudio } from "@/components/wedding/photobooth";
import { WEDDING } from "@/lib/wedding/data";
import { formatDate } from "@/lib/wedding/format";

export const metadata: Metadata = {
  title: "Photobooth — The Wedding of Dinda & Rikky",
  description:
    "Berpose sebentar, bawa pulang ceritanya. Photobooth Dinda & Rikky — pilih tata letak, ambil foto, atur bingkai, lalu simpan stripnya.",
};

export default function PhotoboothPage() {
  return (
    <PhotoboothStudio
      caption={{
        names: "DINDA & RIKKY",
        date: formatDate(WEDDING.date, "DD.MM.YY"),
        tag: WEDDING.hashtag ? `#${WEDDING.hashtag}` : null,
      }}
    />
  );
}
