"use client";

import { useState } from "react";

export interface RsvpForm {
  name: string;
  setName: (v: string) => void;
  attendance: "hadir" | "tidak" | null;
  setAttendance: (v: "hadir" | "tidak") => void;
  pax: number;
  setPax: (v: number) => void;
  maxPax: number;
  message: string;
  setMessage: (v: string) => void;
  sticker: string;
  setSticker: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  showCategory: boolean;
  events: string[];
  toggleEvent: (e: string) => void;
  eventChoices: string[] | null;
  submitting: boolean;
  error: string | null;
  submit: (opts?: { customMessage?: string; skipRsvp?: boolean }) => Promise<boolean>;
}

/**
 * Hook form RSVP/ucapan (pengganti hook `d.u` di bundel asli).
 * Mengirim ke POST /api/rsvp — implementasikan sendiri di backend kamu.
 */
export function useRsvpForm(opts: {
  slug: string;
  initialName?: string;
  eventChoices?: string[] | null;
  maxPax?: number;
}): RsvpForm {
  const [name, setName] = useState(opts.initialName ?? "");
  const [attendance, setAttendance] = useState<"hadir" | "tidak" | null>(null);
  const [pax, setPax] = useState(1);
  const [message, setMessage] = useState("");
  const [sticker, setSticker] = useState("");
  const [category, setCategory] = useState("");
  const [events, setEvents] = useState<string[]>(opts.eventChoices ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(o?: { customMessage?: string; skipRsvp?: boolean }) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: opts.slug,
          name,
          attendance: o?.skipRsvp ? null : attendance,
          pax,
          category,
          events,
          message: o?.customMessage ?? message,
          sticker,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengirim");
      setMessage("");
      setSticker("");
      return true;
    } catch {
      setError("Gagal mengirim, coba lagi.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    name,
    setName,
    attendance,
    setAttendance,
    pax,
    setPax,
    maxPax: opts.maxPax ?? 5,
    message,
    setMessage,
    sticker,
    setSticker,
    category,
    setCategory,
    showCategory: false,
    events,
    toggleEvent: (e) => setEvents((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e])),
    eventChoices: opts.eventChoices && opts.eventChoices.length > 1 ? opts.eventChoices : null,
    submitting,
    error,
    submit,
  };
}
