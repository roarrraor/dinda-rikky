"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Aperture,
  Camera,
  Check,
  ChevronLeft,
  Download,
  ImagePlus,
  LayoutGrid,
  RotateCcw,
  Share2,
  SwitchCamera,
  Trash2,
  Wand2,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import {
  DEFAULT_FILTER_ID,
  DEFAULT_FONT_ID,
  DEFAULT_FRAME_ID,
  DEFAULT_SHAPE_ID,
  FILTERS,
  FONTS,
  FRAME_CONCEPTS,
  FRAMES,
  IMAGE_FRAMES,
  LAYOUTS,
  MY_STRIPS_KEY,
  MY_STRIPS_MAX,
  PHOTOBOOTH_COPY as T,
  SHAPES,
  layoutGeometry,
  stripFileName,
  type FrameConcept,
  type ImageFrame,
  type PhotoboothFilter,
  type PhotoboothFont,
  type PhotoboothFrame,
  type PhotoboothLayout,
  type ShapeId,
} from "@/lib/wedding/photobooth";
import { PtButton } from "./primitives";

export interface PhotoboothCaption {
  names: string;
  date: string;
  tag: string | null;
}

/* ============================== util kanvas ============================== */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`gagal memuat gambar: ${src}`));
    img.src = src;
  });
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Potong cover (seperti object-fit: cover) dari sumber ke target. */
function coverCrop(
  sw: number,
  sh: number,
  aspect: number,
  zoom = 1,
): { sx: number; sy: number; sw: number; sh: number } {
  let cw: number;
  let ch: number;
  if (sw / sh > aspect) {
    ch = sh;
    cw = sh * aspect;
  } else {
    cw = sw;
    ch = sw / aspect;
  }
  cw /= zoom;
  ch /= zoom;
  return { sx: (sw - cw) / 2, sy: (sh - ch) / 2, sw: cw, sh: ch };
}

export interface StripOptions {
  layout: PhotoboothLayout;
  shots: (string | null)[];
  frame: PhotoboothFrame;
  imageFrame?: ImageFrame | null;
  font: PhotoboothFont;
  shape: ShapeId;
  filter: PhotoboothFilter;
  caption: PhotoboothCaption;
}

async function ensureFonts(font: PhotoboothFont) {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`72px ${font.family}`),
        document.fonts.load(`24px Marcellus, serif`),
      ]),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch {
    /* font fallback: pakai yang tersedia */
  }
}

/** Gambar strip lengkap ke kanvas (dipakai preview & unduhan). */
/** #RRGGBB + alpha -> "rgba(r,g,b,a)" (buat fade footer frame background). */
function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Pasang font dengan ukuran yang muat di maxWidth — huruf dikecilkan,
 *  bukan digencet horizontal (fillText maxWidth menggencet huruf). */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  startPx: number,
  maxWidth: number,
  minPx: number,
): void {
  let px = startPx;
  ctx.font = `${px}px ${family}`;
  while (px > minPx && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = `${px}px ${family}`;
  }
}

