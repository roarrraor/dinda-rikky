"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Children, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { ASSETS, type ArtKey } from "@/lib/pesta-teh/data";

export const EASE = [0.22, 1, 0.36, 1] as const;

// Kelas tipografi
export const SCRIPT = "font-great-vibes font-normal leading-[1.2]";
export const HAND = "font-caveat";
export const LABEL = "font-marcellus uppercase tracking-[0.2em]";
export const KICKER = `${LABEL} text-[11px] text-(--theme-accent)`;
export const BODY = "font-cormorant text-[17px] leading-[1.55]";

/** Pola gingham pink-putih (kotak-kotak taplak) */
export const GINGHAM: CSSProperties = {
  backgroundColor: "var(--theme-bg)",
  backgroundImage:
    "linear-gradient(90deg, color-mix(in srgb, var(--pt-pink) 70%, transparent) 50%, transparent 50%), linear-gradient(color-mix(in srgb, var(--pt-pink) 70%, transparent) 50%, transparent 50%)",
  backgroundSize: "14px 14px",
};

/** Latar rumput hijau (section penutup) */
export const GRASS: CSSProperties = {
  backgroundColor: "var(--theme-primary)",
  backgroundImage: `url(${ASSETS.grass.src})`,
  backgroundSize: "500px auto",
  backgroundPosition: "center top",
};

/** Mask tepi bergerigi (scalloped) seperti kertas perforasi */
export function scallopMask(r: number): CSSProperties {
  const d = 2 * r;
  const mask =
    `radial-gradient(circle at 50% 100%, #000 ${r - 0.5}px, transparent ${r}px) top / ${d}px ${r}px repeat-x, ` +
    `radial-gradient(circle at 50% 0, #000 ${r - 0.5}px, transparent ${r}px) bottom / ${d}px ${r}px repeat-x, ` +
    `radial-gradient(circle at 100% 50%, #000 ${r - 0.5}px, transparent ${r}px) left / ${r}px ${d}px repeat-y, ` +
    `radial-gradient(circle at 0 50%, #000 ${r - 0.5}px, transparent ${r}px) right / ${r}px ${d}px repeat-y, ` +
    `linear-gradient(#000 0 0) center / calc(100% - ${d - 2}px) calc(100% - ${d - 2}px) no-repeat`;
  return { mask, WebkitMask: mask };
}

/** Fade-up saat masuk viewport */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Fade-up berurutan untuk tiap child */
export function Stagger({
  children,
  delay = 0,
  step = 0.15,
}: {
  children: ReactNode;
  delay?: number;
  step?: number;
}) {
  return (
    <>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + i * step, ease: EASE }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

/** Kartu/polaroid yang "jatuh" dengan spring ke posisinya */
export function Drop({
  children,
  className = "",
  tilt = 0,
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: -26, rotate: tilt - 8, scale: 1.05 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ type: "spring", stiffness: 130, damping: 16, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Ilustrasi dekoratif (bunga, anggrek, dll) */
export function Art({
  art,
  className = "",
  delay = 0,
  flip = false,
}: {
  art: ArtKey;
  className?: string;
  delay?: number;
  flip?: boolean;
}) {
  const a = ASSETS[art];
  const sway = art === "flowers" || art === "cosmos" || art === "orchid";
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      initial={{ opacity: 0, scale: 0.75 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      <motion.div
        className="origin-top"
        animate={sway ? { rotate: [-1.5, 1.5, -1.5] } : undefined}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={a.src}
          alt=""
          width={a.width}
          height={a.height}
          sizes="200px"
          className={`h-auto w-full ${flip ? "-scale-x-100" : ""}`}
        />
      </motion.div>
    </motion.div>
  );
}

/** Segel lilin dengan inisial */
export function Seal({ initials, className = "" }: { initials: string; className?: string }) {
  const { seal } = ASSETS;
  return (
    <div aria-hidden className={`relative ${className}`}>
      <Image
        src={seal.src}
        alt=""
        width={seal.width}
        height={seal.height}
        sizes="100px"
        className="h-auto w-full drop-shadow-[0_3px_4px_rgb(0_0_0/0.2)]"
      />
      <span className="absolute inset-0 grid place-items-center font-great-vibes text-[1.5em] leading-none text-(--theme-surface)/90 [text-shadow:0_-1px_0_rgb(0_0_0/0.25)]">
        {initials}
      </span>
    </div>
  );
}

/** Foto polaroid 4:5 */
export function Polaroid({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`bg-white p-[5%] pb-[16%] shadow-[0_8px_18px_-6px_rgb(0_0_0/0.35)] ${className}`}>
      <div className="relative aspect-4/5 overflow-hidden">
        <Image src={src} alt={alt} fill sizes="220px" className="object-cover" />
      </div>
    </div>
  );
}

/** Kartu surface dengan tepi scallop + pita (bow) di atas */
export function ScallopCard({
  children,
  className = "",
  bow = true,
}: {
  children: ReactNode;
  className?: string;
  bow?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        style={scallopMask(9)}
        className="bg-(--theme-surface) px-7 pt-10 pb-9 text-center drop-shadow-[0_8px_14px_rgb(63_74_44/0.16)]"
      >
        {children}
      </div>
      {bow && (
        <div aria-hidden className="absolute -top-8 left-1/2 w-16 -translate-x-1/2">
          <Image
            src={ASSETS.bow.src}
            alt=""
            width={ASSETS.bow.width}
            height={ASSETS.bow.height}
            sizes="64px"
            className="h-auto w-full"
          />
        </div>
      )}
    </div>
  );
}

/** Judul section: kicker kecil + judul script besar */
export function SectionTitle({
  kicker,
  children,
  light = false,
}: {
  kicker?: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="text-center">
      {kicker && <p className={KICKER}>{kicker}</p>}
      <h2
        className={`mt-1 text-[32px] ${light ? "text-(--theme-surface)" : "text-(--theme-muted)"} ${SCRIPT}`}
      >
        {children}
      </h2>
    </div>
  );
}

/** Strip gingham dekoratif */
export function GinghamStrip({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-3 w-full ${className}`} style={GINGHAM} />;
}

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-marcellus text-[12px] uppercase leading-none tracking-[0.16em] transition-transform active:scale-[0.97] disabled:opacity-60 cursor-pointer";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { outline?: boolean };

export function PtButton({ children, className = "", outline = false, type = "button", ...rest }: ButtonProps) {
  const tone = outline
    ? "border border-(--theme-primary) bg-white text-(--theme-primary)"
    : "bg-(--theme-primary) text-white shadow-[0_6px_14px_-6px_rgb(63_74_44/0.6)]";
  return (
    <button type={type} {...rest} className={`${BTN_BASE} ${tone} ${className}`}>
      {children}
    </button>
  );
}
