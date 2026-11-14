import type { Metadata } from "next";
import { getWeddingData } from "@/lib/pesta-teh/settings";
import { WeddingPestaTeh } from "@/components/pesta-teh/wedding-pesta-teh";

export const metadata: Metadata = {
  title: "The Wedding of Dinda & Rikky",
  description:
    "Undangan pernikahan digital Dinda Intan Pratiwi & Rikky Arisendi. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
};

// Nama tamu bisa dikirim lewat query: /?to=Budi
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  const data = await getWeddingData();
  return <WeddingPestaTeh data={data} guestName={to} />;
}
