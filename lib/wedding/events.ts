import type { WeddingData } from "./data";
import { WEDDING } from "./data";

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
 * walau pengaturan admin (Supabase) masih menyimpan nilai lamanya.
 * Lokasi akad diambil dari WEDDING (data.ts), BUKAN dari pengaturan
 * admin — karena pengaturan admin masih menyimpan "KUA Mojosari"
 * yang sudah dikoreksi Roar menjadi rumah mempelai wanita
 * (Dusun Krajan Wetan, Mojosari, Sumbersuko). */
export function buildEvents(w: WeddingData): WeddingEvent[] {
  const events: WeddingEvent[] = [];
  if (w.akad || WEDDING.akadVenue) {
    events.push({
      title: w.akadTitle,
      time: w.akad,
      venue: WEDDING.akadVenue,
      address: WEDDING.akadAddress,
      mapsUrl: WEDDING.akadMapsUrl,
    });
  }
  return events;
}
