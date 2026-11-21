import type { WeddingData } from "./data";

export interface WeddingEvent {
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  mapsUrl?: string;
}

/** Susun daftar acara dari data pernikahan.
 * Hanya akad nikah — tidak ada resepsi (Roar, 2026-11-21).
 * Blok resepsi sengaja dihapus supaya acara resepsi tidak muncul
 * walau pengaturan admin (Supabase) masih menyimpan nilai lamanya. */
export function buildEvents(w: WeddingData): WeddingEvent[] {
  const events: WeddingEvent[] = [];
  if (w.akad || w.akadVenue) {
    events.push({
      title: w.akadTitle,
      time: w.akad,
      venue: w.akadVenue,
      address: w.akadAddress,
      mapsUrl: w.akadMapsUrl,
    });
  }
  return events;
}
