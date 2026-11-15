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

## 2. Frame gambar (PNG / SVG)

1. Taruh filenya di folder ini, misal `bungaku-strip.png`.
2. Daftarkan di `IMAGE_FRAMES` di `lib/wedding/photobooth.ts`:

```ts
{
  id: "bungaku",
  name: "Bungaku",
  concept: "Taman",
  src: "/assets/photobooth/frames/bungaku-strip.png",
  layouts: ["strip"],
  footer: "drawn",
},
```

Aturan gambarnya:

- **Transparan di tengah** — bagian tempat foto tamu berada harus
  transparan (alpha 0), kalau tidak fotonya ketutup.
- **Ukuran = ukuran output layout** yang didaftarkan di `layouts`:
  - `strip` (3 foto): **900 × 2103 px**
  - `grid` (4 foto): **1080 × 1248 px**
  - `portrait` (1 foto): **900 × 1269 px**
  - `duet` (2 foto): **1200 × 669 px**
- `footer: "drawn"` — teks nama + tanggal tetap digambar kode di bawah
  (jadi biarkan area footer bawah kosong). `footer: "none"` — frame sudah
  membawa teks footer sendiri, kode tidak menggambar teks lagi.
- Kalau file-nya PNG (bukan SVG), upload lewat browser ke GitHub
  (push via connector hanya bisa file teks, PNG akan rusak).

## Contoh

`renda-teh-strip.svg` di folder ini adalah contoh frame gambar untuk
layout `strip`: garis tepi ganda + bunga di empat sudut, tengahnya
transparan. Duplikat file itu, ubah warna / hiasannya, daftarkan dengan
id baru — selesai.
