-- Stiker pada ucapan: kolom `sticker` menyimpan kunci stiker yang dipilih
-- tamu saat mengirim ucapan (mis. "teh-1"), mengacu ke file gambar di
-- public/assets/stickers/. Jalankan di Supabase Dashboard -> SQL Editor.
alter table public.wishes add column if not exists sticker text;
