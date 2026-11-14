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
| RSVP & ucapan (`/api/rsvp`, `/api/wishes/public`) | Masih stub: tidak menyimpan apa pun. Sambungkan ke database (mis. Supabase/Postgres) supaya ucapan tamu tersimpan dan tampil. Ucapan yang tampil sekarang adalah contoh dari `lib/pesta-teh/wishes.json`. |
| Photobox (`/api/photobox`) | Masih stub: belum menyimpan foto tamu. |
| Foto mempelai & galeri | Masih gambar ilustrasi contoh — ganti dengan foto asli. |
