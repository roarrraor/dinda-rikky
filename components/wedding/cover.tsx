"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ASSETS, COPY, ID } from "@/lib/wedding/data";
import { formatDate } from "@/lib/wedding/format";
import { MusicProvider } from "./music";
import { EASE, HAND, LABEL, SCRIPT, Seal } from "./primitives";

const ENVELOPE_BOTTOM = "calc(50cqh - 26cqw)";

function playClick() {
  try {
    void new Audio("/assets/sfx/click.mp3").play().catch(() => {});
  } catch {
    /* ignore */
  }
}

/**
 * Cover amplop: tarik amplop ke atas (drag) atau ketuk untuk membuka.
 * Setelah animasi ±2.3 detik, `onOpen` dipanggil dan konten undangan tampil.
 */
export function Cover({
  first,
  second,
  date,
  guestName,
  hashtag,
  opened,
  onOpen,
  audioUrl,
  style,
  children,
}: {
  first: string;
  second: string;
  date: string;
  guestName?: string;
  hashtag?: string | null;
  opened: boolean;
  onOpen: () => void;
  audioUrl?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { envelopeClosed, envelopeOpen, envelopePocket, flowers } = ASSETS;
  const tag = hashtag?.trim().replace(/^#/, "");

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function open() {
    if (opening) return;
    playClick();
    // Lagu mulai setelah bunyi klik segel selesai (klik ~0.44 dtk) -> 0.6 dtk,
    // jadi lagu masuk pas amplop mulai terbuka, bukan bareng bunyi klik.
    setTimeout(() => setMusicStarted(true), 600);
    if (reduced) return onOpen();
    setOpening(true);
    // Urutan: flap buka (0.35-0.95) -> kertas naik (0.95-2.1) -> hold (2.1-2.8)
    // -> zoom-in halus ke halaman utama (2.8-3.7) -> halaman utama tampil.
    timer.current = setTimeout(onOpen, 3700);
  }

  const fade = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: opening ? 0 : 1 },
    transition: opening ? { duration: 0.4 } : { duration: 0.9, delay },
  });

  return (
    <div
      style={style}
      className={`relative min-h-dvh w-full bg-(--theme-bg) font-cormorant text-(--theme-text) ${
        opened ? "overflow-x-clip" : "overflow-hidden"
      }`}
    >
      <MusicProvider opened={opened} audioUrl={audioUrl} startMusic={musicStarted}>
        {opened && children}
      </MusicProvider>

      <AnimatePresence>
        {!opened && (
          <motion.div
            key="pt-cover"
            className="fixed inset-0 z-50 overflow-hidden bg-(--theme-bg) [container-type:size]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            animate={
              opening
                ? {
                    scale: 1.22,
                    opacity: 0,
                    transition: { duration: 0.9, delay: 2.8, ease: [0.65, 0, 0.35, 1] },
                  }
                : { scale: 1, opacity: 1 }
            }
          >
            <motion.h1
              className={`absolute inset-x-0 z-10 text-center text-[min(7cqw,32px)] text-(--theme-muted) ${SCRIPT}`}
              style={{ bottom: "calc(50cqh + 29cqw)" }}
              {...fade(0.3)}
            >
              {first} &amp; {second}
            </motion.h1>

            <div className="absolute left-[15cqw] w-[68cqw]" style={{ bottom: ENVELOPE_BOTTOM }}>
              <div
                className="relative"
                style={{ aspectRatio: `${envelopeOpen.width} / ${envelopeOpen.height}` }}
              >
                {opening && (
                  <>
                    {/* amplop terbuka (belakang) */}
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0, scaleY: 0.85 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      style={{ transformOrigin: "50% 88%" }}
                      transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
                    >
                      <Image
                        src={envelopeOpen.src}
                        alt=""
                        fill
                        sizes="300px"
                        className="object-contain"
                      />
                    </motion.div>
                    {/* kartu undangan naik keluar amplop */}
                    <motion.div
                      className="absolute top-[48%] left-[10%] w-[80%]"
                      initial={{ y: "30%", opacity: 0, scale: 0.97 }}
                      animate={{ y: "-62%", opacity: 1, scale: 1 }}
                      transition={{ duration: 1.15, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="bg-white px-4 pt-5 pb-6 text-center shadow-lg">
                        <p className={`text-[20px] text-(--theme-muted) ${SCRIPT}`}>{COPY.invited}</p>
                        <p className={`text-[26px] text-(--theme-muted) ${SCRIPT}`}>
                          {first} &amp; {second}
                        </p>
                        {tag && (
                          <p className="mt-1 font-cormorant text-[16px] font-semibold tracking-[0.04em] text-(--theme-primary)">
                            #{tag}
                          </p>
                        )}
                        <p className={`mt-1 text-[9px] text-(--theme-accent) ${LABEL}`}>
                          {formatDate(date, "DD . MM . YYYY")}
                        </p>
                      </div>
                    </motion.div>
                    {/* kantong amplop (depan) — muncul halus, bukan pop */}
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                    >
                      <Image
                        src={envelopePocket.src}
                        alt=""
                        fill
                        sizes="300px"
                        className="object-contain"
                      />
                    </motion.div>
                  </>
                )}

                <AnimatePresence>
                  {!opening && (
                    <motion.button
                      key="closed"
                      type="button"
                      onClick={open}
                      aria-label={ID.cover.open}
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      dragElastic={0.5}
                      onDragEnd={(_, info) => {
                        if (info.offset.y < -40) open();
                      }}
                      className="absolute inset-x-0 bottom-0 cursor-grab touch-none active:cursor-grabbing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.3 } }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <Image
                        src={envelopeClosed.src}
                        alt=""
                        width={envelopeClosed.width}
                        height={envelopeClosed.height}
                        priority
                        sizes="300px"
                        draggable={false}
                        className="h-auto w-full drop-shadow-[0_10px_14px_rgb(63_74_44/0.22)]"
                      />
                      <span
                        className="absolute w-[17%] -translate-x-1/2 -translate-y-1/2 text-[13px]"
                        style={{
                          left: `${100 * envelopeClosed.seal.x}%`,
                          top: `${100 * envelopeClosed.seal.y}%`,
                        }}
                      >
                        <Seal className="w-full" />
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* bunga kiri-atas & kanan-bawah: tepat di sudut amplop.
                Amplop: lebar 68cqw (15-83cqw), tinggi 51.9cqw (715x546),
                tepi atas di 50cqh-25.9cqw, tepi bawah di 50cqh+26cqw dari atas.
                Bunga 25x43.3cqw (386x669). Bunga atas menggantung dari sudut
                kiri-atas (pucuknya nempel di tepi atas amplop), bunga bawah
                dipusatkan di sudut kanan-bawah. */}
            {[
              { key: "tl", className: "left-[2.5cqw]", top: "calc(50cqh - 29cqw)", flip: false, delay: 0.8 },
              { key: "br", className: "left-[70.5cqw]", top: "calc(50cqh + 4.4cqw)", flip: true, delay: 1 },
            ].map((f) => (
              <motion.div
                key={f.key}
                aria-hidden
                className={`pointer-events-none absolute z-20 w-[25cqw] origin-center ${f.className}`}
                style={{ top: f.top }}
                initial={{ opacity: 0, y: -12 }}
                animate={
                  opening ? { opacity: 0 } : { opacity: 1, y: 0, rotate: [-2, 2, -2] }
                }
                transition={
                  opening
                    ? { duration: 0.4 }
                    : {
                        opacity: { duration: 1, delay: f.delay },
                        y: { duration: 1, delay: f.delay },
                        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                      }
                }
              >
                <Image
                  src={flowers.src}
                  alt=""
                  width={flowers.width}
                  height={flowers.height}
                  sizes="110px"
                  className={`h-auto w-full ${f.flip ? "-scale-x-100" : ""}`}
                />
              </motion.div>
            ))}

            <motion.p
              className="absolute inset-x-[15cqw] text-center font-cormorant text-[16px] text-(--theme-muted) italic"
              style={{ top: "calc(50cqh + 31cqw)" }}
              {...fade(1.2)}
            >
              <motion.span
                className="inline-block"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {COPY.swipe}
              </motion.span>
            </motion.p>

            <motion.div className="absolute inset-x-[10cqw] bottom-[9cqh] text-center" {...fade(1.4)}>
              <p className="font-cormorant text-[14px] text-(--theme-muted)">{ID.cover.dear}</p>
              <p className="mt-0.5 font-cormorant text-[19px] leading-tight font-semibold text-(--theme-text) wrap-break-word">
                {guestName?.trim() || ID.defaults.guest}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
