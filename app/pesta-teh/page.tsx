import type { Metadata } from "next";
import { PreviewPage } from "@/components/pesta-teh/preview-page";

export const metadata: Metadata = {
  title: "Preview Tema Pesta Teh | kalabertemu.id",
  robots: { index: false, follow: false },
};

// Nama tamu bisa dikirim lewat query: /pesta-teh?to=Budi
export default async function Page({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  return <PreviewPage guestName={to} />;
}