export async function renderStrip(canvas: HTMLCanvasElement, opts: StripOptions): Promise<void> {
  const { layout, shots, frame, imageFrame, font, shape, filter, caption } = opts;
  const g = layoutGeometry(layout);
  canvas.width = g.w;
  canvas.height = g.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  await ensureFonts(font);

  // Latar: warna dasar, lalu frame gambar "background" (ala inveet) kalau ada
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, g.w, g.h);
  if (imageFrame?.layer === "background") {
    try {
      const bg = await loadImage(imageFrame.src);
      // Cover-fit: gambar full menutupi kanvas, kelebihannya dipotong.
      const s = Math.max(g.w / bg.naturalWidth, g.h / bg.naturalHeight);
      const sw = g.w / s;
      const sh = g.h / s;
      const sx = (bg.naturalWidth - sw) / 2;
      const sy = (bg.naturalHeight - sh) / 2;
      ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, g.w, g.h);
      // Fade footer ke warna krem supaya teks nama/tanggal terbaca.
      if (imageFrame.footerFade) {
        const footerTop = g.h - g.footerH;
        const grad = ctx.createLinearGradient(0, footerTop - 60, 0, footerTop + 60);
        grad.addColorStop(0, hexA(imageFrame.footerFade, 0));
        grad.addColorStop(1, hexA(imageFrame.footerFade, 1));
        ctx.fillStyle = grad;
        ctx.fillRect(0, footerTop - 60, g.w, 120);
        ctx.fillStyle = imageFrame.footerFade;
        ctx.fillRect(0, footerTop + 60, g.w, g.h - footerTop - 60);
      }
    } catch {
      /* background gagal: lanjut dengan warna dasar */
    }
  }

  // Foto
  for (let i = 0; i < layout.shots; i++) {
    const slot = g.slots[i];
    const src = shots[i];
    if (shape === "polaroid") {
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.fillRect(slot.x - 14, slot.y - 14, slot.w + 28, slot.h + 28 + 44);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    if (src) {
      try {
        const img = await loadImage(src);
        const c = coverCrop(img.naturalWidth, img.naturalHeight, slot.w / slot.h);
        ctx.save();
        if (shape === "lembut") roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, 26);
        else ctx.rect(slot.x, slot.y, slot.w, slot.h);
        ctx.clip();
        ctx.filter = filter.css === "none" ? "none" : filter.css;
        ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, slot.x, slot.y, slot.w, slot.h);
        ctx.restore();
      } catch {
        ctx.fillStyle = frame.accent;
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      }
    } else {
      ctx.fillStyle = frame.accent;
      ctx.globalAlpha = 0.35;
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.globalAlpha = 1;
    }
    if (shape === "lembut") {
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 2;
      roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, 26);
      ctx.stroke();
    }
  }

  // Overlay frame gambar (kalau ada), lalu garis tepi.
  // Frame "background" tidak digambar ulang di sini dan tidak pakai garis
  // tepi kode (gambarnya sudah membawa border/dekorasinya sendiri).
  if (imageFrame?.layer === "overlay") {
    try {
      const overlay = await loadImage(imageFrame.src);
      ctx.drawImage(overlay, 0, 0, g.w, g.h);
    } catch {
      /* overlay gagal: lanjut tanpa overlay */
    }
  }
  if (imageFrame?.layer !== "background") {
    ctx.strokeStyle = frame.border;
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, g.w - 32, g.h - 32);
  }

  // Footer
  if (!imageFrame || imageFrame.footer === "drawn") {
    const footerTop = g.h - g.footerH;
    ctx.strokeStyle = frame.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.w / 2 - 90, footerTop + 34);
    ctx.lineTo(g.w / 2 + 90, footerTop + 34);
    ctx.stroke();
    ctx.fillStyle = frame.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const scriptLike = font.id === "dancing" || font.id === "caveat";
    fitFont(ctx, caption.names, font.family, scriptLike ? 72 : 46, g.w - 120, 32);
    ctx.fillText(caption.names, g.w / 2, footerTop + 88);
    try {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "4px";
    } catch {
      /* abaikan */
    }
    const sub = caption.tag ? `${caption.date}  ·  ${caption.tag}` : caption.date;
    fitFont(ctx, sub, "Marcellus, serif", 26, g.w - 120, 18);
    ctx.fillText(sub, g.w / 2, footerTop + 146);
    try {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
    } catch {
      /* abaikan */
    }
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export interface SavedStrip {
  id: string;
  src: string;
  savedAt: number;
}

