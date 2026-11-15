"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "motion/react";
import { Camera, Check, CheckCircle2, ChevronDown, ChevronRight, Copy, Images, MessageCircle, Minus, PenLine, Plus, Smile, X } from "lucide-react";
import { ASSETS, COPY, ID, GUEST_CATEGORIES, paletteVars } from "@/lib/pesta-teh/data";
import { STICKERS, stickerSrc } from "@/lib/pesta-teh/stickers";
import { formatDate } from "@/lib/pesta-teh/format";
import { sanitizeRichText } from "@/lib/pesta-teh/sanitize";
import { useRsvpForm, type RsvpForm } from "./use-rsvp-form";
import { Lightbox } from "./lightbox";
import {
  Art,
  BODY,
  Drop,
  GINGHAM,
  GRASS,
  HAND,
  KICKER,
  LABEL,
  Polaroid,
  PtButton,
  Reveal,
  SCRIPT,
  ScallopCard,
  SectionTitle,
  Stagger,
  scallopMask,
} from "./primitives";

/* ---------- Kisah Kami ---------- */

export function StorySection({
  story,
}: {
  story?: { title: string; description: string; date?: string; photoUrl?: string | null }[];
}) {
  const items = (story ?? []).filter((s) => s.title?.trim() || s.description?.trim());
  if (items.length === 0) return null;
  return (
    <section id="pt-story" className="@container relative px-5 pt-10 pb-10">
      <Reveal>
        <SectionTitle>{COPY.storyTitle}</SectionTitle>
      </Reveal>
      <ScallopCard className="mt-10">
        <ol className="space-y-7">
          {items.map((s, i) => (
            <li key={`${s.title}-${i}`}>
              {i > 0 && <span aria-hidden className="mx-auto mb-6 block h-px w-24 bg-(--pt-sage)" />}
              {s.photoUrl && (
                <div className={`mx-auto mb-3 w-[46cqw] ${i % 2 ? "rotate-2" : "-rotate-2"}`}>
                  <Polaroid src={s.photoUrl} alt={s.title} />
                </div>
              )}
              {s.date && <p className={KICKER}>{s.date}</p>}
              <h3 className={`mt-1 text-[28px] text-(--theme-primary) wrap-break-word ${SCRIPT}`}>{s.title}</h3>
              <div
                className={`mt-1 wrap-break-word [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc [&>*+*]:mt-2 ${BODY}`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(s.description) }}
              />
            </li>
          ))}
        </ol>
      </ScallopCard>
    </section>
  );
}

/* ---------- Dress code ---------- */

