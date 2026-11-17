"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Aperture,
  Camera,
  Check,
  ChevronLeft,
  Columns2,
  Download,
  ImagePlus,
  LayoutGrid,
  Lightbulb,
  Lock,
  RectangleVertical,
  RotateCcw,
  Rows3,
  Share2,
  SwitchCamera,
  Trash2,
  UserRound,
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
import { DISCOVERED_FRAMES } from "@/lib/wedding/photobooth-assets.generated";

/** Semua frame gambar: hardcode + yang ketemu otomatis dari folder
 *  (Roar cukup upload file baru, lihat scripts/gen-photobooth-assets.mjs). */
const ALL_IMAGE_FRAMES: ImageFrame[] = [
  ...IMAGE_FRAMES,
  ...DISCOVERED_FRAMES.filter((d) => !IMAGE_FRAMES.some((h) => h.id === d.id)),
];

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
        document.fonts.load(`600 22px "Montserrat", sans-serif`),
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

/** Tinta footer yang kontras dengan warna latar (terang → tinta gelap, gelap → tinta terang). */
function contrastInk(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? "#3F4A2C" : "#FFFDF8";
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
  weight = "",
): void {
  let px = startPx;
  const font = (p: number) => `${weight ? `${weight} ` : ""}${p}px ${family}`;
  ctx.font = font(px);
  while (px > minPx && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = font(px);
  }
}

/** Apakah browser ini mendukung ctx.filter (Safari lama tidak)? Dicek sekali. */
let canvasFilterOK: boolean | null = null;
function canvasFilterSupported(): boolean {
  if (canvasFilterOK !== null) return canvasFilterOK;
  try {
    // Uji PERILAKU, bukan properti: gambar piksel merah dengan filter
    // grayscale lalu baca balik — kalau jadi abu-abu, ctx.filter jalan.
    // Cek properti saja tidak cukup: Safari lama menerima assignment
    // filter (jadi expando) tapi mengabaikannya saat menggambar, jadi
    // filter "lolos" tes tapi tidak pernah diterapkan ke preview.
    const src = document.createElement("canvas");
    src.width = 1;
    src.height = 1;
    const sctx = src.getContext("2d");
    const dst = document.createElement("canvas");
    dst.width = 1;
    dst.height = 1;
    const dctx = dst.getContext("2d");
    if (!sctx || !dctx) {
      canvasFilterOK = false;
      return false;
    }
    sctx.fillStyle = "#ff0000";
    sctx.fillRect(0, 0, 1, 1);
    (dctx as CanvasRenderingContext2D & { filter: string }).filter = "grayscale(1)";
    dctx.drawImage(src, 0, 0);
    const px = dctx.getImageData(0, 0, 1, 1).data;
    // merah (255,0,0) jadi abu-abu (~76,76,76) kalau filter jalan
    canvasFilterOK = px[0] === px[1] && px[1] === px[2] && px[0] < 200;
  } catch {
    canvasFilterOK = false;
  }
  return canvasFilterOK;
}

/** Putar hue satu piksel (RGB 0-255) sebanyak deg derajat. */
function hueRotate(r: number, g: number, b: number, deg: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + deg) % 360;
  if (h < 0) h += 360;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const conv = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [Math.round(conv(hk + 1 / 3) * 255), Math.round(conv(hk) * 255), Math.round(conv(hk - 1 / 3) * 255)];
}

/** Terapkan langkah filter ke data piksel (fallback kalau ctx.filter tidak ada).
 *  Uint8ClampedArray otomatis menjepit nilai ke 0-255 saat ditulis. */
