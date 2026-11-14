import type { WeddingData } from "./data";

export interface WeddingEvent {
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  address?: string;
  mapsUrl?: string;
}

/** Susun daftar acara (akad + resepsi) dari data pernikahan. */
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
  if (w.resepsi || w.resepsiVenue) {
    events.push({
      title: w.resepsiTitle,
      time: w.resepsi,
      venue: w.resepsiVenue,
      address: w.resepsiAddress,
      mapsUrl: w.mapsUrl,
    });
  }
  return events;
}
