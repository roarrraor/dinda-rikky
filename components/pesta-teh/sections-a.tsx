"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { ASSETS, COPY } from "@/lib/pesta-teh/data";
import { formatDate } from "@/lib/pesta-teh/format";
import { useMusic } from "./music";
import { Art, Drop, GRASS, HAND, LABEL, Polaroid, Reveal, SCRIPT, Seal, Stagger, BODY, ScallopCard, KICKER } from "./primitives";

/** Meja teh: kolase amplop, piring tanggal, kartu lokasi, polaroid, angsa (tombol musik) */
export function TableSection({
  first,
  second,
  date,
  venue,
}: {
  first: string;
  second: string;
  date: string;
  venue?: string;
}) {
  const music = useMusic();
  const { envelopeClosed, envelopeOpen, envelopePocket, plate, swan, venue: venueArt, poses } = ASSETS;
  const initials = `${first.charAt(0)}${second.charAt(0)}`;
  const flowers = (cls: string, delay: number) => <Art art="flowers" className={`z-30 ${cls}`} delay={delay} />;

  return (
    <section id="pt-table" style={GRASS} className="@container relative overflow-hidden py-3">
      <div className="relative mx-auto w-full" style={{ aspectRatio: "696 / 1314" }}>
        {/* amplop tertutup */}
        <Drop className="absolute top-[10%] left-[8%] w-[52%]" tilt={0} delay={0.1}>
          <div className="relative">
            <Image
              src={envelopeClosed.src}
              alt=""
              width={envelopeClosed.width}
              height={envelopeClosed.height}
              sizes="220px"
              className="h-auto w-full drop-shadow-[0_8px_10px_rgb(0_0_0/0.25)]"
            />
            <span
              className="absolute w-[19%] -translate-x-1/2 -translate-y-1/2 text-[11px]"
              style={{
                left: `${100 * envelopeClosed.seal.x}%`,
                top: `${100 * envelopeClosed.seal.y}%`,
              }}
            >
              <Seal initials={initials} className="w-full" />
            </span>
          </div>
        </Drop>
        <Art art="orchid" className="top-[8%] left-[1%] z-30 w-[16%]" delay={1.6} />

        {/* amplop terbuka + kartu nama */}
        <Drop className="absolute top-[10%] left-[44%] z-10 w-[53%]" tilt={0} delay={0.4}>
          <div className="relative" style={{ aspectRatio: `${envelopeOpen.width} / ${envelopeOpen.height}` }}>
            <Image
              src={envelopeOpen.src}
              alt=""
              fill
              sizes="220px"
              className="object-contain drop-shadow-[0_8px_10px_rgb(0_0_0/0.25)]"
            />
            <div className="absolute top-[14%] left-[9%] h-[56%] w-[82%] rotate-3 bg-white px-[6%] pt-[9%] text-center shadow-md">
              <p className={`text-[min(4.2cqw,17px)] text-(--theme-muted) ${SCRIPT}`}>{COPY.invited}</p>
              <p
                className={`mt-[5%] text-[min(5.8cqw,24px)] leading-[1.1] whitespace-nowrap text-(--theme-muted) ${SCRIPT}`}
              >
                {first} &amp; {second}
              </p>
            </div>
            <Image src={envelopePocket.src} alt="" fill sizes="220px" className="object-contain" />
            <span className="absolute top-[69%] left-1/2 w-[19%] -translate-x-1/2 -translate-y-1/2 text-[11px]">
              <Seal initials={initials} className="w-full" />
            </span>
          </div>
        </Drop>

        {/* piring: tanggal */}
        <Drop className="absolute top-[36%] left-[7%] w-[47%]" tilt={0} delay={0.8}>
          <div className="relative" style={{ aspectRatio: `${plate.width} / ${plate.height}` }}>
            <Image
              src={plate.src}
              alt=""
              fill
              sizes="200px"
              className="object-contain drop-shadow-[0_10px_12px_rgb(0_0_0/0.3)]"
            />
            <div
              className={`absolute inset-[18%] flex flex-col items-center justify-center text-center text-(--theme-muted) ${SCRIPT}`}
            >
              <p className="text-[min(5.2cqw,22px)] leading-[1.15]">{formatDate(date, "DD")}</p>
              <p className="text-[min(6.6cqw,28px)] leading-[1.15]">{formatDate(date, "MMMM")}</p>
              <p className="text-[min(5.2cqw,22px)] leading-[1.15]">{formatDate(date, "YYYY")}</p>
            </div>
          </div>
        </Drop>
        <Art art="rosebud" className="top-[32.5%] left-[30%] z-10 w-[19%] rotate-[20deg]" delay={1.9} />
        {flowers("top-[43%] right-[2%] w-[24%]", 1.7)}

        {/* kartu lokasi */}
        <Drop className="absolute top-[55%] left-[40%] w-[50%]" tilt={0} delay={1.1}>
          <a
            href="#pt-location"
            className="flex aspect-[345/435] flex-col items-center bg-white px-[7%] pt-[12%] text-center shadow-[0_10px_18px_-8px_rgb(0_0_0/0.45)]"
          >
            <p className={`text-[min(8cqw,28px)] text-(--theme-muted) ${SCRIPT}`}>{COPY.location}</p>
            <div className="relative mt-[6%] w-full" style={{ aspectRatio: `${venueArt.width} / ${venueArt.height}` }}>
              <Image src={venueArt.src} alt="" fill sizes="200px" className="object-contain" />
            </div>
            {venue?.trim() && (
              <p className="mt-[8%] font-cormorant text-[min(3.6cqw,15px)] leading-snug text-(--theme-muted) italic wrap-break-word">
                {venue}
              </p>
            )}
          </a>
        </Drop>

        {/* polaroid */}
        <Drop className="absolute top-[60%] left-[13%] z-10 w-[28%]" tilt={-6} delay={1.4}>
          <Polaroid src={poses[0].src} alt={`${first} & ${second}`} />
        </Drop>

        {/* angsa = tombol musik */}
        <Drop className="absolute top-[79%] left-[6%] z-20 w-[48%]" tilt={0} delay={2}>
          <button
            type="button"
            onClick={() => music?.toggle()}
            aria-label={COPY.music}
            aria-pressed={!!music?.playing}
            className="relative block w-full cursor-pointer"
          >
            <motion.span
              className="block"
              animate={music?.playing ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src={swan.src}
                alt=""
                width={swan.width}
                height={swan.height}
                sizes="180px"
                className="h-auto w-full drop-shadow-[0_8px_10px_rgb(0_0_0/0.25)]"
              />
            </motion.span>
            <span
              className={`absolute top-[64%] left-[13%] -rotate-3 text-[min(5.2cqw,22px)] whitespace-nowrap text-white [text-shadow:0_1px_2px_rgb(190_100_120/0.7)] ${SCRIPT}`}
            >
              {COPY.tapMusic}
            </span>
          </button>
        </Drop>
        {flowers("top-[80%] -left-[3%] w-[15%]", 2.2)}
        <Art art="orchid" className="top-[78%] -right-[1%] z-30 w-[12%]" delay={2.3} />
      </div>
    </section>
  );
}

/** "Burst": 4 pose foto bergantian seperti photobooth */
export function BurstSection({ date }: { date: string }) {
  const reduced = useReducedMotion();
  const { poses } = ASSETS;
  const last = poses.length - 1;
  const [idx, setIdx] = useState(last);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % poses.length), idx === last ? 2800 : 1100);
    return () => clearTimeout(t);
  }, [idx, last, poses.length, reduced]);

  return (
    <section id="pt-burst" className="@container relative bg-(--theme-bg) px-6 pt-10 pb-12">
      <Reveal>
        <div className="mx-auto w-[80cqw] bg-white p-[3.5%] pb-[12%] shadow-[0_14px_26px_-12px_rgb(63_74_44/0.45)] ring-1 ring-(--pt-sage)/40">
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: `${poses[0].width} / ${poses[0].height}` }}
          >
            {poses.map((p, i) => (
              <Image
                key={p.src}
                src={p.src}
                alt=""
                fill
                sizes="360px"
                priority={i === last}
                className={`object-cover ${i === idx ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <AnimatePresence>
              {!reduced && (
                <motion.span
                  key={idx}
                  aria-hidden
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </div>
          <p className={`mt-[5%] text-center text-[10px] text-(--theme-muted) ${LABEL}`}>
            {formatDate(date, "DD . MM . YYYY")}
          </p>
        </div>
      </Reveal>
      <div aria-hidden className="mt-4 flex justify-center gap-1.5">
        {poses.map((p, i) => (
          <span
            key={p.src}
            className={`size-1.5 rounded-full transition-colors ${i === idx ? "bg-(--theme-accent)" : "bg-(--pt-pale)"}`}
          />
        ))}
      </div>
    </section>
  );
}

/** Salam pembuka + sambutan + kutipan */
export function SalamSection({
  muslim,
  greeting,
  quote,
  quoteSource,
}: {
  muslim: boolean;
  greeting: string;
  quote?: string | null;
  quoteSource?: string | null;
}) {
  return (
    <section id="pt-salam" className="@container relative px-5 pt-12 pb-10">
      <Art art="cosmos" className="top-0 -left-2 w-[18cqw]" delay={0.6} />
      <Reveal>
        <ScallopCard>
          <Stagger delay={0.3}>
            {muslim && (
              <p dir="rtl" className="font-amiri text-[24px] leading-relaxed text-(--theme-primary)">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
            )}
            {muslim && (
              <p className="mt-1 font-cormorant text-[16px] font-semibold italic">
                Assalamu&apos;alaikum Warahmatullahi Wabarakatuh
              </p>
            )}
            <p className={`mt-3 whitespace-pre-line ${BODY}`}>{greeting}</p>
            {quote?.trim() && (
              <p className={`mt-4 border-t border-(--pt-sage)/60 pt-4 whitespace-pre-line italic ${BODY}`}>
                {quote}
              </p>
            )}
            {quote?.trim() && quoteSource?.trim() && <p className={`mt-2 ${KICKER}`}>{quoteSource}</p>}
          </Stagger>
        </ScallopCard>
      </Reveal>
    </section>
  );
}
