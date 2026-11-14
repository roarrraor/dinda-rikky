"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ASSETS, COPY, ID } from "@/lib/pesta-teh/data";
import { formatDate } from "@/lib/pesta-teh/format";
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
  opened: boolean;
  onOpen: () => void;
  audioUrl?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { envelopeClosed, envelopeOpen, envelopePocket, flowers } = ASSETS;
  const initials = `${first.charAt(0)}${second.charAt(0)}`;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function open() {
    if (opening) return;
    playClick();
    if (reduced) return onOpen();
    setOpening(true);
    timer.current = setTimeout(onOpen, 2300);
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
      <MusicProvider opened={opened} audioUrl={audioUrl}>
        {opened && children}
      </MusicProvider>

      <AnimatePresence>
        {!opened && (
          <motion.div
            key="pt-cover"
            className="fixed inset-0 z-50 overflow-hidden bg-(--theme-bg) [container-type:size]"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <motion.h1
              className={`absolute right-[13cqw] z-10 text-[min(8.5cqw,40px)] text-(--theme-muted) ${SCRIPT}`}
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
                      transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
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
                      initial={{ y: "30%", opacity: 0 }}
                      animate={{ y: "-62%", opacity: 1 }}
                      transition={{ duration: 1, delay: 0.95, ease: EASE }}
                    >
                      <div className="bg-white px-4 pt-5 pb-6 text-center shadow-lg">
                        <p className={`text-[22px] text-(--theme-muted) ${SCRIPT}`}>{COPY.invited}</p>
                        <p className={`text-[30px] text-(--theme-muted) ${SCRIPT}`}>
                          {first} &amp; {second}
                        </p>
                        <p className={`mt-1 text-[9px] text-(--theme-accent) ${LABEL}`}>
                          {formatDate(date, "DD . MM . YYYY")}
                        </p>
                      </div>
                    </motion.div>
                    {/* kantong amplop (depan) */}
                    <Image
                      src={envelopePocket.src}
                      alt=""
                      fill
                      sizes="300px"
                      className="object-contain"
                    />
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
                        <Seal initials={initials} className="w-full" />
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* bunga kiri-atas & kanan-bawah */}
            {[
              { key: "tl", className: "left-[6cqw]", top: `calc(${ENVELOPE_BOTTOM} - 16cqw)`, flip: false, delay: 0.8 },
              { key: "br", className: "right-[6cqw]", top: `calc(${ENVELOPE_BOTTOM} + 14cqw)`, flip: true, delay: 1 },
            ].map((f) => (
              <motion.div
                key={f.key}
                aria-hidden
                className={`pointer-events-none absolute z-20 w-[25cqw] origin-top ${f.className}`}
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
