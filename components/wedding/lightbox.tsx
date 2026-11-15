"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function Lightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
}: {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="relative h-[80dvh] w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt={alt} fill sizes="448px" className="object-contain" />
      </div>
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-white/15 text-white"
      >
        <X size={20} />
      </button>
      {onPrev && (
        <button
          type="button"
          aria-label="Sebelumnya"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 grid size-10 place-items-center rounded-full bg-white/15 text-white"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {onNext && (
        <button
          type="button"
          aria-label="Berikutnya"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 grid size-10 place-items-center rounded-full bg-white/15 text-white"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}
