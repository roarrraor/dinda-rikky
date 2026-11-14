# kalabertemu.id/pesta-teh — rekonstruksi Next.js

Source aslinya hilang, jadi project ini **direkonstruksi dari mirror hasil build** (`kalabertemu_id.zip`):
HTML hasil SSR + JS chunk yang sudah di-compile (komponen `WeddingPestaTeh`, data demo, teks, palet, aset).

## Jalankan

```bash
npm install
npm run dev        # http://localhost:3000/pesta-teh
npm run build && npm start
```

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · motion (framer-motion) · dayjs · lucide-react.
Font diambil via `next/font/google` (butuh internet saat build).

- `/pesta-teh` → halaman demo (nama tamu: `/pesta-teh?to=Budi`)
- `/preview/pesta-teh` → redirect ke `/pesta-teh` (URL lama di mirror)

## Struktur

```
app/pesta-teh/page.tsx          halaman demo
app/api/{wishes/public,photobox,rsvp}   endpoint (stub)
components/pesta-teh/
  wedding-pesta-teh.tsx         komponen utama (susun semua section)
  phone-frame.tsx               bingkai HP + panel kiri (desktop)
  cover.tsx                     amplop (drag / ketuk untuk buka)
  sections-a.tsx                meja teh, burst foto, salam
  sections-b.tsx                mempelai, save the date, susunan acara
  sections-c.tsx                kisah, dress code, galeri, photobooth, RSVP, hadiah, penutup
  primitives.tsx                animasi & elemen dekoratif
lib/pesta-teh/data.ts           aset, palet, teks, DATA DEMO (Rizky & Amira)
public/assets/                  gambar dari mirror
```

Mau pakai untuk pasangan lain: ganti objek `DEMO_WEDDING` di `lib/pesta-teh/data.ts`
(atau kirim objek `WeddingData` dari database ke `<WeddingPestaTeh data={...} />`).

## Yang TIDAK ikut ter-capture di mirror (perlu kamu lengkapi)

| Item | Keadaan |
|---|---|
| `public/assets/bgm.mp3` | Di mirror cuma file kosong (49 byte). Taruh lagu aslimu di path ini. |
| Font | File `.woff2` di mirror cuma stub. Dipakai Google Fonts dengan nama yang sama dari CSS asli (Cormorant Garamond, Pinyon Script, Marcellus, Caveat, Great Vibes, Amiri, Manrope). |
| `gallery-3/4/5.webp` | Hanya `gallery-1` & `gallery-2` yang ada. Uncomment barisnya di `data.ts` kalau file-nya ketemu. |
| Photobooth (kamera + galeri foto tamu) | Kode kamera/upload tidak ada di mirror. Tombol hanya membuka dialog placeholder. `/api/photobox` = stub. |
| RSVP / ucapan | UI lengkap, tapi pada halaman demo form sengaja nonaktif (sama seperti aslinya). `/api/rsvp` = stub, belum menyimpan. `/api/wishes/public` mengembalikan snapshot ucapan dari mirror. |
| Konfirmasi tanda kasih (form transfer) | Aslinya hanya muncul untuk slug tertentu; tidak direkonstruksi. |
| `/themes`, `/order` | Halaman lain di situsmu, bukan bagian dari pesta-teh. Tombol "Katalog Tema" & "Order Sekarang" masih mengarah ke sana. |

## Catatan jujur soal akurasi

- Struktur, ukuran, posisi (cqw/%), warna, animasi, dan teks diambil langsung dari kode hasil build, jadi harusnya sangat mirip.
- Ikon aslinya Iconsax; di sini diganti lucide-react (mirip, tidak identik).
- Beberapa util kecil ditulis ulang karena kodenya ada di chunk yang tidak ikut ter-capture: sanitizer teks kisah, hook RSVP,
  footer credit di bawah halaman penutup, daftar kategori tamu. Semua ditandai komentar di kodenya.
- Sudah dicek: typecheck lolos, `next build` sukses, SSR `/pesta-teh` memuat teks & struktur yang sama dengan mirror.
  Belum dibandingkan visual pixel-per-pixel dengan situs live, jadi bandingkan di browser dulu.
