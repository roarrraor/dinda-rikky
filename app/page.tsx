import type { Metadata } from "next";
import { getWeddingData } from "@/lib/wedding/settings";
import { Wedding } from "@/components/wedding/wedding";

export const metadata: Metadata = {
  title: "The Wedding of Dinda & Rikky",
  description:
    "Undangan pernikahan digital Dinda Intan Pratiwi & Rikky Arisendi. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.",
};

// Nama tamu bisa dikirim lewat query: /?to=Budi
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  const data = await getWeddingData();
  return <Wedding data={data} guestName={to} />;
}
