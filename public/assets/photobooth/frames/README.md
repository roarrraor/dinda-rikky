# Frame Photobooth — cara nambah frame sendiri

## Cara gampang: tinggal upload, tanpa ubah kode

Taruh file gambar di folder ini, lalu deploy ulang (push ke GitHub) —
frame baru langsung muncul di tab Bingkai. Tidak perlu edit file apa pun.

- **Nama file = nama frame.** `daun-teh.webp` jadi frame "Daun Teh".
- **Jenis bawaan: background** (ala inveet) — gambar full digambar di
  bawah foto, satu file bisa dipakai untuk SEMUA layout.
- **Konsep (chip filter):** tambah `--klasik`, `--taman`, atau `--modern`
  di nama file. Tanpa itu, konsepnya Taman.
  Contoh: `daun-teh--klasik.webp` → "Daun Teh", konsep Klasik.
- **Overlay (bukan background):** tambah `--overlay`. Gambar overlay
  digambar DI ATAS foto, jadi bagian tengahnya harus TRANSPARAN.
  Tambah juga layout-nya, contoh: `renda--overlay--strip.svg`
  (hanya strip). Tanpa itu, overlay hanya untuk strip.
- **Warna fade footer:** tambah `--fade-RRGGBB`, contoh
  `malam--fade-232323.webp` (fade ke #232323). Tanpa itu, fade-nya krem
  `#F3EADB`.

Aturan gambar background:

- **Tengah polos** — bagian tempat foto berada sebaiknya polos / motif
  halus, supaya tepi foto terlihat bersih.
- **Bawah kosong** — bagian bawah strip di-fade ke warna krem supaya
  teks nama + tanggal terbaca.

## Frame warna (tanpa file)

Tambah satu baris ke `FRAMES` di `lib/wedding/photobooth.ts`:

```ts
{ id: "nama-baru", name: "Nama Baru", concept: "Klasik", bg: "#FFFDF8", ink: "#3F4A2C", accent: "#EBA7B1", border: "#6F9440" },
```

- `concept`: `Klasik`, `Taman`, atau `Modern` (buat chip filter).
- `bg`: warna latar strip. `ink`: warna teks footer. `accent`: warna garis
  pemisah. `border`: warna garis tepi strip.

## Jenis frame gambar (referensi)

### Background — `layer: "background"` (bawaan)

Gambar full digambar DI BAWAH foto (cover-fit ke kanvas), jadi gambar
boleh utuh tanpa bolong — foto menutupi bagian tengahnya sendiri.
Satu file bisa dipakai untuk SEMUA layout (cover-fit menyesuaikan
rasio tiap layout otomatis). `footer: "drawn"` — teks nama + tanggal
tetap digambar kode di bawah. `footer: "none"` — frame sudah membawa
teks footer sendiri, kode tidak menggambar teks lagi.

### Overlay — `layer: "overlay"`

Gambar digambar DI ATAS foto, jadi bagian tengah tempat foto berada
harus TRANSPARAN (alpha 0), kalau tidak fotonya ketutup. Satu file
hanya untuk SATU layout (ukuran harus = ukuran output layout itu):

- `strip` (3 foto): **900 × 2145 px**
- `grid` (4 foto): **1080 × 1272 px**
- `portrait` (1 foto): **900 × 1293 px**
- `duet` (2 foto): **1200 × 693 px**

## Upload file biner

Kalau file-nya PNG / WebP (bukan SVG), upload lewat browser ke GitHub
(push via connector hanya bisa file teks, file biner akan rusak).

## Contoh

`renda-teh-strip.svg` di folder ini adalah contoh frame gambar untuk
layout `strip`: garis tepi ganda + bunga di empat sudut, tengahnya
transparan.