function applyFilterOps(data: Uint8ClampedArray, ops: import("@/lib/wedding/photobooth").FilterOp[]): void {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    for (const [kind, v] of ops) {
      if (kind === "grayscale") {
        const grey = 0.299 * r + 0.587 * g + 0.114 * b;
        r += (grey - r) * v;
        g += (grey - g) * v;
        b += (grey - b) * v;
      } else if (kind === "sepia") {
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r += (sr - r) * v;
        g += (sg - g) * v;
        b += (sb - b) * v;
      } else if (kind === "saturate") {
        const grey = 0.299 * r + 0.587 * g + 0.114 * b;
        r = grey + (r - grey) * v;
        g = grey + (g - grey) * v;
        b = grey + (b - grey) * v;
      } else if (kind === "contrast") {
        r = (r - 128) * v + 128;
        g = (g - 128) * v + 128;
        b = (b - 128) * v + 128;
      } else if (kind === "brightness") {
        r *= v;
        g *= v;
        b *= v;
      } else if (kind === "hue-rotate") {
        [r, g, b] = hueRotate(r, g, b, v);
      }
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
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
        // Bayangan lembut + border putih tipis di sekeliling foto, biar foto
        // kelihatan "nempel" di frame (kaya cetakan foto), bukan ditempel
        // di atasnya. Polaroid sudah punya kartu putih + bayangan sendiri.
        if (shape !== "polaroid") {
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.28)";
          ctx.shadowBlur = 14;
          ctx.shadowOffsetY = 5;
          if (shape === "lembut") roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, 12);
          else {
            ctx.beginPath();
            ctx.rect(slot.x, slot.y, slot.w, slot.h);
          }
          ctx.fillStyle = "#FFFFFF";
          ctx.fill();
          ctx.restore();
        }
        ctx.save();
        if (shape === "lembut") roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, 12);
        else ctx.rect(slot.x, slot.y, slot.w, slot.h);
        ctx.clip();
        if (filter.ops.length > 0 && !canvasFilterSupported()) {
          // Safari lama: ctx.filter diabaikan diam-diam — filter piksel manual.
          const tmp = document.createElement("canvas");
          tmp.width = slot.w;
          tmp.height = slot.h;
          const tctx = tmp.getContext("2d");
          if (tctx) {
            tctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, slot.w, slot.h);
            const imageData = tctx.getImageData(0, 0, slot.w, slot.h);
            applyFilterOps(imageData.data, filter.ops);
            tctx.putImageData(imageData, 0, 0);
            ctx.drawImage(tmp, slot.x, slot.y);
          } else {
            ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, slot.x, slot.y, slot.w, slot.h);
          }
        } else {
          ctx.filter = filter.css === "none" ? "none" : filter.css;
          ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, slot.x, slot.y, slot.w, slot.h);
        }
        ctx.restore();
        if (shape !== "polaroid") {
          ctx.save();
          if (shape === "lembut") roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, 12);
          else {
            ctx.beginPath();
            ctx.rect(slot.x, slot.y, slot.w, slot.h);
          }
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
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

  // Footer — teks (nama + tanggal/hashtag) dipusatkan vertikal di zona
  // antara foto terbawah dan tepi bawah kanvas, biar tidak mepet bawah.
  if (!imageFrame || imageFrame.footer === "drawn") {
    const lastSlot = g.slots[g.slots.length - 1];
    const zoneCenter = (lastSlot.y + lastSlot.h + g.h) / 2;
    // Jarak antar baris (tengah teks ke tengah teks) + pembatas ke nama.
    const NAME_DATE_GAP = 58;
    const DIVIDER_GAP = 54;
    // Titik tengah blok (pembatas sampai bawah tanggal) dipusatkan di tengah
    // zona, dengan koreksi ke atas karena baseline "middle" canvas menaruh
    // glyph Playfair/Montserrat sedikit lebih rendah dari tengah visualnya
    // (terukur live: footer masih ~20px terlalu rendah di kanvas).
    const nameY = zoneCenter - 27;
    const dateY = nameY + NAME_DATE_GAP;
    const dividerY = nameY - DIVIDER_GAP;
    // Warna teks footer harus kontras dengan latarnya. Frame gambar latar
    // (background) menutup warna frame warna di bawahnya, jadi tintanya
    // dihitung dari warna footerFade-nya — bukan dari frame warna terakhir
    // yang dipilih (itu yang bikin teks terang "nempel" pas pindah dari
    // frame gelap ke Botanical). Frame overlay tetap pakai tinta frame warna.
    const isBgFrame = imageFrame?.layer === "background";
    const footerInk = isBgFrame ? contrastInk(imageFrame.footerFade ?? "#F3EADB") : frame.ink;
    const footerAccent = isBgFrame ? footerInk : frame.accent;
    ctx.strokeStyle = footerAccent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.w / 2 - 90, dividerY);
    ctx.lineTo(g.w / 2 + 90, dividerY);
    ctx.stroke();
    ctx.fillStyle = footerInk;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const scriptLike = font.id === "dancing" || font.id === "caveat";
    fitFont(ctx, caption.names, font.family, scriptLike ? 72 : 46, g.w - 120, 32);
    ctx.fillText(caption.names, g.w / 2, nameY);
    const sub = caption.tag ? `${caption.date}  ·  ${caption.tag}` : caption.date;
    try {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "2px";
    } catch {
      /* abaikan */
    }
    // Tanggal + hashtag pakai Montserrat (sans, bersih) — bukan serif
    // ber-spasi lebar yang terkesan alay.
    fitFont(ctx, sub, `"Montserrat", sans-serif`, 22, g.w - 120, 18, "600");
    ctx.fillText(sub, g.w / 2, dateY);
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