export function DressCodeSection({
  note,
  wear,
}: {
  note?: string;
  wear: { name: string; color: string }[];
}) {
  if (!note?.trim() && wear.length === 0) return null;
  return (
    <section id="pt-dresscode" className="@container relative px-6 pt-8 pb-10 text-center">
      <Reveal>
        <SectionTitle>{COPY.dresscodeTitle}</SectionTitle>
        {note?.trim() && <p className={`mt-3 whitespace-pre-line ${BODY}`}>{note}</p>}
        {wear.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {wear.map((w) => (
              <li
                key={`${w.name}-${w.color}`}
                title={w.name}
                style={scallopMask(4)}
                className="grid size-16 place-items-center bg-(--theme-surface)"
              >
                <span
                  role="img"
                  aria-label={w.name}
                  className="block size-11 rounded-full ring-2 ring-white"
                  style={{ backgroundColor: w.color }}
                />
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}

/* ---------- Galeri ---------- */

export function GallerySection({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);
  if (photos.length === 0) return null;
  const step = (d: number) => setOpen((a) => (a === null ? a : (a + d + photos.length) % photos.length));

  return (
    <section id="pt-gallery" style={GINGHAM} className="@container relative py-10">
      <Reveal className="px-6">
        <SectionTitle>{COPY.galleryTitle}</SectionTitle>
      </Reveal>
      <ul
        className="hide-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[18cqw] pt-2 pb-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          const first = el.firstElementChild as HTMLElement | null;
          if (first) {
            setCurrent(Math.min(photos.length - 1, Math.round(el.scrollLeft / (first.offsetWidth + 16))));
          }
        }}
      >
        {photos.map((src, i) => (
          <li key={`${src}-${i}`} className={`w-[64cqw] shrink-0 snap-center ${i % 2 ? "rotate-2" : "-rotate-2"}`}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={ID.gallery.view(i + 1)}
              className="block w-full bg-white p-2 pb-8 shadow-[0_8px_16px_-6px_rgb(63_74_44/0.4)] cursor-zoom-in"
            >
              <span className="relative block aspect-3/4 overflow-hidden">
                <Image src={src} alt={ID.gallery.photo(i + 1)} fill sizes="280px" className="object-cover" />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {photos.length > 1 && (
        <div aria-hidden className="mt-2 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === current ? "w-5 bg-(--theme-primary)" : "w-2 bg-white"}`}
            />
          ))}
        </div>
      )}
      <p className="mx-auto mt-3 w-fit bg-white/85 px-3 py-1 font-cormorant text-[13px] text-(--theme-muted) italic">
        {COPY.galleryHint}
      </p>
      {open !== null && (
        <Lightbox
          src={photos[open]}
          alt={ID.gallery.photo(open + 1)}
          onClose={() => setOpen(null)}
          onPrev={photos.length > 1 ? () => step(-1) : undefined}
          onNext={photos.length > 1 ? () => step(1) : undefined}
        />
      )}
    </section>
  );
}

/* ---------- Photobooth ---------- */

/**
 * CATATAN: bagian kamera/upload photobooth asli (`PhotoboxSheet` + hook photobox) tidak ikut
 * ter-capture di mirror, jadi di sini hanya UI section-nya. Tombol membuka dialog placeholder.
 */
export function PhotoboothSection({
  caption,
}: {
  caption: { names: string; date: string; tag: string | null };
}) {
  const [dialog, setDialog] = useState<null | "take" | "wall">(null);
  const { poses } = ASSETS;

  return (
    <section id="pt-photobooth" className="@container relative bg-(--pt-leaf) px-6 pt-10 pb-12 text-center">
      <Reveal>
        <SectionTitle>{COPY.photoboothTitle}</SectionTitle>
        <p className={`mx-auto mt-3 max-w-76 ${BODY}`}>{COPY.photoboothNote}</p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-8 w-[42cqw] -rotate-3">
        <div className="bg-white px-[7%] pt-[7%] shadow-[0_16px_24px_-12px_rgb(63_74_44/0.55)]">
          <div className="space-y-[5%]">
            {poses.map((p) => (
              <div key={p.src} className="relative aspect-5/4 overflow-hidden">
                <Image src={p.src} alt="" fill sizes="160px" className="object-cover object-bottom" />
              </div>
            ))}
          </div>
          <div className="py-[10%] font-sans text-(--theme-text)">
            <p className="text-[8px] font-semibold tracking-[0.3em] uppercase">{caption.names}</p>
            <p className="mt-0.5 text-[7px] tracking-[0.3em]">{caption.date}</p>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-9 flex flex-col items-center gap-3">
        <PtButton onClick={() => setDialog("take")}>
          <Camera size={14} />
          {COPY.photoboothTake}
        </PtButton>
        <PtButton outline onClick={() => setDialog("wall")}>
          <Images size={14} />
          {COPY.photoboothGallery}
        </PtButton>
      </Reveal>

      {dialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={() => setDialog(null)}
        >
          <div
            className="w-full max-w-sm bg-white p-6 text-center font-cormorant text-[17px] text-(--theme-text)"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold">
              {dialog === "take" ? "Fitur kamera photobooth belum direkonstruksi." : "Galeri foto tamu belum direkonstruksi."}
            </p>
            <p className="mt-2 text-[15px] text-(--theme-muted)">
              Hubungkan ke backend photobox kamu (endpoint <code>/api/photobox</code>).
            </p>
            <PtButton className="mt-4" onClick={() => setDialog(null)}>
              Tutup
            </PtButton>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- RSVP & Ucapan ---------- */

interface WishRow {
  id?: string;
  name: string;
  message: string;
  sticker?: string | null;
  attendance?: string | null;
  pax?: number | null;
  createdAt: string;
  replies?: { id: string; name: string; message: string }[];
}

const FIELD =
  "w-full rounded-2xl border border-(--pt-sage) bg-white px-4 py-3 font-cormorant text-[18px] text-(--theme-text) placeholder:text-(--theme-muted) outline-none focus:border-(--theme-primary)";

/** Label kecil huruf kapital di atas tiap field, ala form inveet.id. */
const FIELD_LABEL = `${LABEL} mb-1.5 block text-[12px] font-bold text-(--theme-muted)`;

/** Warna nama pengirim di bubble chat, ala warna-warni grup WA. */
const NAME_COLORS = ["#00A884", "#0093DD", "#7B61FF", "#E65100", "#C2185B", "#008069"];
function nameColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return NAME_COLORS[h % NAME_COLORS.length];
}

export function RsvpSection({
  form,
  slug,
  showRsvp,
  showWishes,
}: {
  form: RsvpForm;
  slug: string;
  showRsvp: boolean;
  showWishes: boolean;
}) {
  const t = ID.rsvp;
  const [done, setDone] = useState(false);
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [refresh, setRefresh] = useState(0);
  // Satu browser hanya bisa mengirim satu ucapan: tandanya disimpan di
  // localStorage, jadi tamu yang sudah kirim tidak bisa kirim lagi dari
  // browser yang sama (tetap bisa dari browser/HP lain — ini pembatas
  // ringan, bukan pengaman anti-spam).
  const sentKey = `dinda-rikky-wish-sent:${slug}`;
  const [alreadySent, setAlreadySent] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Bottom sheet ucapan gaya chat WA (opsi 3): daftar ucapan tidak lagi
  // jadi kotak scroll di dalam halaman (itu yang selalu nyangkut), melainkan
  // lembaran dari bawah dengan bubble chat + lazy load ala "mengetik...".
  const [mounted, setMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [typing, setTyping] = useState(false);
  const [justSent, setJustSent] = useState<{ name: string; message: string } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);
  // Ikuti pesan baru atau tidak: true selama replay berjalan; kalau tamu
  // sengaja scroll ke atas untuk membaca pesan lama, auto-follow berhenti.
  const followRef = useRef(true);
  // Penanda scroll yang dipicu kode (bukan jari tamu) supaya onScroll
  // tidak salah mengira scroll halus kita sebagai scroll manual.
  const autoScrollingRef = useRef(false);
  const autoScrollTimer = useRef<number | null>(null);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Urutan chat: paling lama di atas, paling baru di bawah (seperti WA).
  const orderedWishes = useMemo(() => [...wishes].reverse(), [wishes]);
  // Ucapan terbaru (API mengembalikan terbaru dulu) — untuk preview di
  // tombol notif.
  const latestWish = wishes[0] ?? null;
  // Saat sheet terbuka, halaman belakang dikunci (sekali saat buka/tutup
  // saja — bukan tiap sentuhan, jadi tidak ada flash/geter).
  useEffect(() => {
    if (!sheetOpen) return;
    const y = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo({ top: y, behavior: "instant" });
    };
  }, [sheetOpen]);
  // Saat sheet dibuka: kalau tamu baru saja kirim ucapan, tampilkan semua
  // dan lompat ke bawah (biar dia langsung lihat ucapannya); kalau tidak,
  // mulai dari nol — pesan-pesan muncul satu per satu seperti lagi ngechat.
  useEffect(() => {
    if (!sheetOpen) return;
    followRef.current = true;
    if (justSent) {
      setVisibleCount(wishes.length);
      setTyping(false);
      requestAnimationFrame(() =>
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "instant" })
      );
    } else {
      setVisibleCount(0);
      setTyping(false);
      requestAnimationFrame(() => chatRef.current?.scrollTo({ top: 0, behavior: "instant" }));
    }
  }, [sheetOpen, justSent, wishes.length]);
  // Reveal satu-per-satu ala chat grup: tiap pesan didahului indikator
  // "mengetik..." sebentar, lalu pesannya muncul. Berjalan otomatis
  // sampai semua tampil. Indikatornya dibiarkan menyala selama reveal
  // (bukan on/off tiap pesan) supaya tidak berkedip.
  useEffect(() => {
    if (!sheetOpen) return;
    if (visibleCount >= wishes.length) {
      setTyping(false);
      return;
    }
    setTyping(true);
    // Jeda ketikan dibuat seperti orang beneran ngetik: 1–1,8 detik per
    // pesan (acak), bukan 550ms yang terasa kecepetan.
    typingTimer.current = window.setTimeout(() => {
      setVisibleCount((n) => Math.min(n + 1, wishes.length));
    }, 1000 + Math.random() * 800);
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, [sheetOpen, visibleCount, wishes.length]);
  // Batalkan reveal yang tertunda saat sheet ditutup.
  useEffect(() => {
    if (sheetOpen) return;
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    if (autoScrollTimer.current) window.clearTimeout(autoScrollTimer.current);
    autoScrollingRef.current = false;
    setTyping(false);
  }, [sheetOpen]);
  // Ikuti pesan baru seperti lagi ngechat: tiap pesan muncul, daftar
  // bergeser ke atas dan pesan lama ketutup header — kecuali tamu sengaja
  // scroll ke atas untuk membaca, maka auto-follow berhenti sampai dia
  // kembali ke bawah.
  useEffect(() => {
    if (!sheetOpen) return;
    const el = chatRef.current;
    if (!el || !followRef.current) return;
    autoScrollingRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    if (autoScrollTimer.current) window.clearTimeout(autoScrollTimer.current);
    autoScrollTimer.current = window.setTimeout(() => {
      autoScrollingRef.current = false;
    }, 700);
  }, [visibleCount, sheetOpen]);
  useEffect(() => {
    try {
      setAlreadySent(localStorage.getItem(sentKey) === "1");
    } catch {
      /* abaikan kalau localStorage tidak tersedia */
    }
  }, [sentKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slug || !form.name.trim() || alreadySent) return;
    const hasWish = showWishes && !!form.message.trim();
    const ok = showRsvp
      ? await form.submit(showWishes ? undefined : { customMessage: "" })
      : await form.submit({ skipRsvp: true });
    if (ok) {
      setDone(true);
      try {
        localStorage.setItem(sentKey, "1");
      } catch {
        /* abaikan */
      }
      setAlreadySent(true);
      if (hasWish) {
        setJustSent({ name: form.name.trim(), message: form.message.trim() });
        setRefresh((n) => n + 1);
      }
    }
  }

  useEffect(() => {
    if (!slug || !showWishes) return;
    let alive = true;
    fetch(`/api/wishes/public?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => alive && setWishes(Array.isArray(rows) ? rows : []))
      .catch(() => alive && setWishes([]));
    return () => {
      alive = false;
    };
  }, [slug, refresh, showWishes]);

  const choice = (active: boolean) =>
    `rounded-2xl border px-3 py-2.5 font-cormorant text-[17px] font-semibold transition-colors cursor-pointer ${
      active
        ? "border-(--theme-primary) bg-(--theme-primary) text-white"
        : "border-(--pt-sage) bg-white text-(--theme-text)"
    }`;

  return (
    <section id="pt-rsvp" className="@container relative px-5 pt-10 pb-10">
      <Reveal className="text-center">
        <SectionTitle plain={showRsvp}>{showRsvp ? "RSVP" : t.wishesTitle}</SectionTitle>
        <p className={`mx-auto mt-3 max-w-80 ${BODY}`}>{showRsvp ? COPY.rsvp : COPY.wishes}</p>
      </Reveal>

      <ScallopCard className="mt-12">
        {done || alreadySent ? (
          <div className="py-2 text-center">
            <CheckCircle2 size={34} fill="currentColor" stroke="white" className="mx-auto text-(--theme-primary)" />
            <p className={`mt-2 text-[32px] text-(--theme-primary) ${SCRIPT}`}>{t.thanks}</p>
            <p className={BODY}>
              {showRsvp && form.attendance === "hadir"
                ? t.received(form.pax, form.eventChoices ? form.events : null)
                : t.wishReceived}
            </p>
            {alreadySent && <p className={`${BODY} mt-1`}>{t.alreadySent}</p>}
            {!alreadySent && (
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-3 font-cormorant text-[16px] font-semibold underline underline-offset-4 cursor-pointer"
              >
                {t.again}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5 text-left">
            <div>
              <label htmlFor="rsvp-nama" className={FIELD_LABEL}>
                {t.nameLabel}
              </label>
              <input
                id="rsvp-nama"
                aria-label={t.nameLabel}
                required
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder={t.name}
                className={FIELD}
              />
            </div>
            {showRsvp && (
              <>
                <div>
                  <label htmlFor="rsvp-hadir" className={FIELD_LABEL}>
                    {t.attendance}
                  </label>
                  <div className="relative">
                    <select
                      id="rsvp-hadir"
                      aria-label={t.attendance}
                      required
                      value={form.attendance ?? ""}
                      onChange={(e) => form.setAttendance(e.target.value as "hadir" | "tidak")}
                      className={`w-full appearance-none rounded-2xl border border-(--pt-sage) bg-white px-4 py-3 pr-10 font-cormorant text-[18px] outline-none focus:border-(--theme-primary) ${
                        form.attendance ? "text-(--theme-text)" : "text-(--theme-muted)"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih kehadiran
                      </option>
                      <option value="hadir">Hadir</option>
                      <option value="tidak">Belum Dapat Hadir</option>
                    </select>
                    <ChevronDown
                      size={20}
                      className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-(--theme-muted)"
                    />
                  </div>
                </div>
                {form.attendance === "hadir" && (
                  <>
                    {form.showCategory && (
                      <div>
                        <span className={FIELD_LABEL}>{t.guestOf}</span>
                        <div role="radiogroup" aria-label={t.guestOf} className="grid grid-cols-2 gap-2">
                          {GUEST_CATEGORIES.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              role="radio"
                              aria-checked={form.category === c.value}
                              onClick={() => form.setCategory(c.value)}
                              className={choice(form.category === c.value)}
                            >
                              {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {form.eventChoices && (
                      <fieldset>
                        <legend className={FIELD_LABEL}>{t.events}</legend>
                        <div className="space-y-2">
                          {form.eventChoices.map((ev) => (
                            <label key={ev} className="flex items-center gap-3 font-cormorant text-[17px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={form.events.includes(ev)}
                                onChange={() => form.toggleEvent(ev)}
                                className="size-4 shrink-0 accent-(--theme-primary)"
                              />
                              {ev}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}
                    <div>
                      <span className={FIELD_LABEL}>{t.paxLabel}</span>
                      <div className="flex items-center justify-between rounded-2xl border border-(--pt-sage) bg-white px-2 py-2">
                        <button
                          type="button"
                          aria-label="Kurangi jumlah tamu"
                          disabled={form.pax <= 1}
                          onClick={() => form.setPax(Math.max(1, form.pax - 1))}
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-(--pt-sage) bg-white text-(--theme-text) transition-opacity disabled:cursor-default disabled:opacity-30"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-cormorant text-[19px] font-bold text-(--theme-text)">
                          {form.pax}{" "}
                          <span className="text-[16px] font-semibold text-(--theme-muted)">orang</span>
                        </span>
                        <button
                          type="button"
                          aria-label="Tambah jumlah tamu"
                          disabled={form.pax >= form.maxPax}
                          onClick={() => form.setPax(Math.min(form.maxPax, form.pax + 1))}
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-(--pt-sage) bg-white text-(--theme-text) transition-opacity disabled:cursor-default disabled:opacity-30"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {showWishes && (
              <div>
                <label htmlFor="rsvp-pesan" className={FIELD_LABEL}>
                  {t.messageLabel}
                </label>
                <textarea
                  id="rsvp-pesan"
                  aria-label={t.messageLabel}
                  rows={3}
                  value={form.message}
                  onChange={(e) => form.setMessage(e.target.value)}
                  placeholder={showRsvp ? COPY.wishes : t.message}
                  required={!showRsvp}
                  className={`${FIELD} resize-none`}
                />
              </div>
            )}
            {showWishes && (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerOpen((o) => !o)}
                    aria-expanded={pickerOpen}
                    className="flex items-center gap-2 rounded-full border border-(--pt-sage) bg-white px-3.5 py-2 font-cormorant text-[16px] font-semibold text-(--theme-text) cursor-pointer"
                  >
                    {form.sticker && stickerSrc(form.sticker) ? (
                      <Image src={stickerSrc(form.sticker)!} alt="" width={24} height={24} className="size-6" />
                    ) : (
                      <Smile size={18} className="text-(--theme-primary)" />
                    )}
                    {form.sticker ? "Ganti stiker" : "Pilih stiker"}
                  </button>
                  {form.sticker && (
                    <button
                      type="button"
                      onClick={() => form.setSticker("")}
                      aria-label="Hapus stiker pilihan"
                      className="grid size-8 place-items-center rounded-full border border-(--pt-sage) bg-white text-(--theme-text) cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                {pickerOpen && (
                  <div className="absolute right-0 bottom-full left-0 z-20 mb-2 rounded-2xl bg-white p-3 shadow-[0_16px_32px_-12px_rgb(63_74_44/0.45)] ring-1 ring-(--pt-sage)/60">
                    <p className="font-cormorant text-[16px] font-semibold text-(--theme-text)">
                      Pilih stiker untuk ucapanmu
                    </p>
                    <div className="mt-2 grid max-h-48 grid-cols-4 gap-2 overflow-y-auto pr-1">
                      {STICKERS.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => form.setSticker(s.key)}
                          aria-label={s.label}
                          title={s.label}
                          className={`grid aspect-square place-items-center rounded-xl bg-(--theme-surface) p-1.5 cursor-pointer ${
                            form.sticker === s.key ? "ring-2 ring-(--theme-primary)" : "ring-1 ring-(--pt-sage)/50"
                          }`}
                        >
                          <Image src={s.src} alt={s.label} width={52} height={52} className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {form.error && (
              <p className="font-cormorant text-[15px] font-semibold text-(--theme-primary)">{form.error}</p>
            )}
            <PtButton type="submit" disabled={form.submitting} className="w-full uppercase tracking-[0.15em]">
              {form.submitting ? t.sending : t.send}
            </PtButton>
          </form>
        )}
      </ScallopCard>

      {showWishes && wishes.length > 0 && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-8 flex w-full items-center gap-3 rounded-[20px] bg-white px-5 py-4 text-left shadow-[0_8px_18px_-10px_rgb(63_74_44/0.45)] ring-1 ring-(--pt-sage)/60 transition-transform active:scale-[0.98]"
        >
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-(--theme-primary) text-white">
            <MessageCircle size={22} />
            <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
              <span className="relative inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 font-cormorant text-[11px] leading-none font-bold text-white ring-2 ring-white">
                {wishes.length}
              </span>
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-cormorant text-[19px] leading-tight font-bold text-(--theme-text)">
              Ucapan &amp; Doa
            </span>
            <span className="block truncate font-cormorant text-[15px] leading-snug text-(--theme-muted)">
              {latestWish ? `${latestWish.name}: ${latestWish.message}` : `${wishes.length} ucapan dari tamu`}
            </span>
          </span>
          <ChevronRight size={22} className="shrink-0 text-(--theme-muted)" />
        </button>
      )}
      {showWishes && wishes.length === 0 && (
        <p className={`mt-8 text-center ${BODY} text-(--theme-muted)`}>
          Belum ada ucapan — jadilah yang pertama mengirim doa!
        </p>
      )}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                key="backdrop"
                className="fixed inset-0 z-[70] bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
              />
            )}
            {sheetOpen && (
              <motion.div
                key="sheet"
                role="dialog"
                aria-modal="true"
                aria-label="Ucapan dan doa tamu"
                className="fixed inset-x-0 bottom-0 z-[71] mx-auto flex h-[86dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[28px] bg-[#EFEAE3] shadow-2xl"
                style={paletteVars() as CSSProperties}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <div className="flex items-center gap-3 bg-(--theme-primary) px-4 pt-3 pb-3 text-white">
                  <button
                    type="button"
                    aria-label="Tutup"
                    onClick={() => setSheetOpen(false)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15"
                  >
                    <X size={20} />
                  </button>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <MessageCircle size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-cormorant text-[19px] leading-tight font-bold">
                      Ucapan &amp; Doa
                    </span>
                    <span className="block font-cormorant text-[13px] leading-tight text-white/85">
                      {wishes.length} ucapan dari tamu
                    </span>
                  </span>
                  {visibleCount < wishes.length && (
                    <button
                      type="button"
                      onClick={() => {
                        if (typingTimer.current) window.clearTimeout(typingTimer.current);
                        setVisibleCount(wishes.length);
                        setTyping(false);
                        followRef.current = true;
                      }}
                      className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 font-cormorant text-[13px] font-bold text-white"
                    >
                      Lewati
                    </button>
                  )}
                </div>
                <div
                  ref={chatRef}
                  onScroll={(e) => {
                    // Scroll dari kode (smooth scrollTo) diabaikan; scroll
                    // dari jari tamu yang menjauh dari bawah mematikan
                    // auto-follow, kembali ke bawah menyalakannya lagi.
                    if (autoScrollingRef.current) return;
                    const el = e.currentTarget;
                    followRef.current =
                      el.scrollTop + el.clientHeight >= el.scrollHeight - 120;
                  }}
                  className="flex-1 overflow-y-auto overscroll-contain bg-[#E7DFD3] px-3 pt-4 pb-4"
                >
                  {orderedWishes.slice(0, visibleCount).map((w, i) => {
                    const mine = !!justSent && w.name === justSent.name && w.message === justSent.message;
                    const day = formatDate(w.createdAt, "D MMMM YYYY");
                    const prevDay =
                      i > 0 ? formatDate(orderedWishes[i - 1].createdAt, "D MMMM YYYY") : null;
                    return (
                      <div key={w.id || i}>
                        {day !== prevDay && (
                          <div className="my-3 flex justify-center">
                            <span className="rounded-full bg-white/80 px-3 py-1 font-cormorant text-[12px] font-semibold tracking-wide text-(--theme-muted) shadow-sm">
                              {day}
                            </span>
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 14, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-[0_2px_6px_rgb(63_74_44/0.18)] ${
                              mine ? "rounded-br-[4px] bg-[#D9FDD3]" : "rounded-tl-[4px] bg-white"
                            }`}
                          >
                            {!mine && (
                              <p
                                className="font-cormorant text-[15px] leading-tight font-bold"
                                style={{ color: nameColor(w.name) }}
                              >
                                {w.name}
                              </p>
                            )}
                            <p className="font-cormorant text-[16px] leading-snug whitespace-pre-line wrap-break-word text-(--theme-text)">
                              {w.message}
                            </p>
                            {w.sticker && stickerSrc(w.sticker) && (
                              <span className="mt-2 flex justify-center">
                                <Image
                                  src={stickerSrc(w.sticker)!}
                                  alt=""
                                  width={96}
                                  height={96}
                                  className="h-20 w-auto"
                                />
                              </span>
                            )}
                            <div className="mt-1 flex items-end justify-between gap-2">
                              {w.attendance ? (
                                <span
                                  className={`flex items-center gap-1 font-cormorant text-[11px] leading-none font-semibold ${
                                    w.attendance === "hadir" ? "text-[#2E7D32]" : "text-(--theme-muted)"
                                  }`}
                                >
                                  {w.attendance === "hadir" ? <Check size={11} /> : <X size={11} />}
                                  {w.attendance === "hadir" ? "Hadir" : "Tidak hadir"}
                                  {w.attendance === "hadir" && typeof w.pax === "number" && w.pax > 1
                                    ? ` · ${w.pax} tamu`
                                    : ""}
                                </span>
                              ) : (
                                <span />
                              )}
                              <span
                                className={`shrink-0 font-cormorant text-[11px] leading-none ${
                                  mine ? "text-[#4A7A3A]" : "text-(--theme-muted)"
                                }`}
                              >
                                {dayjs(w.createdAt).format("HH:mm")}
                              </span>
                            </div>
                            {w.replies?.map((r) => (
                              <p
                                key={r.id}
                                className="mt-2 rounded-xl bg-black/[0.04] px-3 py-2 font-cormorant text-[14px] leading-snug wrap-break-word"
                              >
                                <span className="font-bold">{r.name}</span> {r.message}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                  {typing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-2 flex justify-start"
                    >
                      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-[4px] bg-white px-4 py-3.5 shadow-[0_2px_6px_rgb(63_74_44/0.18)]">
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="size-2 animate-bounce rounded-full bg-(--theme-muted)"
                            style={{ animationDelay: `${d * 150}ms` }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-(--pt-sage)/50 bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSheetOpen(false)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-(--theme-primary) px-4 py-2.5 font-cormorant text-[17px] font-bold text-white"
                  >
                    <PenLine size={18} /> Tulis ucapan
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}

/* ---------- Tanda Kasih ---------- */

function GiftCard({
  label,
  name,
  value,
  copy,
  small = false,
}: {
  label: string;
  name?: string;
  value: string;
  copy: string;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden bg-white text-center shadow-[0_8px_18px_-10px_rgb(63_74_44/0.5)] ring-1 ring-(--pt-sage)/60">
      <div aria-hidden className="h-3" style={GINGHAM} />
      <div className="px-5 pt-4 pb-4">
        <p className={`text-[12px] text-(--theme-primary) ${LABEL}`}>{label}</p>
        {name && <p className="mt-1 font-cormorant text-[17px] leading-tight">{name}</p>}
        <p
          className={`mt-1 font-cormorant leading-tight whitespace-pre-line wrap-break-word ${
            small ? "text-[16px] font-semibold" : "text-[22px] font-bold tracking-[0.04em] tabular-nums"
          }`}
        >
          {value}
        </p>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard.writeText(copy).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-(--theme-surface) px-3.5 py-1.5 font-cormorant text-[15px] leading-none font-bold text-(--theme-primary) ring-1 ring-(--theme-accent) cursor-pointer"
        >
          {copied ? <CheckCircle2 size={14} fill="currentColor" stroke="white" /> : <Copy size={14} />}
          {copied ? ID.gift.copied : ID.gift.copy}
        </button>
      </div>
    </div>
  );
}

export function GiftSection({
  gifts,
  qrisPhoto,
  giftAddress,
  giftReceiver,
}: {
  gifts?: { bank: string; accountNumber: string; accountName?: string }[];
  qrisPhoto?: string;
  giftAddress?: string;
  giftReceiver?: string;
}) {
  const [zoom, setZoom] = useState(false);
  const accounts = (gifts ?? []).filter((g) => g.accountNumber?.trim());
  const address = giftAddress?.trim();
  if (accounts.length === 0 && !address && !qrisPhoto) return null;

  return (
    <section id="pt-gift" className="@container relative bg-(--pt-leaf) px-6 pt-10 pb-12 text-center">
      <Reveal>
        <SectionTitle>{COPY.giftTitle}</SectionTitle>
        <p className={`mx-auto mt-3 max-w-80 ${BODY}`}>{COPY.gift}</p>
      </Reveal>
      <Reveal className="mt-6 space-y-3">
        {accounts.map((g, i) => (
          <GiftCard
            key={`${g.bank}-${i}`}
            label={g.bank}
            name={g.accountName}
            value={g.accountNumber}
            copy={g.accountNumber}
          />
        ))}
        {address && (
          <GiftCard
            label={ID.gift.sendTo}
            name={giftReceiver?.trim() || ID.gift.address}
            value={address}
            copy={giftReceiver ? `${giftReceiver} ${address}` : address}
            small
          />
        )}
      </Reveal>
      {qrisPhoto && (
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label={ID.gift.zoomQris}
          className="relative mx-auto mt-5 block size-48 cursor-zoom-in bg-white ring-1 ring-(--pt-sage)"
        >
          <Image src={qrisPhoto} alt="QRIS" fill sizes="192px" className="object-contain p-3" />
        </button>
      )}
      {zoom && qrisPhoto && <Lightbox src={qrisPhoto} alt="QRIS" onClose={() => setZoom(false)} />}
    </section>
  );
}

/* ---------- Penutup ---------- */

/** Garis tepi piring bergelombang untuk badge "Thank You!" */
const BADGE_PATH = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2;
    const r = 49 - 3 * (1 - Math.abs(Math.sin(12 * a)));
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 10 10" className={`fill-current ${className}`}>
      <path d="M5 0C5.4 3.2 6.8 4.6 10 5 6.8 5.4 5.4 6.8 5 10 4.6 6.8 3.2 5.4 0 5 3.2 4.6 4.6 3.2 5 0z" />
    </svg>
  );
}

export function ClosingSection({
  first,
  second,
  isMuslimGreeting,
  hashtag,
}: {
  first: string;
  second: string;
  isMuslimGreeting?: boolean;
  hashtag?: string;
}) {
  const tag = hashtag?.trim().replace(/^#/, "");
  const { poses, teacup } = ASSETS;

  return (
    <section
      id="pt-closing"
      style={GRASS}
      className="@container relative flex min-h-dvh flex-col overflow-hidden px-5 pt-12 lg:[[data-phone-frame]_&]:min-h-[844px]"
    >
      <div className="flex flex-1 flex-col justify-center">
      <Drop className="relative z-10 mx-auto w-[68cqw]" tilt={-3}>
        <div className="relative aspect-square">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full drop-shadow-[0_12px_16px_rgb(0_0_0/0.3)]"
          >
            <path d={BADGE_PATH} style={{ fill: "var(--pt-pale)" }} stroke="var(--pt-sage)" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="40.5" style={{ fill: "var(--theme-surface)" }} />
            <circle
              cx="50" cy="50" r="40.5" fill="none" stroke="var(--theme-accent)" strokeWidth="2.4"
              strokeDasharray="0.1 3.6" strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="37" fill="none" stroke="var(--theme-accent)" strokeOpacity="0.5" strokeWidth="0.4" />
          </svg>
          <div className="absolute inset-[21%] flex flex-col items-center justify-center text-center">
            <p className={`text-[13cqw] leading-[0.9] font-bold text-(--theme-text) ${HAND}`}>
              <span className="relative">
                <Sparkle className="absolute top-[30%] -left-[22%] size-[2.6cqw] text-(--theme-accent)" />
                {COPY.thanksA}
              </span>
              <br />
              <span className="relative">
                {COPY.thanksB}
                <Sparkle className="absolute top-[34%] -right-[32%] size-[3.4cqw] text-(--theme-accent)" />
                <Sparkle className="absolute top-[40%] -left-[34%] size-[2cqw] text-(--theme-accent)" />
              </span>
            </p>
            <p className={`mt-[6%] text-[2.2cqw] leading-relaxed text-(--theme-text)/80 ${LABEL} tracking-[0.12em]`}>
              {COPY.thanksNote}
            </p>
          </div>
        </div>
        <Art art="flowers" className="top-[6%] -left-[14%] w-[30%]" delay={0.5} />
        <Art art="flowers" className="top-[6%] -right-[14%] w-[30%]" delay={0.5} flip />
        <Art art="rosebud" className="-bottom-[5%] left-[35%] w-[30%]" delay={0.8} />
      </Drop>

      <div className="relative mt-[6cqw] flex items-start">
        <Drop className="relative z-10 mt-[8cqw] w-[38cqw] shrink-0" tilt={-6} delay={0.4}>
          <Polaroid src={poses[poses.length - 1].src} alt={`${first} & ${second}`} />
        </Drop>
        <Drop className="relative -ml-[4cqw] min-w-0 flex-1" tilt={2} delay={0.6}>
          <div className="bg-white px-[6cqw] pt-[6cqw] pb-[5cqw] text-center shadow-[0_10px_18px_-8px_rgb(0_0_0/0.45)]">
            <p className="font-cormorant text-[14px] leading-snug text-(--theme-text)">{COPY.closing}</p>
            {isMuslimGreeting !== false && (
              <p className="mt-2 font-cormorant text-[14px] leading-snug font-semibold text-(--theme-text) italic">
                {ID.closing.wassalam}
              </p>
            )}
            <p className={`mt-3 text-[min(7.5cqw,26px)] text-(--theme-muted) wrap-break-word ${SCRIPT}`}>
              {first} &amp; {second}
            </p>
            {tag && (
              <p className="mt-1 font-marcellus text-[10px] tracking-[0.12em] text-(--theme-accent) wrap-break-word">
                #{tag}
              </p>
            )}
          </div>
        </Drop>
      </div>
      </div>

      <Drop className="absolute bottom-[20cqw] -left-[6cqw] w-[30cqw]" tilt={-8} delay={0.9}>
        <Image
          src={teacup.src}
          alt=""
          width={teacup.width}
          height={teacup.height}
          sizes="140px"
          className="h-auto w-full drop-shadow-[0_10px_12px_rgb(0_0_0/0.3)]"
        />
      </Drop>
      <Art art="orchid" className="-right-[1cqw] bottom-[20cqw] z-20 w-[11cqw]" delay={1} />
      <footer className="relative z-10 -mx-5 mt-10 overflow-hidden rounded-t-[28px] bg-(--theme-surface) shadow-[0_-8px_18px_-10px_rgb(63_74_44/0.25)]">
        <div aria-hidden className="h-3" style={GINGHAM} />
        <p className="px-5 pt-4 pb-6 text-center font-cormorant text-[13px] leading-snug text-(--theme-text)">
          Dibuat dengan ♥ untuk momen yang tak terlupakan.
        </p>
      </footer>
    </section>
  );
}
