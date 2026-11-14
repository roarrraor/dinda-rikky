import type { Metadata } from "next";
import { WEDDING } from "@/lib/pesta-teh/data";
import { WeddingPestaTeh } from "@/components/pesta-teh/wedding-pesta-teh";

export const metadata: Metadata = {
  title: "The Wedding of Dinda & Rikky",
  description:
    "Undangan pernikahan digital Dinda Intan Pratiwi & Rikky Arisendi. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
};

// Nama tamu bisa dikirim lewat query: /?to=Budi
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  return <WeddingPestaTeh data={WEDDING} guestName={to} />;
}
