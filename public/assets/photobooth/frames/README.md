# Frame Photobooth — cara nambah frame sendiri

Folder ini tempat file frame gambar (PNG / SVG transparan). Frame warna
(tanpa file) cukup ditambah di `lib/wedding/photobooth.ts` (`FRAMES`).

## 1. Frame warna (paling gampang, tanpa file)

Tambah satu baris ke `FRAMES` di `lib/wedding/photobooth.ts`:

```ts
{ id: "nama-baru", name: "Nama Baru", concept: "Klasik", bg: "#FFFDF8", ink: "#3F4A2C", accent: "#EBA7B1", border: "#6F9440" },
```

- `concept`: `Klasik`, `Taman`, atau `Modern` (buat chip filter).
- `bg`: warna latar strip. `ink`: warna teks footer. `accent`: warna garis
  pemisah. `border`: warna garis tepi strip.

## 2. Frame gambar (PNG / SVG / WebP)

Ada dua jenis — pilih salah satu saat mendaftarkan di `IMAGE_FRAMES`:

### 2a. Background (paling gampang, ala inveet) — `layer: "background"`

Gambar full digambar DI BAWAH foto (cover-fit ke kanvas), jadi gambar
boleh utuh tanpa bolong — foto menutupi bagian tengahnya sendiri.
Satu file bisa dipakai untuk SEMUA layout (cover-fit menyesuaikan
rasio tiap layout otomatis).

```ts
{
  id: "botanical",
  name: "Botanical",
  concept: "Taman",
  src: "/assets/photobooth/frames/botanical.webp",
  layouts: ["strip", "grid", "portrait", "duet"],
  footer: "drawn",
  layer: "background",
  footerFade: "#F3EADB",
},
```

Aturan gambarnya:

- **Tengah polos** — bagian tempat foto berada sebaiknya polos / motif
  halus, supaya tepi foto terlihat bersih.
- **Bawah kosong + `footerFade`** — isi `footerFade` dengan warna krem
  gambar (sampel dari tengah gambar). Bagian bawah strip di-fade ke
  warna itu supaya teks nama + tanggal terbaca.
- `footer: "drawn"` — teks nama + tanggal tetap digambar kode di bawah.
  `footer: "none"` — frame sudah membawa teks footer sendiri, kode
  tidak menggambar teks lagi.

### 2b. Overlay — `layer: "overlay"` (bawaan kalau `layer` tidak diisi)

Gambar digambar DI ATAS foto, jadi bagian tengah tempat foto berada
harus TRANSPARAN (alpha 0), kalau tidak fotonya ketutup. Satu file
hanya untuk SATU layout (ukuran harus = ukuran output layout itu):

```ts
{
  id: "bungaku",
  name: "Bungaku",
  concept: "Taman",
  src: "/assets/photobooth/frames/bungaku-strip.png",
  layouts: ["strip"],
  footer: "drawn",
  layer: "overlay",
},
```

Ukuran output tiap layout:

- `strip` (3 foto): **900 × 2145 px**
- `grid` (4 foto): **1080 × 1272 px**
- `portrait` (1 foto): **900 × 1293 px**
- `duet` (2 foto): **1200 × 693 px**

Kalau file-nya PNG / WebP (bukan SVG), upload lewat browser ke GitHub
(push via connector hanya bisa file teks, file biner akan rusak).

## Contoh

`renda-teh-strip.svg` di folder ini adalah contoh frame gambar untuk
layout `strip`: garis tepi ganda + bunga di empat sudut, tengahnya
transparan. Duplikat file itu, ubah warna / hiasannya, daftarkan dengan
id baru — selesai.