const STEP_NUM: Record<Step, number> = { layout: 1, access: 2, camera: 2, review: 2, result: 3 };

/** Tipografi UI studio (desain baru Roar, 2026-11-18): judul serif Playfair
 *  tebal warna hijau tua, isi Montserrat biasa. Warna brand tetap sama. */
const PB_BODY = "font-montserrat text-[15px] leading-relaxed text-balance text-(--theme-muted)";
const PB_KICKER = "font-montserrat text-[12px] font-semibold uppercase tracking-[0.14em] text-(--theme-primary)";
const PB_TITLE = "font-playfair text-[32px] font-bold leading-tight text-(--theme-text)";
/** Latar krem desain baru (bukan putih). */
const PB_CREAM = "bg-[#FAF6EE]";
/** Ikon tata letak per id (dipakai kartu langkah 1). */
const LAYOUT_ICONS: Record<PhotoboothLayout["id"], typeof Rows3> = {
  strip: Rows3,
  grid: LayoutGrid,
  portrait: RectangleVertical,
  duet: Columns2,
};

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
  const imageFrame = imageFrameId ? (ALL_IMAGE_FRAMES.find((f) => f.id === imageFrameId) ?? null) : null;
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
    ...ALL_IMAGE_FRAMES.filter((f) => f.layouts.includes(layout.id)),
  ].filter((f) => concept === "Semua" || f.concept === concept);

  /** Foto contoh buat pratinjau lingkaran filter (foto pertama yang ada). */
  const sampleShot = shots.find(Boolean) ?? null;

  // Tombol kembali di bar atas (desain baru): mundur satu langkah.
  const goBack = () => {
    if (step === "layout") return;
    if (step === "access") setStep("layout");
    else if (step === "camera") {
      stopCamera();
      setStep(shotsTaken > 0 ? "review" : "access");
    } else if (step === "review") {
      setStep("camera");
      if (camState !== "live") void startCamera(facing);
    } else setStep("review");
  };

  return (
    <div className={`mx-auto flex min-h-dvh w-full max-w-[480px] flex-col ${PB_CREAM} shadow-[0_0_60px_rgba(0,0,0,0.10)]`}>
      {/* bar atas desain baru: tombol kembali bulat + progres tersegmen + N/3 */}
      <header className="flex items-center gap-3 px-5 pt-5 pb-2">
        {step === "layout" ? (
          <Link
            href="/"
            aria-label="Kembali ke undangan"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-(--theme-text) shadow-[0_2px_10px_rgba(63,74,44,0.12)]"
          >
            <ChevronLeft size={20} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={goBack}
            aria-label="Kembali"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-(--theme-text) shadow-[0_2px_10px_rgba(63,74,44,0.12)]"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 flex-1 rounded-full ${n <= STEP_NUM[step] ? "bg-(--theme-primary)" : "bg-[#E4DFD3]"}`}
            />
          ))}
        </div>
        <span className="font-montserrat text-[14px] font-semibold text-(--theme-text)">
          {STEP_NUM[step]}/3
        </span>
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
        <main className="flex-1 px-5 pt-4 pb-10 text-center">
          <p className={PB_KICKER}>Photobooth · Langkah 1</p>
          <h1 className={`mt-1 ${PB_TITLE}`}>Abadikan momen ini</h1>
          <p className={`mx-auto mt-2 max-w-80 ${PB_BODY}`}>{T.step1Desc}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            {LAYOUTS.map((l) => {
              const Icon = LAYOUT_ICONS[l.id];
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => pickLayout(l)}
                  className="relative rounded-3xl bg-white p-5 text-left shadow-[0_6px_20px_-8px_rgba(63,74,44,0.25)] transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {l.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E8A33D] px-2.5 py-0.5 font-montserrat font-semibold text-[10px] uppercase tracking-[0.08em] whitespace-nowrap text-white">
                      Populer
                    </span>
                  )}
                  <span className="grid size-14 place-items-center rounded-2xl bg-(--theme-surface) text-(--theme-primary)">
                    <Icon size={28} />
                  </span>
                  <span className="mt-3 block font-montserrat text-[17px] font-semibold text-(--theme-text)">{l.name}</span>
                  <span className="mt-1 block font-montserrat text-[14px] leading-relaxed text-(--theme-muted)">{l.desc}</span>
                  <span className="mt-3 block font-montserrat font-semibold text-[11px] uppercase tracking-[0.08em] text-(--theme-primary)">
                    {l.shots} foto · {l.orientation}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mx-auto mt-8 max-w-80 space-y-3 text-left">
            <p className="flex items-start gap-2.5 font-montserrat text-[14px] leading-relaxed text-(--theme-muted)">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#E8A33D]" />
              {T.tip}
            </p>
            <p className="flex items-start gap-2.5 font-montserrat text-[14px] leading-relaxed text-(--theme-muted)">
              <Lock size={15} className="mt-0.5 shrink-0 text-(--theme-muted)" />
              {T.privacy}
            </p>
          </div>
        </main>
      )}

      {/* ---------- LANGKAH 2a: akses kamera ---------- */}
      {step === "access" && (
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="grid size-44 place-items-center rounded-full bg-(--theme-surface)">
            <span className="grid size-28 place-items-center rounded-full bg-white text-(--theme-primary) shadow-[0_4px_16px_rgba(63,74,44,0.12)]">
              <Camera size={40} />
            </span>
          </span>
          <h1 className={`mt-8 ${PB_TITLE}`}>{T.cameraTitle}</h1>
          <p className={`mt-2 max-w-72 ${PB_BODY}`}>{T.cameraDesc}</p>
          <div className="mt-8 flex w-full max-w-80 flex-col gap-3">
            <PtButton friendly className="w-full"
              onClick={() => {
                setStep("camera");
                void startCamera(facing);
              }}
            >
              <Camera size={16} />
              {T.toCamera}
            </PtButton>
            <PtButton friendly outline className="w-full" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} />
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
        <main className="flex flex-1 flex-col px-5 pt-2 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {shots.map((s, i) => (
                <span
                  key={i}
                  className={`size-2.5 rounded-full ${s ? "bg-(--theme-primary)" : i === target ? "bg-(--theme-text)" : "bg-[#D8D2C4]"}`}
                />
              ))}
            </div>
            <p className="font-montserrat text-[14px] font-medium text-(--theme-muted)">{T.shotsTaken(shotsTaken, layout.shots)}</p>
          </div>

          <div className="relative mt-3 flex-1 overflow-hidden rounded-3xl bg-[#101214] shadow-[0_10px_28px_-12px_rgba(63,74,44,0.4)]">
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
              <div className={`absolute inset-0 grid place-items-center px-6 py-10 text-center ${PB_CREAM}`}>
                {camState === "denied" ? (
                  <div className="flex flex-col items-center">
                    <span className="grid size-28 place-items-center rounded-full bg-(--theme-surface)">
                      <span className="grid size-18 place-items-center rounded-full bg-white text-(--theme-primary) shadow-[0_4px_16px_rgba(63,74,44,0.12)]">
                        <Camera size={32} />
                      </span>
                    </span>
                    <p className="mt-5 font-playfair text-[26px] font-bold leading-tight text-(--theme-text)">{T.cameraDenied}</p>
                    <p className="mt-2 max-w-72 font-montserrat text-[15px] leading-relaxed text-(--theme-muted)">{T.cameraDeniedDesc}</p>
                    <PtButton friendly className="mt-5" onClick={() => fileRef.current?.click()}>
                      <ImagePlus size={16} />
                      {T.fromGallery}
                    </PtButton>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="grid size-28 place-items-center rounded-full bg-(--theme-surface)">
                      <span className="grid size-18 place-items-center rounded-full bg-white text-(--theme-primary) shadow-[0_4px_16px_rgba(63,74,44,0.12)]">
                        <Camera size={32} />
                      </span>
                    </span>
                    <p className="mt-5 font-playfair text-[26px] font-bold leading-tight text-(--theme-text)">{T.waitingCamera}</p>
                    <p className="mt-2 max-w-72 font-montserrat text-[15px] leading-relaxed text-(--theme-muted)">{T.waitingCameraDesc}</p>
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
                <span className="font-montserrat text-[13px] font-medium text-white">{T.lastShot}</span>
              </div>
            )}
          </div>

          {/* kontrol kamera */}
          <div className="pt-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setGridOn((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 font-montserrat text-[14px] font-medium cursor-pointer ${gridOn ? "bg-(--theme-primary) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
              >
                <LayoutGrid size={15} />
                {T.grid}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-2.5 font-montserrat text-[14px] font-medium cursor-pointer ${showFilters ? "bg-(--theme-primary) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
              >
                <Wand2 size={15} />
                {filter.name}
                {filterId !== "asli" && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[#E8A33D] ring-2 ring-[#FAF6EE]" />}
              </button>
              <button
                type="button"
                onClick={() => setAutoOn((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-2.5 font-montserrat text-[14px] font-medium cursor-pointer ${autoOn ? "bg-(--theme-primary) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
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
                    className={`shrink-0 rounded-full px-3.5 py-1.5 font-montserrat text-[14px] font-medium cursor-pointer ${filterId === f.id ? "bg-(--theme-primary) text-white" : "bg-(--theme-surface) text-(--theme-text)"}`}
                  >
                    {f.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFilterId(DEFAULT_FILTER_ID)}
                  className="shrink-0 rounded-full bg-(--theme-surface) px-3.5 py-1.5 font-montserrat text-[14px] text-(--theme-text) cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(1)}
                className={`rounded-full px-3 py-1.5 font-montserrat text-[12px] font-semibold cursor-pointer ${zoom === 1 ? "bg-(--theme-primary) text-white" : "bg-white text-(--theme-text)"}`}
              >
                1×
              </button>
              <button
                type="button"
                onClick={() => setZoom(2)}
                className={`rounded-full px-3 py-1.5 font-montserrat text-[12px] font-semibold cursor-pointer ${zoom === 2 ? "bg-(--theme-primary) text-white" : "bg-white text-(--theme-text)"}`}
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
                className="h-1 flex-1 accent-(--theme-primary)"
              />
              <ZoomIn size={16} className="text-(--theme-muted)" />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setStep(shotsTaken > 0 ? "review" : "access");
                }}
                className="flex items-center gap-1 font-montserrat text-[15px] font-medium text-(--theme-text) cursor-pointer"
              >
                <ChevronLeft size={16} />
                Kembali
              </button>
              <button
                type="button"
                aria-label="Ambil foto"
                disabled={camState !== "live" || countdown !== null}
                onClick={() => void takeShot(target)}
                className="grid size-16 place-items-center rounded-full bg-(--theme-primary) text-white shadow-[0_0_0_6px_rgba(111,148,64,0.25)] transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
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
                className="flex items-center gap-1 font-montserrat text-[15px] font-medium text-(--theme-text) cursor-pointer"
              >
                <SwitchCamera size={16} />
                {T.switchCamera}
              </button>
            </div>
            {autoOn && <p className="mt-2 text-center font-montserrat text-[14px] font-medium text-(--theme-primary)">{T.autoOn}</p>}
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
        <main className="flex-1 px-5 pt-4 pb-10 text-center">
          <p className={PB_KICKER}>Ambil foto · Langkah 2</p>
          <h1 className={`mt-1 ${PB_TITLE}`}>{T.reviewTitle}</h1>
          <p className={`mx-auto mt-2 max-w-80 ${PB_BODY}`}>{T.reviewDesc}</p>
          <div className={`mt-8 grid gap-4 ${layout.shots > 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {shots.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => retakeOne(i)}
                aria-label={T.retakeOne(i + 1)}
                className="group relative cursor-pointer text-left"
              >
                <span className="block overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_-8px_rgba(63,74,44,0.25)]">
                  {s ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s}
                      alt={`Bidikan ${i + 1}`}
                      className="aspect-4/3 w-full object-cover"
                      style={{ filter: filter.css === "none" ? undefined : filter.css }}
                    />
                  ) : (
                    <span className="grid aspect-4/3 w-full place-items-center bg-(--theme-surface)">
                      <UserRound size={44} className="text-(--theme-accent)" />
                    </span>
                  )}
                </span>
                <span className="absolute -top-2.5 -left-2.5 grid size-8 place-items-center rounded-full bg-(--theme-text) font-montserrat text-[15px] font-semibold text-white shadow">
                  {i + 1}
                </span>
                <span className="absolute -right-2.5 -bottom-2.5 grid size-10 place-items-center rounded-full bg-white text-(--theme-primary) shadow-[0_4px_14px_rgba(63,74,44,0.25)]">
                  <RotateCcw size={18} />
                </span>
              </button>
            ))}
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-80 flex-col items-center gap-3">
            <PtButton friendly disabled={!shots.every(Boolean)} onClick={() => setStep("result")} className="w-full">
              <Check size={16} />
              {T.toFrame}
            </PtButton>
            <PtButton friendly outline onClick={retakeAll} className="w-full">
              <RotateCcw size={16} />
              {T.retakeAll}
            </PtButton>
          </div>
        </main>
      )}

      {/* ---------- LANGKAH 3: hasil ---------- */}
      {step === "result" && (
        <main className="flex-1 px-5 pt-4 pb-10">
          <p className={`text-center ${PB_KICKER}`}>Buat hasil · Langkah 3</p>
          <h1 className={`mt-1 text-center ${PB_TITLE}`}>{T.resultTitle}</h1>
          <p className={`mx-auto mt-2 max-w-80 text-center ${PB_BODY}`}>{T.resultDesc}</p>

          <div className="mx-auto mt-6 max-w-[340px] rounded-3xl bg-white p-3 shadow-[0_16px_30px_-12px_rgba(63,74,44,0.35)]">
            <canvas ref={previewRef} className="mx-auto block max-h-[62vh] w-auto max-w-full" />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-montserrat text-[14px] text-(--theme-muted)">
            <Lock size={13} />
            {T.privacyShort}
          </p>

          {/* tab pengaturan — menempel di atas saat discroll */}
          <div className="sticky top-0 z-10 -mx-5 mt-8 border-b border-(--pt-sage)/30 bg-[#FAF6EE]/95 px-5 py-3 backdrop-blur">
            <div className="flex justify-center gap-6">
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
                className={`relative pb-1.5 font-montserrat font-semibold text-[13px] uppercase tracking-[0.08em] cursor-pointer ${tab === id ? "text-(--theme-text)" : "text-(--theme-muted)"}`}
              >
                {label}
                {tab === id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-(--theme-primary)" />}
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
              <div className="pb-scroll -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pb-2">
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
                      className="w-24 shrink-0 cursor-pointer"
                    >
                      <span
                        className={`relative block h-20 overflow-hidden rounded-2xl border-2 ${active ? "border-(--theme-text)" : "border-transparent"}`}
                        style={
                          isImage
                            ? { backgroundColor: "var(--theme-surface)" }
                            : { backgroundColor: (f as PhotoboothFrame).bg, border: `3px solid ${(f as PhotoboothFrame).border}` }
                        }
                      >
                        {isImage ? (
                          <span
                            aria-hidden
                            className="block h-full w-full"
                            style={{
                              backgroundImage: `url(${(f as ImageFrame).src})`,
                              backgroundSize: "cover",
                              backgroundPosition: "top center",
                              backgroundRepeat: "no-repeat",
                            }}
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-montserrat text-[13px] font-medium leading-tight" style={{ color: (f as PhotoboothFrame).ink }}>
                            {f.name}
                          </span>
                        )}
                        {isImage && (
                          <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-montserrat text-[13px] font-medium leading-tight text-(--theme-text)">
                            {f.name}
                          </span>
                        )}
                        {active && (
                          <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-(--theme-text) text-white">
                            <Check size={12} />
                          </span>
                        )}
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
              <div className="pb-scroll -mx-5 mt-4 flex gap-3 overflow-x-auto px-5 pt-2 pb-2">
                {FILTERS.map((f) => {
                  const active = filterId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterId(f.id)}
                      className="w-20 shrink-0 cursor-pointer text-center"
                    >
                      <span className={`relative mx-auto block size-16 overflow-hidden rounded-full ${active ? "ring-2 ring-(--theme-text) ring-offset-2 ring-offset-[#FAF6EE]" : "ring-1 ring-(--pt-sage)/50"}`}>
                        {sampleShot ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={sampleShot}
                            alt={f.name}
                            className="h-full w-full object-cover"
                            style={{ filter: f.css === "none" ? undefined : f.css }}
                          />
                        ) : (
                          <span className="block h-full w-full bg-(--theme-surface)" />
                        )}
                        {active && (
                          <span className="absolute top-0.5 right-0.5 grid size-5 place-items-center rounded-full bg-(--theme-text) text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block font-montserrat text-[13px] font-medium leading-tight text-(--theme-text)">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setFilterId(DEFAULT_FILTER_ID)}
                  className="w-20 shrink-0 cursor-pointer text-center"
                >
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-(--theme-surface) text-(--theme-primary) ring-1 ring-(--pt-sage)/50">
                    <RotateCcw size={22} />
                  </span>
                  <span className="mt-1.5 block font-montserrat text-[13px] font-medium leading-tight text-(--theme-text)">
                    Reset
                  </span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex w-full items-center gap-3">
              <PtButton friendly onClick={() => void saveStrip()} className="flex-1">
                <Download size={16} />
                {T.save}
              </PtButton>
              <button
                type="button"
                onClick={() => void shareStrip()}
                aria-label={T.share}
                className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-(--theme-primary) shadow-[0_4px_14px_rgba(63,74,44,0.20)]"
              >
                <Share2 size={20} />
              </button>
              <button
                type="button"
                onClick={restart}
                aria-label={T.restart}
                className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-(--theme-primary) shadow-[0_4px_14px_rgba(63,74,44,0.20)]"
              >
                <RotateCcw size={20} />
              </button>
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
