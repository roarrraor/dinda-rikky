"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { CalendarPlus, Cake, Coffee, DoorOpen, Heart, Instagram, MapPin, Utensils, type LucideIcon } from "lucide-react";
import { ASSETS, COPY, ID } from "@/lib/wedding/data";
import { displayName, formatDate } from "@/lib/wedding/format";
import { googleCalendarUrl } from "@/lib/wedding/calendar";
import type { WeddingEvent } from "@/lib/wedding/events";
import { useCountdown } from "@/lib/wedding/use-countdown";
import {
  Art,
  BODY,
  Drop,
  EASE,
  GinghamStrip,
  GINGHAM,
  HAND,
  LABEL,
  Polaroid,
  Reveal,
  SCRIPT,
  SectionTitle,
  Stagger,
  scallopMask,
} from "./primitives";

/* ---------- ornamen ---------- */

/** Garis bergelombang (scallop) berbentuk oval, dipakai sebagai bingkai foto */
function scallopOval(lobes: number, rx: number, ry: number, depth: number) {
  const pts: string[] = [];
  for (let l = 0; l < 480; l++) {
    const a = (l / 480) * Math.PI * 2;
    const n = 1 - Math.abs(Math.sin((a * lobes) / 2));
    pts.push(
      `${(50 + (rx - depth * n) * Math.cos(a)).toFixed(2)} ${(55 + (ry - depth * n) * Math.sin(a)).toFixed(2)}`,
    );
  }
  return `M${pts.join("L")}Z`;
}
const MONOGRAM_PATH = scallopOval(22, 48, 53, 3.5);

/** Ornamen kecil: + ◆ + */
function Chevrons({ className = "", down = false }: { className?: string; down?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 30 10"
      className={`h-2.5 w-8 fill-current ${down ? "rotate-90" : ""} ${className}`}
    >
      <path d="M3 4h1.5V2.5h1V4H7v1H5.5v1.5h-1V5H3zM15 1.5l3.5 3.5-3.5 3.5L11.5 5zM23 4h1.5V2.5h1V4H27v1h-1.5v1.5h-1V5H23z" />
    </svg>
  );
}

/* ---------- Mempelai ---------- */

/* Frame oval mempelai (gambar utuh: pita + kupu-kupu, jangan dihapus).
   Foto dipasang sebagai elips di dalam bukaan oval; frame menutupinya. */
function PhotoFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative">
      <div className="relative" style={{ aspectRatio: "1096 / 1409" }}>
        <div
          className="absolute overflow-hidden rounded-[50%]"
          style={{ inset: "12.8% 16% 17.9% 15.8%" }}
        >
          <Image src={src} alt={alt} fill sizes="300px" className="object-cover" />
        </div>
        <Image
          src={ASSETS.ovalFrame.src}
          alt=""
          fill
          sizes="400px"
          className="object-fill"
        />
      </div>
    </div>
  );
}

export interface Person {
  name: string;
  nickname?: string | null;
  photo: string;
  relation: "son" | "daughter";
  childOrder?: string | null;
  father?: string;
  mother?: string;
  instagram?: string;
}

