# Undangan Pernikahan Digital — Dinda & Rikky

Website undangan pernikahan Dinda Intan Pratiwi & Rikky Arisendi.
Satu halaman utama: amplop pembuka, meja teh, salam, mempelai, save the date,
susunan acara, kisah, dress code, galeri, photobooth, RSVP & doa, tanda kasih,
dan penutup.

## Jalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · motion (framer-motion) ·
dayjs · lucide-react. Font diambil via `next/font/google` (butuh internet saat build).

Nama tamu di cover bisa dikirim lewat query: `/?to=Budi`.

## Struktur

```
app/page.tsx                    halaman utama (undangan)
app/layout.tsx                  metadata & font
app/api/{wishes/public,photobox,rsvp}   endpoint (stub, lihat catatan di bawah)
components/pesta-teh/
  wedding-pesta-teh.tsx         komponen utama (susun semua section)
  cover.tsx                     amplop (drag / ketuk untuk buka)
  sections-a.tsx                meja teh, burst foto, salam
  sections-b.tsx                mempelai, save the date, susunan acara
  sections-c.tsx                kisah, dress code, galeri, photobooth, RSVP, hadiah, penutup
  primitives.tsx                animasi & elemen dekoratif
lib/pesta-teh/data.ts           aset, palet, teks, data pernikahan
public/assets/                  gambar undangan
```

## Ganti data pernikahan

Semua data ada di `lib/pesta-teh/data.ts` (objek `WEDDING`):

- Nama mempelai, nama orang tua, urutan anak, foto mempelai
- Tanggal, tempat akad & resepsi, alamat, link Google Maps
- Susunan acara (`rundown`), kisah (`story`), foto galeri (`photos`)
- Rekening hadiah (`gifts`), foto QRIS (`qrisPhoto`), alamat kirim kado
- Hashtag, dress code, musik (`musicUrl`)

Foto: taruh file di `public/assets/illustrations/` atau `public/assets/pesta-teh/`,
lalu ubah path-nya di `data.ts`.

## Yang masih perlu dilengkapi

| Item | Keadaan |
|---|---|
| `public/assets/bgm.mp3` | Masih file kosong. Taruh lagu pernikahan di path ini. |
| Tanggal, tempat, orang tua, rekening | Masih data contoh — ganti dengan data asli di `data.ts`. |
| RSVP & ucapan (`/api/rsvp`, `/api/wishes/public`) | Tersimpan di Supabase (lihat "Database & Admin" di bawah). Tanpa env yang dikonfigurasi, form menampilkan "Database belum dikonfigurasi" dan tidak menyimpan apa pun. |
| Photobox (`/api/photobox`) | Masih stub: belum menyimpan foto tamu. |
| Foto mempelai & galeri | Masih gambar ilustrasi contoh — ganti dengan foto asli. |

## Database & Admin (Supabase)

RSVP, ucapan, dan data undangan disimpan di Supabase (Postgres, free tier).
Tanpa konfigurasi di bawah, form RSVP/ucapan akan menampilkan pesan
"Database belum dikonfigurasi" dan ucapan tidak tersimpan.

### 1. Buat project Supabase gratis

Buat project di https://supabase.com/dashboard, lalu catat:
- **Project URL** (`SUPABASE_URL`)
- **publishable key** (`SUPABASE_ANON_KEY`) — ada di Project Settings → API.
  Key ini cukup supaya form RSVP & list ucapan berfungsi.
- **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`) — ada di
  Project Settings → API. OPSIONAL, hanya dipakai halaman `/admin`.
  Kunci ini rahasia, hanya dipakai server-side.

### 2. Jalankan migrasi

Di Supabase Dashboard → SQL Editor, jalankan isi file
`supabase/migrations/0001_wedding.sql` (membuat tabel `wishes`, `rsvps`,
dan `wedding_settings` dengan Row Level Security + policy untuk tamu:
tamu boleh membaca ucapan, mengirim ucapan/RSVP, dan membaca data
undangan — tapi tidak bisa mengubah atau menghapus apa pun).

### 3. Isi environment

```bash
cp .env.example .env.local
```

Isi `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `ADMIN_PASSWORD`
(password untuk masuk ke halaman admin). `SUPABASE_SERVICE_ROLE_KEY`
hanya perlu diisi kalau mau memakai semua fitur `/admin`. Restart
`npm run dev` setelah mengubah `.env.local`. Di Vercel, isi env var yang
sama di Settings → Environment Variables lalu redeploy.

### 4. (Opsional) Seed ucapan contoh

Jalankan isi `supabase/seed-wishes.sql` di SQL Editor untuk mengisi tabel
`wishes` dengan 13 ucapan contoh dari `lib/pesta-teh/wishes.json`.

### 5. Buka halaman admin

Buka `/admin` dan masuk dengan password dari `ADMIN_PASSWORD`. Di sana bisa:
- **Data Undangan** — ubah nama mempelai, tanggal, tempat, orang tua,
  hashtag, dress code, alamat kado, dll. Tersimpan di tabel
  `wedding_settings` dan langsung dipakai halaman utama.
- **Ucapan** — lihat ucapan terbaru dan hapus yang tidak diinginkan.
- **RSVP** — lihat daftar konfirmasi kehadiran tamu (read-only).

### Stiker ucapan

Tamu bisa memilih satu stiker saat mengirim ucapan (opsional). Stiker
muncul di tengah kartu ucapan, di bawah teks.

- File gambar: `public/assets/stickers/` (PNG transparan, 512x512).
  Set awal: `s1-hati.png`, `s2-cincin.png`, `s3-kue.png`, `s4-teko.png`.
- Daftar opsi: `lib/pesta-teh/stickers.ts` (`STICKERS`). Untuk menambah
  opsi baru, taruh file PNG-nya di folder itu lalu tambah satu entri
  di `STICKERS` — tidak perlu migrasi.
- Kolom database: `wishes.sticker` menyimpan key stiker (mis. `"hati"`).
  Jalankan `supabase/migrations/0002_wish_sticker.sql` di SQL Editor
  sekali saja. Kalau migrasi ini belum dijalankan, ucapan tetap
  tersimpan dan tampil — hanya tanpa stiker.
- Satu browser hanya bisa mengirim satu ucapan (ditandai di
  `localStorage` dengan key `dinda-rikky-wish-sent:<slug>`). List ucapan
  menampilkan maksimal 200 ucapan terbaru di dalam kotak yang bisa
  di-scroll (kira-kira 5 kartu terlihat sekaligus).
