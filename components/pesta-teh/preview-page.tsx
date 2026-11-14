"use client";

import Link from "next/link";
import { ArrowLeft, WandSparkles } from "lucide-react";
import { DEMO_WEDDING } from "@/lib/pesta-teh/data";
import { PreviewContext } from "./preview-context";
import { WeddingPestaTeh } from "./wedding-pesta-teh";

const WATERMARK_ROWS = 12;

/** Halaman /pesta-teh: demo tema + watermark + tombol katalog/order. */
export function PreviewPage({ guestName }: { guestName?: string }) {
  return (
    <PreviewContext.Provider value>
      <WeddingPestaTeh data={DEMO_WEDDING} guestName={guestName} />

      <div className="fixed inset-0 z-100 pointer-events-none">
        <div className="absolute inset-0 flex flex-col justify-around rotate-[-25deg] scale-150 overflow-hidden pointer-events-none opacity-30">
          {Array.from({ length: WATERMARK_ROWS }, (_, i) => (
            <span key={i} className="text-sm font-bold tracking-[0.3em] text-white/10 whitespace-nowrap text-center block">
              PREVIEW • KALABERTEMU.ID • DEMO •
            </span>
          ))}
        </div>

        <Link
          href="/themes"
          className="pointer-events-auto absolute top-2.5 left-2.5 sm:top-6 sm:left-6 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold transition-all shadow-lg border border-white/15 hover:scale-105 active:scale-95 z-50 opacity-90 hover:opacity-100"
        >
          <ArrowLeft size={13} className="text-white/80" aria-hidden />
          <span className="hidden sm:inline">Katalog Tema</span>
          <span className="sm:hidden">Katalog</span>
        </Link>

        <Link
          href="/order?theme=pesta-teh"
          className="pointer-events-auto absolute bottom-5 right-4 sm:right-6 z-100 flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-linear-to-r from-[#C07858] to-[#A86244] hover:from-[#A86244] hover:to-[#8C4F34] text-white font-bold text-xs sm:text-sm shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/25 group"
        >
          <WandSparkles size={16} className="transition-transform group-hover:rotate-12" aria-hidden />
          <span>Order Sekarang</span>
        </Link>
      </div>
    </PreviewContext.Provider>
  );
}