function PersonCard({ p, showPhoto, mirror }: { p: Person; showPhoto: boolean; mirror: boolean }) {
  const parents = [p.father, p.mother].filter(Boolean).join(" & ");
  const ig = p.instagram?.trim().replace(/^@/, "");

  return (
    <div className="relative mx-auto w-[86cqw]">
      {showPhoto && (
        <Reveal className="relative z-10 mx-auto w-[64cqw]">
          <div className={mirror ? "rotate-2" : "-rotate-2"}>
            <PhotoFrame src={p.photo} alt={p.name} />
          </div>
        </Reveal>
      )}
      <Reveal className={`relative ${showPhoto ? "-mt-[34cqw]" : ""}`}>
        <div
          className={`relative rounded-t-full bg-(--pt-pink)/70 px-[12%] pb-[18cqw] text-center ${
            showPhoto ? "pt-[38cqw]" : "pt-[18cqw]"
          }`}
        >
          <Stagger delay={0.2}>
            <p className="flex items-center justify-center gap-2 text-(--theme-accent)">
              <Chevrons />
              <span className={`text-[10px] text-(--theme-text)/70 ${LABEL}`}>
                {p.relation === "son" ? COPY.groom : COPY.bride}
              </span>
              <Chevrons />
            </p>
            <h3 className={`mt-1 text-[44px] text-(--theme-primary) wrap-break-word ${SCRIPT}`}>
              {displayName(p.name, p.nickname)}
            </h3>
            <p className={`text-[12px] text-(--theme-text) wrap-break-word ${LABEL}`}>{p.name}</p>
            {parents && (
              <p className="mx-auto mt-2 max-w-64 font-cormorant text-[16px] leading-snug wrap-break-word">
                <span className="text-(--theme-muted) italic">{ID.couple.childOf(p.relation, p.childOrder)}</span>
                <br />
                {parents}
              </p>
            )}
            {ig && (
              <a
                href={`https://instagram.com/${ig}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-cormorant text-[14px] leading-none font-semibold text-(--theme-primary) shadow-[0_3px_8px_-4px_rgb(63_74_44/0.4)]"
              >
                <Instagram size={13} />@{ig}
              </a>
            )}
          </Stagger>
        </div>
        <Art art="cosmos" className="bottom-0 -left-[3%] w-[24%]" delay={0.5} />
        <Art art="cosmos" className="-right-[3%] bottom-0 w-[24%]" delay={0.6} flip />
        <Art
          art="rosebud"
          className={`-bottom-[3%] w-[26%] ${mirror ? "left-[16%] -rotate-6" : "right-[16%] rotate-6"}`}
          delay={0.8}
        />
      </Reveal>
    </div>
  );
}

function Monogram({ first, second }: { first: string; second: string }) {
  return (
    <div className="relative mx-auto w-[36cqw]" style={{ aspectRatio: "100 / 110" }}>
      <svg
        aria-hidden
        viewBox="0 0 100 110"
        className="absolute inset-0 size-full drop-shadow-[0_6px_10px_rgb(63_74_44/0.22)]"
      >
        <path d={MONOGRAM_PATH} style={{ fill: "var(--theme-surface)" }} stroke="var(--theme-accent)" strokeWidth="1.4" />
        <ellipse
          cx="50" cy="55" rx="37" ry="42" fill="none" stroke="var(--theme-accent)" strokeWidth="0.7"
          strokeDasharray="0.1 2.2" strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`flex items-center gap-[1cqw] leading-none ${SCRIPT}`}>
          <span className="text-[8.5cqw] text-(--theme-primary)">{first}</span>
          <span className="font-cormorant text-[7cqw] text-(--theme-accent) italic">&amp;</span>
          <span className="text-[8.5cqw] text-(--theme-primary)">{second}</span>
        </p>
        <Chevrons className="mt-1 text-(--theme-accent)" />
      </div>
    </div>
  );
}

export function CoupleSection({
  people,
  showPhotos,
  initials,
}: {
  people: Person[];
  showPhotos: boolean;
  initials: string;
}) {
  return (
    <section id="pt-couple" className="@container relative overflow-hidden bg-white">
      <GinghamStrip />
      <Reveal className="px-5 pt-10">
        <SectionTitle kicker={COPY.invited}>{COPY.coupleTitle}</SectionTitle>
      </Reveal>
      <div className="mt-12 pb-14">
        {people.map((p, i) => (
          <div key={p.relation}>
            {i > 0 && (
              <Drop className="my-10" tilt={0}>
                <Monogram first={initials.charAt(0)} second={initials.charAt(1)} />
              </Drop>
            )}
            <PersonCard p={p} showPhoto={showPhotos} mirror={i === 1} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Save The Date ---------- */

function WatercolorHeart({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="-2 -1 28 26"
      className={className}
      initial={{ scale: 1.6, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 220, damping: 15, delay: 0.5 }}
    >
      <defs>
        <radialGradient id="pt-wash" cx="42%" cy="40%" r="65%">
          <stop offset="0" style={{ stopColor: "var(--theme-accent)", stopOpacity: 0.35 }} />
          <stop offset="0.75" style={{ stopColor: "var(--theme-accent)", stopOpacity: 0.7 }} />
          <stop offset="1" style={{ stopColor: "var(--theme-accent)", stopOpacity: 0.9 }} />
        </radialGradient>
        <filter id="pt-paint" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="1.2" />
          <feGaussianBlur stdDeviation="0.15" />
        </filter>
      </defs>
      <path
        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.9 4.5 6.6 4.5c2.2 0 3.6 1.3 5.4 3.3 1.8-2 3.2-3.3 5.4-3.3 3.7 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z"
        fill="url(#pt-wash)"
        stroke="var(--theme-accent)"
        strokeOpacity="0.5"
        strokeWidth="0.5"
        filter="url(#pt-paint)"
      />
    </motion.svg>
  );
}

function Pill({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-(--theme-muted)/70 px-4 py-1.5 font-cormorant text-[14px] leading-none text-(--theme-muted) italic"
    >
      {children}
    </a>
  );
}

export function SaveDateSection({
  date,
  title,
  events,
}: {
  date: string;
  title: string;
  events: WeddingEvent[];
}) {
  const { arrived, units } = useCountdown(date);
  const last = events.at(-1);
  const calendarUrl = googleCalendarUrl({
    title: ID.saveDate.calendarTitle(title),
    details: ID.saveDate.calendarTitle(title),
    location: last?.venue ?? "",
    dateIso: date,
    timeStr: last?.time ?? "",
  });

  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  const days = [-1, 0, 1].map((off) => new Date(Date.UTC(y, m - 1, d + off)).toISOString().slice(0, 10));

  const venueKey = (e: WeddingEvent) => [e.venue, e.address, e.mapsUrl].map((v) => v?.trim() ?? "").join("|");
  const sameVenue = events.length > 0 && events.every((e) => venueKey(e) === venueKey(events[0]));
  const { venue: venueArt } = ASSETS;

  const venueBlock = (e: WeddingEvent, withHeading: boolean) =>
    e.venue?.trim() ? (
      <div className={withHeading ? "mt-3" : "mt-2"}>
        {withHeading && (
          <p className={`text-[15px] font-semibold text-(--theme-accent) ${LABEL} tracking-[0.12em]`}>
            {COPY.location}
          </p>
        )}
        <p
          className={`font-cormorant leading-snug text-(--theme-text) wrap-break-word ${
            withHeading ? "mt-1 text-[17px] font-semibold" : "text-[15px] font-semibold"
          }`}
        >
          {e.venue}
        </p>
        {e.address && (
          <p className="font-cormorant text-[14px] leading-snug text-(--theme-muted) italic wrap-break-word">
            {e.address}
          </p>
        )}
        {e.mapsUrl && (
          <div className="mt-3">
            <Pill href={e.mapsUrl}>
              <MapPin size={13} />
              {ID.events.location}
            </Pill>
          </div>
        )}
      </div>
    ) : null;

  return (
    <section id="pt-save-date" className="@container relative overflow-hidden bg-white pt-8 pb-12">
      <Reveal className="px-5">
        <h2 className={`text-center text-[min(14cqw,44px)] leading-[1.05] text-(--theme-muted) ${SCRIPT}`}>
          Save The
          <span className="block">Date</span>
        </h2>
      </Reveal>

      {/* strip kalender 3 hari */}
      <Reveal delay={0.2} className="-mx-3 mt-6 -rotate-3">
        <div
          className={`grid grid-cols-[1fr_1.25fr_1fr] border-y-[1.5px] border-(--theme-muted)/80 text-(--theme-text)/85 ${HAND}`}
        >
          {days.map((day, i) => (
            <div key={day} className={i > 0 ? "border-l-[1.5px] border-(--theme-muted)/80" : ""}>
              <p
                className={`border-b-[1.5px] border-(--theme-muted)/80 px-4 py-1 text-[19px] ${
                  i === 0 ? "text-left" : i === 1 ? "text-center" : "text-right"
                }`}
              >
                {formatDate(day, "dddd")}
              </p>
              <div className="relative grid h-[26cqw] place-items-center">
                {i === 1 && <WatercolorHeart className="absolute size-[24cqw]" />}
                <span
                  className={`relative text-[min(12cqw,50px)] leading-none ${
                    i === 0 ? "mr-auto pl-[6cqw]" : i === 2 ? "ml-auto pr-[6cqw]" : ""
                  }`}
                >
                  {formatDate(day, "D")}
                </span>
                {i === 1 && (
                  <span
                    className={`absolute right-[16%] bottom-[16%] text-[min(3.6cqw,15px)] text-(--theme-text)/70 ${SCRIPT}`}
                  >
                    {COPY.theDay}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* hitung mundur */}
      {!arrived && (
        <Reveal className="mt-8 flex justify-center gap-5 px-5">
          {units.map((u) => (
            <div key={u.label} className="text-center">
              <p className={`text-[30px] leading-none text-(--theme-text)/85 tabular-nums ${HAND}`}>
                {String(u.value).padStart(2, "0")}
              </p>
              <p className={`mt-1 text-[9px] text-(--theme-accent) ${LABEL}`}>{u.label}</p>
            </div>
          ))}
        </Reveal>
      )}

      {events.length > 0 && (
        <div id="pt-location" className="mt-10 px-5 text-center">
          <Reveal className={`mx-auto grid max-w-88 ${events.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {events.map((e, i) => (
              <div
                key={`${e.title}-${i}`}
                className={`relative px-2 pb-1 ${
                  i % 2
                    ? "before:absolute before:top-0 before:bottom-0 before:left-0 before:w-px before:bg-(--theme-accent) after:absolute after:-top-1 after:-left-[2.5px] after:size-1.5 after:rounded-full after:bg-(--theme-accent)"
                    : ""
                } ${i > 1 ? "mt-6" : ""}`}
              >
                <h3 className="font-marcellus text-[15px] tracking-[0.08em] text-(--theme-accent) uppercase wrap-break-word">
                  {e.title}
                </h3>
                <p className="mt-1 font-cormorant text-[16px] leading-snug text-(--theme-muted)">
                  {formatDate(e.date || date, "DD MMMM YYYY")}
                </p>
                {e.time && (
                  <p className="font-cormorant text-[16px] leading-snug text-(--theme-muted)">{e.time}</p>
                )}
                {!sameVenue && venueBlock(e, false)}
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.1} className="relative mx-auto mt-8 w-[64cqw]">
            <div className="relative" style={{ aspectRatio: `${venueArt.width} / ${venueArt.height}` }}>
              <Image src={venueArt.src} alt="" fill sizes="340px" className="object-contain" />
            </div>
          </Reveal>

          <Reveal delay={0.2}>{sameVenue && venueBlock(events[0], true)}</Reveal>
        </div>
      )}

      <Reveal className="mt-5 text-center">
        <Pill href={calendarUrl}>
          <CalendarPlus size={13} />
          {ID.saveDate.addToCalendar}
        </Pill>
      </Reveal>
    </section>
  );
}

/* ---------- Susunan Acara ---------- */

const RUNDOWN_ICONS: Record<string, LucideIcon> = {
  arrive: DoorOpen,
  ceremony: Heart,
  drinks: Coffee,
  dinner: Utensils,
  cake: Cake,
};

export function RundownSection({
  rundown,
}: {
  rundown?: { time: string; label: string; icon?: string }[];
}) {
  const items = (rundown ?? []).filter((r) => r.label?.trim() || r.time?.trim());
  if (items.length === 0) return null;
  const { teacup, bow } = ASSETS;

  return (
    <section id="pt-rundown" style={GINGHAM} className="@container relative px-6 pt-16 pb-28">
      <div className="relative">
        <div
          style={scallopMask(10)}
          className="relative bg-white px-[6cqw] pt-16 pb-16 text-center drop-shadow-[0_10px_16px_rgb(63_74_44/0.22)]"
        >
          <div aria-hidden className="pointer-events-none absolute inset-[12px] border border-(--pt-sage)" />
          <div aria-hidden className="pointer-events-none absolute inset-[16px] border border-(--pt-sage)/50" />
          <Reveal>
            <p className="flex items-center justify-center gap-2 text-(--theme-accent)">
              <Chevrons />
              <span className={`text-[10px] text-(--theme-text)/70 ${LABEL}`}>{COPY.rundownKicker}</span>
              <Chevrons />
            </p>
            <h2 className={`mt-1 text-[32px] text-(--theme-muted) ${SCRIPT}`}>{COPY.rundownTitle}</h2>
          </Reveal>
          <ol className="mt-6">
            {items.map((r, i) => {
              const Icon = RUNDOWN_ICONS[r.icon ?? ""] ?? Heart;
              return (
                <motion.li
                  key={`${r.time}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                >
                  {i > 0 && <Chevrons className="mx-auto my-3 text-(--theme-accent)/70" />}
                  <p className="flex items-center justify-center gap-2 text-(--theme-primary)">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-(--theme-surface) text-(--theme-accent) ring-1 ring-(--theme-accent)/50">
                      <Icon size={12} fill="currentColor" />
                    </span>
                    <span className="font-cormorant text-[24px] leading-none font-semibold tracking-[0.06em]">{r.time}</span>
                  </p>
                  <p
                    className={`mx-auto mt-1.5 max-w-64 text-[11px] leading-snug text-(--theme-text) wrap-break-word ${LABEL} tracking-[0.16em]`}
                  >
                    {r.label}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
        <div aria-hidden className="absolute -top-[34px] left-1/2 w-16 -translate-x-1/2">
          <Image src={bow.src} alt="" width={bow.width} height={bow.height} sizes="80px" className="h-auto w-full" />
        </div>
        <Art art="rosebud" className="-top-[4cqw] -left-[6cqw] w-[30cqw] -rotate-12" delay={0.4} />
        <Drop className="absolute -right-[6cqw] -bottom-[20cqw] w-[32cqw]" tilt={-6} delay={0.6}>
          <Image
            src={teacup.src}
            alt=""
            width={teacup.width}
            height={teacup.height}
            sizes="140px"
            className="h-auto w-full drop-shadow-[0_10px_12px_rgb(0_0_0/0.25)]"
          />
        </Drop>
      </div>
    </section>
  );
}