export function loadMyStrips(): SavedStrip[] {
  try {
    const raw = localStorage.getItem(MY_STRIPS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedStrip[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveMyStrip(src: string) {
  try {
    const arr = loadMyStrips();
    arr.unshift({ id: `${Date.now()}`, src, savedAt: Date.now() });
    localStorage.setItem(MY_STRIPS_KEY, JSON.stringify(arr.slice(0, MY_STRIPS_MAX)));
  } catch {
    /* penyimpanan penuh / tidak tersedia: abaikan */
  }
}

function removeMyStrip(id: string) {
  try {
    localStorage.setItem(
      MY_STRIPS_KEY,
      JSON.stringify(loadMyStrips().filter((s) => s.id !== id)),
    );
  } catch {
    /* abaikan */
  }
}

/* ============================== studio ============================== */

type Step = "layout" | "access" | "camera" | "review" | "result";
type Tab = "frame" | "font" | "shape" | "filter";

const STEP_NAMES: Record<Step, string> = {
  layout: T.step1,
  access: T.step2,
  camera: T.step2,
  review: T.step2,
  result: T.step3,
};

const STEP_NUM: Record<Step, number> = { layout: 1, access: 2, camera: 2, review: 2, result: 3 };

/** Tipografi UI studio: Montserrat biasa (ramah, umum) — bukan script/serif undangan. Warna brand tetap sama. */
const PB_BODY = "font-montserrat text-[15px] leading-relaxed text-balance text-(--theme-muted)";
const PB_KICKER = "font-montserrat text-[12px] font-semibold uppercase tracking-[0.08em] text-(--theme-accent)";
const PB_TITLE = "font-montserrat text-[28px] font-semibold leading-tight text-(--theme-muted)";

export function PhotoboothStudio({ caption }: { caption: PhotoboothCaption }) {
  const [step, setStep] = useState<Step>("layout");
  const [layout, setLayout] = useState<PhotoboothLayout>(LAYOUTS[0]);
  const [frameId, setFrameId] = useState(DEFAULT_FRAME_ID);
  const [imageFrameId, setImageFrameId] = useState<string | null>(null);
  const [fontId, setFontId] = useState(DEFAULT_FONT_ID);
  const [shapeId, setShapeId] = useState<ShapeId>(DEFAULT_SHAPE_ID);
  const [filterId, setFilterId] = useState(DEFAULT_FILTER_ID);
  const [shots, setShots] = useState<(string | null)[]>([null, null, null]);
  const [tab, setTab] = useState<Tab>("frame");
  const [concept, setConcept] = useState<"Semua" | FrameConcept>("Semua");
  const [notice, setNotice] = useState<string | null>(null);

  // kamera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camState, setCamState] = useState<"idle" | "waiting" | "live" | "denied">("idle");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [zoom, setZoom] = useState(1);
  const [gridOn, setGridOn] = useState(false);
  const [autoOn, setAutoOn] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [target, setTarget] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const takingRef = useRef(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0];
  const imageFrame = imageFrameId ? (IMAGE_FRAMES.find((f) => f.id === imageFrameId) ?? null) : null;
  const font = FONTS.find((f) => f.id === fontId) ?? FONTS[0];
  const filter = FILTERS.find((f) => f.id === filterId) ?? FILTERS[0];
  const shotsTaken = shots.filter(Boolean).length;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamState("idle");
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  // Video element baru mount saat masuk langkah kamera — pasang stream yang
  // sudah didapat di sini (startCamera bisa jalan sebelum <video> ter-render).
  useEffect(() => {
    if (camState === "live" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => undefined);
    }
  }, [camState, step]);

  const startCamera = useCallback(
    async (mode: "user" | "environment") => {
      setCamState("waiting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setCamState("live");
      } catch {
        setCamState("denied");
      }
    },
    [],
  );

  const pickLayout = (l: PhotoboothLayout) => {
    setLayout(l);
    setShots(Array.from({ length: l.shots }, () => null));
    setTarget(0);
    setStep("access");
  };

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Jepret satu frame dari video -> data URL (belum disimpan ke state). */
  const captureOne = useCallback(
    async (): Promise<string | null> => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return null;
      const g = layoutGeometry(layout);
      const canvas = document.createElement("canvas");
      canvas.width = g.photoW;
      canvas.height = g.photoH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      const c = coverCrop(video.videoWidth, video.videoHeight, g.photoW / g.photoH, zoom);
      ctx.save();
      if (facing === "user") {
        ctx.translate(g.photoW, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, c.sx, c.sy, c.sw, c.sh, 0, 0, g.photoW, g.photoH);
      ctx.restore();
      return canvas.toDataURL("image/jpeg", 0.92);
    },
    [layout, zoom, facing],
  );

  const runCountdown = useCallback(async () => {
    for (const n of [3, 2, 1]) {
      setCountdown(n);
      await wait(650);
    }
    setCountdown(null);
  }, []);

  const takeShot = useCallback(
    async (index: number) => {
      if (takingRef.current || countdown !== null) return;
      takingRef.current = true;
      await runCountdown();
      const url = await captureOne();
      if (!url) {
        takingRef.current = false;
        setNotice("Kamera belum siap — coba lagi sebentar.");
        return;
      }
      // hitung daftar bidikan dari array terbaru (bukan state lama)
      let current = shots;
      const apply = (arr: (string | null)[], i: number, u: string) => {
        const next = [...arr];
        next[i] = u;
        return next;
      };
      current = apply(current, index, url);
      setShots(current);
      if (autoOn) {
        for (let i = 0; i < layout.shots; i++) {
          if (current[i]) continue;
          await runCountdown();
          const u = await captureOne();
          if (u) {
            current = apply(current, i, u);
            setShots(current);
          }
        }
        takingRef.current = false;
        setAutoOn(false);
        setStep("review");
        return;
      }
      takingRef.current = false;
      const nextEmpty = current.findIndex((s) => s === null);
      if (nextEmpty === -1) setStep("review");
      else setTarget(nextEmpty);
    },
    [autoOn, captureOne, countdown, layout.shots, runCountdown, shots],
  );

  const retakeOne = (index: number) => {
    setTarget(index);
    setStep("camera");
    if (camState !== "live") void startCamera(facing);
  };

  const retakeAll = () => {
    setShots(Array.from({ length: layout.shots }, () => null));
    setTarget(0);
    setStep("camera");
    if (camState !== "live") void startCamera(facing);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const g = layoutGeometry(layout);
    const next = [...shots];
    for (const file of Array.from(files)) {
      const empty = next.findIndex((s) => s === null);
      if (empty === -1) break;
      try {
        const url = URL.createObjectURL(file);
        const img = await loadImage(url);
        const canvas = document.createElement("canvas");
        canvas.width = g.photoW;
        canvas.height = g.photoH;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        const c = coverCrop(img.naturalWidth, img.naturalHeight, g.photoW / g.photoH);
        ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, g.photoW, g.photoH);
        next[empty] = canvas.toDataURL("image/jpeg", 0.92);
        URL.revokeObjectURL(url);
      } catch {
        /* file rusak: lewati */
      }
    }
    setShots(next);
    if (next.every(Boolean)) setStep("review");
    else {
      setNotice("Beberapa foto masuk — lanjutkan sisanya dengan kamera.");
      setTarget(next.findIndex((s) => s === null));
      setStep("camera");
      void startCamera(facing);
    }
  };

  // preview strip (langkah hasil)
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (step !== "result") return;
    const canvas = previewRef.current;
    if (!canvas) return;
    let alive = true;
    void renderStrip(canvas, { layout, shots, frame, imageFrame, font, shape: shapeId, filter, caption }).catch(
      () => {
        if (alive) setNotice("Preview gagal digambar — coba ganti bingkai.");
      },
    );
    return () => {
      alive = false;
    };
  }, [step, layout, shots, frame, imageFrame, font, shapeId, filter, caption]);

  const buildStripBlob = async (): Promise<Blob | null> => {
    const canvas = document.createElement("canvas");
    await renderStrip(canvas, { layout, shots, frame, imageFrame, font, shape: shapeId, filter, caption });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  };

  const saveStrip = async () => {
    const blob = await buildStripBlob();
    if (!blob) return;
    downloadBlob(blob, stripFileName());
    // simpan salinan kecil ke galeri perangkat ini
    try {
      const canvas = document.createElement("canvas");
      await renderStrip(canvas, { layout, shots, frame, imageFrame, font, shape: shapeId, filter, caption });
      const small = document.createElement("canvas");
      small.width = 360;
      small.height = Math.round((360 * canvas.height) / canvas.width);
      small.getContext("2d")?.drawImage(canvas, 0, 0, small.width, small.height);
      saveMyStrip(small.toDataURL("image/jpeg", 0.8));
    } catch {
      /* galeri lokal gagal: unduhan tetap jalan */
    }
    setNotice(T.saved);
  };

  const shareStrip = async () => {
    const blob = await buildStripBlob();
    if (!blob) return;
    const file = new File([blob], stripFileName(), { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Photobooth Dinda & Rikky" });
        return;
      } catch {
        /* dibatalkan: jangan unduh otomatis */
        return;
      }
    }
    downloadBlob(blob, stripFileName());
    setNotice(T.shareFallback);
  };

  const restart = () => {
    setShots(Array.from({ length: layout.shots }, () => null));
    setTarget(0);
    setAutoOn(false);
    setNotice(null);
    setStep("camera");
    if (camState !== "live") void startCamera(facing);
  };

  // Frame gambar hanya tampil untuk layout yang didukung ukurannya.
  const visibleFrames = [
    ...FRAMES,
    ...IMAGE_FRAMES.filter((f) => f.layouts.includes(layout.id)),
  ].filter((f) => concept === "Semua" || f.concept === concept);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-white shadow-[0_0_60px_rgba(0,0,0,0.10)]">
      {/* header langkah */}
      <header className="flex items-center justify-between gap-2 border-b border-(--pt-sage)/40 px-4 py-3">
        <Link href="/" className="flex items-center gap-1 font-montserrat font-semibold text-[12px] uppercase tracking-[0.08em] text-(--theme-primary)">
          <ChevronLeft size={14} />
          {step === "layout" ? "Undangan" : "Kembali"}
        </Link>
        <p className="font-montserrat text-[14px] font-medium text-(--theme-muted)">
          Langkah {STEP_NUM[step]} dari 3 · {STEP_NAMES[step]}
        </p>
        <p className="hidden font-montserrat font-semibold text-[11px] tracking-[0.08em] text-(--theme-text) min-[380px]:block">
          {caption.names}
        </p>
      </header>

      {notice && (
        <button
          type="button"
          onClick={() => setNotice(null)}
          className="bg-(--theme-surface) px-4 py-2 text-center font-montserrat text-[14px] font-medium text-(--theme-text)"
        >
          {notice} ✕
        </button>
      )}

      {/* ---------- LANGKAH 1: tata letak ---------- */}
      {step === "layout" && (
        <main className="flex-1 px-5 pt-8 pb-10 text-center">
          <p className={PB_KICKER}>Photobooth</p>
          <h1 className={`mt-1 ${PB_TITLE}`}>Abadikan momen ini</h1>
          <p className={`mx-auto mt-2 max-w-80 ${PB_BODY}`}>{T.step1Desc}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => pickLayout(l)}
                className="relative rounded-3xl border border-(--pt-sage)/60 bg-(--theme-surface) p-4 text-left transition-transform active:scale-[0.98] cursor-pointer"
              >
                {l.badge && (
                  <span className="absolute -top-2.5 right-3 rounded-full bg-[#E8A33D] px-2.5 py-0.5 font-montserrat font-semibold text-[10px] uppercase tracking-[0.08em] text-white">
                    {l.badge}
                  </span>
                )}
                <span className="font-montserrat text-[16px] font-semibold text-(--theme-text)">{l.name}</span>
                <span className="mt-1 block font-montserrat text-[14px] leading-relaxed text-(--theme-muted)">{l.desc}</span>
                <span className="mt-3 flex items-center gap-2 font-montserrat font-semibold text-[11px] uppercase tracking-[0.08em] text-(--theme-primary)">
                  <Aperture size={13} />
                  {l.shots} foto · {l.orientation}
                </span>
              </button>
            ))}
          </div>

          <p className={`mx-auto mt-8 max-w-80 ${PB_BODY}`}>{T.tip}</p>
          <p className="mt-6 font-montserrat text-[14px] text-(--theme-muted)">{T.privacy}</p>
        </main>
      )}

      {/* ---------- LANGKAH 2a: akses kamera ---------- */}
      {step === "access" && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-(--theme-surface) text-(--theme-primary)">
            <Camera size={26} />
          </span>
          <h1 className={`mt-4 ${PB_TITLE}`}>{T.cameraTitle}</h1>
          <p className={`mt-2 max-w-72 ${PB_BODY}`}>{T.cameraDesc}</p>
          <div className="mt-8 flex w-full max-w-72 flex-col gap-3">
            <PtButton friendly
              onClick={() => {
                setStep("camera");
                void startCamera(facing);
              }}
            >
              <Camera size={14} />
              {T.toCamera}
            </PtButton>
            <PtButton friendly outline onClick={() => fileRef.current?.click()}>
              <ImagePlus size={14} />
              {T.fromGallery}
            </PtButton>
            <button
              type="button"
              onClick={() => setStep("layout")}
              className="font-montserrat text-[15px] font-medium text-(--theme-muted) underline underline-offset-4 cursor-pointer"
            >
              {T.later}
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </main>
      )}

      {/* ---------- LANGKAH 2b: kamera ---------- */}
      {step === "camera" && (
        <main className="flex flex-1 flex-col bg-[#101214] text-white">
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex gap-1.5">
              {shots.map((s, i) => (
                <span
                  key={i}
                  className={`size-2.5 rounded-full ${s ? "bg-[#E8A33D]" : i === target ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>
            <p className="font-montserrat text-[15px] text-white/80">{T.shotsTaken(shotsTaken, layout.shots)}</p>
          </div>

          <div className="relative mx-4 mt-3 flex-1 overflow-hidden rounded-3xl bg-black">
            {camState === "live" ? (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: filter.css === "none" ? undefined : filter.css,
                  transform: `scaleX(${facing === "user" ? -1 : 1}) scale(${zoom})`,
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center px-6 text-center">
                {camState === "denied" ? (
                  <div>
                    <p className="font-montserrat text-[15px] font-semibold uppercase tracking-[0.08em]">{T.cameraDenied}</p>
                    <p className="mt-2 font-montserrat text-[16px] leading-relaxed text-white/75">{T.cameraDeniedDesc}</p>
                    <PtButton friendly className="mt-5" onClick={() => fileRef.current?.click()}>
                      <ImagePlus size={14} />
                      {T.fromGallery}
                    </PtButton>
                  </div>
                ) : (
                  <div>
                    <p className="font-montserrat text-[15px] font-semibold uppercase tracking-[0.08em]">{T.waitingCamera}</p>
                    <p className="mt-2 font-montserrat text-[16px] leading-relaxed text-white/75">{T.waitingCameraDesc}</p>
                  </div>
                )}
              </div>
            )}
            {gridOn && camState === "live" && (
              <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/25" />
                ))}
              </div>
            )}
            {countdown !== null && (
              <div className="absolute inset-0 grid place-items-center bg-black/30">
                <span className="font-montserrat text-[96px] font-bold leading-none text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
                  {countdown}
                </span>
              </div>
            )}
            {shotsTaken > 0 && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2 rounded-full bg-black/60 py-1 pr-3 pl-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shots[target] ?? shots.filter(Boolean).at(-1) ?? ""} alt={T.lastShot} className="size-9 rounded-full object-cover" />
                <span className="font-montserrat text-[13px] font-medium">{T.lastShot}</span>
              </div>
            )}
          </div>

          {/* kontrol kamera */}
          <div className="px-4 pt-3 pb-5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setGridOn((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-montserrat text-[14px] font-medium cursor-pointer ${gridOn ? "bg-[#E8A33D] text-black" : "bg-white/10 text-white"}`}
              >
                <LayoutGrid size={15} />
                {T.grid}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 font-montserrat text-[14px] font-medium cursor-pointer ${showFilters ? "bg-[#E8A33D] text-black" : "bg-white/10 text-white"}`}
              >
                <Wand2 size={15} />
                {filter.name}
                {filterId !== "asli" && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[#E8A33D] ring-2 ring-[#101214]" />}
              </button>
              <button
                type="button"
                onClick={() => setAutoOn((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-montserrat text-[14px] font-medium cursor-pointer ${autoOn ? "bg-[#E8A33D] text-black" : "bg-white/10 text-white"}`}
              >
                <Zap size={15} />
                {T.auto}
              </button>
            </div>

            {showFilters && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterId(f.id)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 font-montserrat text-[14px] font-medium cursor-pointer ${filterId === f.id ? "bg-white text-black" : "bg-white/10 text-white"}`}
                  >
                    {f.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilterId(DEFAULT_FILTER_ID)}
                  className="shrink-0 rounded-full bg-white/10 px-3.5 py-1.5 font-montserrat text-[14px] text-white cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(1)}
                className={`rounded-full px-3 py-1.5 font-montserrat text-[12px] font-semibold cursor-pointer ${zoom === 1 ? "bg-white text-black" : "bg-white/10 text-white"}`}
              >
                1×
              </button>
              <button
                type="button"
                onClick={() => setZoom(2)}
                className={`rounded-full px-3 py-1.5 font-montserrat text-[12px] font-semibold cursor-pointer ${zoom === 2 ? "bg-white text-black" : "bg-white/10 text-white"}`}
              >
                2×
              </button>
              <input
                aria-label={T.zoom}
                type="range"
                min={1}
                max={2}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1 flex-1 accent-[#E8A33D]"
              />
              <ZoomIn size={16} className="text-white/70" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setStep(shotsTaken > 0 ? "review" : "access");
                }}
                className="flex items-center gap-1 font-montserrat text-[15px] font-medium text-white/80 cursor-pointer"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>
              <button
                type="button"
                aria-label="Ambil foto"
                disabled={camState !== "live" || countdown !== null}
                onClick={() => void takeShot(target)}
                className="grid size-16 place-items-center rounded-full bg-white text-black shadow-[0_0_0_6px_rgba(255,255,255,0.25)] transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {autoOn ? <Zap size={26} /> : <Aperture size={28} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = facing === "user" ? "environment" : "user";
                  setFacing(next);
                  void startCamera(next);
                }}
                className="flex items-center gap-1 font-montserrat text-[15px] font-medium text-white/80 cursor-pointer"
              >
                <SwitchCamera size={16} />
                {T.switchCamera}
              </button>
            </div>
            {autoOn && <p className="mt-2 text-center font-montserrat text-[14px] font-medium text-[#E8A33D]">{T.autoOn}</p>}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </main>
      )}

      {/* ---------- LANGKAH 2c: review pose ---------- */}
      {step === "review" && (
        <main className="flex-1 px-5 pt-8 pb-10 text-center">
          <h1 className={PB_TITLE}>{T.reviewTitle}</h1>
          <p className={`mx-auto mt-2 max-w-80 ${PB_BODY}`}>{T.reviewDesc}</p>
          <div className={`mt-6 grid gap-3 ${layout.shots > 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {shots.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => retakeOne(i)}
                className="group relative overflow-hidden rounded-2xl border border-(--pt-sage)/50 cursor-pointer"
              >
                {s ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s} alt={`Bidikan ${i + 1}`} className="aspect-4/3 w-full object-cover" />
                ) : (
                  <span className="grid aspect-4/3 w-full place-items-center bg-(--theme-surface) font-montserrat text-[16px] text-(--theme-muted)">
                    Belum ada foto
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-1.5 text-center font-montserrat text-[14px] font-medium text-white">
                  {T.retakeOne(i + 1)}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
            <PtButton friendly disabled={!shots.every(Boolean)} onClick={() => setStep("result")}>
              <Check size={14} />
              {T.toFrame}
            </PtButton>
            <PtButton friendly outline onClick={retakeAll}>
              <RotateCcw size={14} />
              {T.retakeAll}
            </PtButton>
          </div>
        </main>
      )}

      {/* ---------- LANGKAH 3: hasil ---------- */}
      {step === "result" && (
        <main className="flex-1 px-5 pt-8 pb-10">
          <h1 className={`text-center ${PB_TITLE}`}>{T.resultTitle}</h1>
          <p className={`mx-auto mt-2 max-w-80 text-center ${PB_BODY}`}>{T.resultDesc}</p>

          <div className="mx-auto mt-6 max-w-[340px]">
            <canvas ref={previewRef} className="mx-auto block max-h-[68vh] w-auto max-w-full rounded-2xl shadow-[0_16px_30px_-12px_rgba(63,74,44,0.45)]" />
            <p className="mt-3 text-center font-montserrat text-[14px] text-balance text-(--theme-muted)">{T.privacy}</p>
          </div>

          {/* tab pengaturan — menempel di atas saat discroll */}
          <div className="sticky top-0 z-10 -mx-5 mt-8 border-b border-(--pt-sage)/30 bg-white/95 px-5 py-3 backdrop-blur">
            <div className="flex justify-center gap-2">
            {(
              [
                ["frame", T.tabFrame],
                ["font", T.tabFont],
                ["shape", T.tabShape],
                ["filter", T.tabFilter],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 font-montserrat font-semibold text-[12px] uppercase tracking-[0.08em] cursor-pointer ${tab === id ? "bg-(--theme-text) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>

          {tab === "frame" && (
            <div className="mt-5">
              <p className="text-center font-montserrat font-semibold text-[11px] uppercase tracking-[0.08em] text-(--theme-muted)">
                {T.frameConcept}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {FRAME_CONCEPTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConcept(c)}
                    className={`rounded-full px-3.5 py-1.5 font-montserrat text-[15px] font-medium cursor-pointer ${concept === c ? "bg-(--theme-text) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {visibleFrames.map((f) => {
                  const isImage = "src" in f;
                  const active = isImage ? imageFrameId === f.id : !imageFrameId && frameId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        if (isImage) {
                          setImageFrameId(f.id);
                        } else {
                          setImageFrameId(null);
                          setFrameId(f.id);
                        }
                      }}
                      className={`overflow-hidden rounded-2xl border-2 text-left cursor-pointer ${active ? "border-(--theme-text)" : "border-transparent"}`}
                    >
                      <span
                        className={`relative block ${isImage ? "h-24" : "h-20"}`}
                        style={
                          isImage
                            ? { backgroundColor: "var(--theme-surface)" }
                            : { backgroundColor: (f as PhotoboothFrame).bg, border: `3px solid ${(f as PhotoboothFrame).border}` }
                        }
                      >
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={(f as ImageFrame).src} alt={f.name} className="mx-auto h-full w-auto max-w-full object-contain" />
                        ) : (
                          <span className="absolute inset-x-3 bottom-2 block text-center font-montserrat text-[13px] leading-tight" style={{ color: (f as PhotoboothFrame).ink }}>
                            {caption.names}
                          </span>
                        )}
                        {active && (
                          <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-(--theme-text) text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      <span className="block bg-white px-2 py-1.5 text-center font-montserrat text-[13px] font-medium leading-tight text-(--theme-text)">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "font" && (
            <div className="mt-5">
              <p className="text-center font-montserrat text-[15px] text-(--theme-muted)">{T.fontHint}</p>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontId(f.id)}
                    className={`rounded-2xl border-2 bg-white px-2 py-3 text-center cursor-pointer ${fontId === f.id ? "border-(--theme-text)" : "border-(--pt-sage)/40"}`}
                  >
                    <span className="flex h-9 items-center justify-center text-(--theme-text)" style={{ fontFamily: f.family, fontSize: f.samplePx, lineHeight: 1 }}>
                      Aa
                    </span>
                    <span className="mt-1.5 block font-montserrat text-[13px] text-(--theme-muted)">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "shape" && (
            <div className="mt-5">
              <p className="text-center font-montserrat text-[15px] text-(--theme-muted)">{T.shapeHint}</p>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {SHAPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShapeId(s.id)}
                    className={`rounded-2xl border-2 bg-white px-2 py-3 text-center cursor-pointer ${shapeId === s.id ? "border-(--theme-text)" : "border-(--pt-sage)/40"}`}
                  >
                    <span className={`mx-auto block h-14 w-11 ${s.id === "lembut" ? "rounded-xl" : ""} ${s.id === "polaroid" ? "border-[6px] border-b-[16px] border-white shadow" : ""} bg-(--theme-surface)`} />
                    <span className="mt-2 block font-montserrat font-semibold text-[12px] uppercase tracking-[0.08em] text-(--theme-text)">{s.name}</span>
                    <span className="mt-0.5 block min-h-8 font-montserrat text-[13px] leading-tight text-(--theme-muted) line-clamp-2">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "filter" && (
            <div className="mt-5">
              <p className="text-center font-montserrat text-[15px] text-(--theme-muted)">{T.filterHint}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterId(f.id)}
                    className={`w-full rounded-full px-2 py-2 font-montserrat text-[15px] font-medium cursor-pointer ${filterId === f.id ? "bg-(--theme-text) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
                  >
                    {f.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilterId(DEFAULT_FILTER_ID)}
                  className="w-full rounded-full bg-(--theme-surface) px-2 py-2 font-montserrat text-[15px] text-(--theme-text) cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <PtButton friendly onClick={() => void saveStrip()} className="w-full">
              <Download size={14} />
              {T.save}
            </PtButton>
            <div className="flex w-full gap-3">
              <PtButton friendly outline onClick={() => void shareStrip()} className="flex-1">
                <Share2 size={14} />
                {T.share}
              </PtButton>
              <PtButton friendly outline onClick={restart} className="flex-1">
                <RotateCcw size={14} />
                {T.restart}
              </PtButton>
            </div>
            <Link href="/" className="mt-1 font-montserrat text-[15px] font-medium text-(--theme-muted) underline underline-offset-4">
              {T.backToInvite}
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}

/* ============================== galeri lokal ============================== */

export function PhotoboothWall({ onClose }: { onClose: () => void }) {
  const [strips, setStrips] = useState<SavedStrip[]>([]);
  useEffect(() => {
    setStrips(loadMyStrips());
  }, []);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-montserrat text-[22px] font-semibold text-(--theme-muted)">{T.myPhotos}</h3>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-full bg-(--theme-surface) p-2 text-(--theme-text) cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <p className={`mt-1 ${PB_BODY}`}>{T.myPhotosNote}</p>
        {strips.length === 0 ? (
          <p className="mt-6 font-montserrat text-[16px] text-(--theme-muted)">{T.myPhotosEmpty}</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {strips.map((s) => (
              <li key={s.id} className="overflow-hidden rounded-2xl border border-(--pt-sage)/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt="Strip photobooth tersimpan" className="w-full object-cover" />
                <span className="flex items-center justify-center gap-3 py-2">
                  <a href={s.src} download={stripFileName()} className="flex items-center gap-1 font-montserrat text-[14px] text-(--theme-primary)">
                    <Download size={13} />
                    {T.download}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      removeMyStrip(s.id);
                      setStrips(loadMyStrips());
                    }}
                    className="flex items-center gap-1 font-montserrat text-[14px] text-red-700 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    {T.delete}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <PtButton friendly className="mt-5" onClick={onClose}>
          Tutup
        </PtButton>
      </div>
    </div>,
    document.body,
  );
}
