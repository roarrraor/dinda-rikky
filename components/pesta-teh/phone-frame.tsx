"use client";

import Image from "next/image";
import { Battery, Signal, Wifi } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { PALETTE } from "@/lib/pesta-teh/data";
import { formatDate } from "@/lib/pesta-teh/format";

type ZoomMode = "fit" | 1 | 0.75 | 0.5;
const PHONE_H = 876;

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function useFitZoom() {
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const calc = () => setFit(Math.min(1, (window.innerHeight - 32) / PHONE_H));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return fit;
}

/**
 * Bingkai halaman pratinjau: di desktop = panel info di kiri + HP (422×876) di kanan,
 * di mobile = undangan full-screen.
 */
export function PhoneFrame({
  names,
  first,
  second,
  date,
  venue,
  groomPhoto,
  bridePhoto,
  groomName,
  brideName,
  bgColor = "#FFFFFF",
  panelBgColor = PALETTE.primary,
  children,
}: {
  names: [string, string];
  first: string;
  second: string;
  date: string;
  venue: string;
  groomPhoto: string;
  bridePhoto: string;
  groomName: string;
  brideName: string;
  bgColor?: string;
  panelBgColor?: string;
  children: ReactNode;
}) {
  const clock = useClock();
  const fit = useFitZoom();
  const [mode, setMode] = useState<ZoomMode>("fit");
  const zoom = mode === "fit" ? fit : mode;
  const modes: { key: ZoomMode; label: string }[] = [
    { key: "fit", label: "Fit" },
    { key: 1, label: "100%" },
    { key: 0.75, label: "75%" },
    { key: 0.5, label: "50%" },
  ];
  const bg = { "--desktop-bg": bgColor, backgroundColor: bgColor } as CSSProperties;

  const avatar = (src: string, alt: string) => (
    <div className="relative size-20 shrink-0 xl:size-24">
      <div className="flex size-full items-center justify-center rounded-full bg-linear-to-tr from-[#FEDA77] via-[#F58529] via-[#DD2A7B] to-[#8134AF] p-[3px] shadow-lg">
        <div className="relative size-full overflow-hidden rounded-full border-2 border-white/80 bg-neutral-200">
          <Image src={src} alt={alt} fill sizes="96px" className="object-cover" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative font-manrope overflow-x-hidden select-none">
      <div className="min-h-screen w-full overflow-x-hidden font-cormorant lg:h-screen lg:overflow-hidden bg-(--desktop-bg)" style={bg}>
        {/* pilihan zoom (desktop) */}
        <div className="hidden lg:flex fixed top-3 right-3 z-110 gap-0.5 rounded-full bg-black/70 backdrop-blur-md p-0.5 shadow-lg border border-white/10">
          {modes.map((m) => (
            <button
              key={String(m.key)}
              type="button"
              onClick={() => setMode(m.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide transition-colors ${
                mode === m.key ? "bg-white text-black" : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="w-full min-h-screen lg:fixed lg:top-0 lg:left-1/2 lg:-translate-x-1/2 lg:h-screen lg:max-w-7xl lg:min-w-240 lg:overflow-hidden flex flex-col lg:flex-row">
          {/* panel kiri */}
          <aside
            className="hidden lg:flex flex-col justify-between flex-1 h-full p-8 xl:p-12 overflow-hidden relative z-0 select-none border-r border-black/10"
            style={{ backgroundColor: panelBgColor }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
            <div className="absolute right-6 bottom-16 font-bold text-7xl xl:text-9xl text-white/5 pointer-events-none select-none tracking-tight leading-none text-right uppercase">
              {names[0]}
              <br />&amp; {names[1]}
            </div>
            <div className="w-full max-w-lg mx-auto flex flex-col justify-between h-full relative z-10">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] font-bold text-white/60">DIGITAL WEDDING INVITATION</p>
                <p className="text-xl font-bold text-white/90">kalabertemu.id</p>
              </div>
              <div className="my-auto space-y-6 xl:space-y-8">
                <div className="space-y-2.5">
                  <p className="text-xs xl:text-sm uppercase tracking-[0.25em] font-bold text-white/70">THE WEDDING OF</p>
                  <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white drop-shadow-xs">
                    {first} &amp; {second}
                  </h1>
                  <p className="text-sm xl:text-base text-white/90 font-semibold">
                    {formatDate(date, "D MMMM YYYY")} • {venue}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  {avatar(bridePhoto, brideName)}
                  {avatar(groomPhoto, groomName)}
                </div>
                <div className="border-2 border-dashed border-white/40 bg-white/5 rounded-[28px] px-5 py-3 xl:px-6 backdrop-blur-xs max-w-sm">
                  <p className="text-xs xl:text-sm text-white/90 leading-relaxed font-semibold">
                    “Because love brought us here... we invite you to celebrate the beginning of our forever.”
                  </p>
                </div>
              </div>
              <div className="text-xs text-white/50 tracking-wider">Mobile preview on the right frame →</div>
            </div>
          </aside>

          {/* HP */}
          <section
            className="w-full lg:flex-1 min-h-screen lg:h-full flex items-center justify-center p-0 lg:py-4 lg:px-6 shrink-0 z-10 mx-auto bg-(--desktop-bg) lg:overflow-hidden relative"
            style={bg}
          >
            <div
              className="phone-shell-native w-full min-h-screen lg:min-h-0 lg:rounded-[48px] lg:bg-[#0E1520] lg:p-3 lg:shadow-[0_30px_90px_rgba(0,0,0,0.85)] lg:border-[3px] lg:border-[#384860] lg:ring-1 lg:ring-white/20 flex flex-col mx-auto shrink-0 relative"
              style={{ "--phone-zoom": zoom, "--phone-h": `${PHONE_H}px`, backgroundColor: bgColor } as CSSProperties}
            >
              <div className="hidden lg:block absolute -left-1.25 top-24 w-0.75 h-6 bg-slate-500 rounded-l-xs shadow-inner" />
              <div className="hidden lg:block absolute -left-1.25 top-36 w-0.75 h-10 bg-slate-500 rounded-l-xs shadow-inner" />
              <div className="hidden lg:block absolute -left-1.25 top-50 w-0.75 h-10 bg-slate-500 rounded-l-xs shadow-inner" />
              <div className="hidden lg:block absolute -right-1.25 top-40 w-0.75 h-14 bg-slate-500 rounded-r-xs shadow-inner" />

              <div
                className="w-full min-h-screen lg:min-h-0 lg:h-full lg:rounded-[38px] lg:overflow-hidden flex flex-col relative lg:border lg:border-black/80 bg-(--desktop-bg) lg:[transform:translateZ(0)]"
                style={bg}
              >
                {/* status bar */}
                <div className="hidden lg:flex absolute top-0 inset-x-0 h-9 px-5 items-center justify-between z-40 pointer-events-none select-none bg-linear-to-b from-black/40 via-black/10 to-transparent">
                  <span className="text-[11px] font-semibold text-white/90 tracking-tight pl-0.5">{clock}</span>
                  <div className="w-24 h-4 bg-black rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-end px-2 gap-1 shadow-xs pointer-events-auto">
                    <div className="w-6 h-1 bg-neutral-800 rounded-full" />
                    <div className="w-2 h-2 bg-[#0A0D18] rounded-full border border-neutral-800" />
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Signal size={11} strokeWidth={2.5} aria-hidden />
                    <Wifi size={11} strokeWidth={2.5} aria-hidden />
                    <Battery size={15} aria-hidden />
                  </div>
                </div>

                <div
                  data-scroll-container="true"
                  data-phone-frame="true"
                  className="hide-scrollbar w-full min-h-screen lg:min-h-0 lg:h-full relative overflow-x-hidden overflow-y-auto"
                  style={{ backgroundColor: bgColor }}
                >
                  {children}
                </div>

                <div className="hidden lg:flex absolute bottom-2 left-1/2 -translate-x-1/2 z-40 shrink-0 select-none items-center justify-center pointer-events-none">
                  <div className="w-28 h-1 bg-white/40 rounded-full shadow-xs" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
