-- 15 ucapan fiktif untuk mengisi list (sudah dimasukkan via REST API 2026-11-15).
-- Jalankan di Supabase Dashboard -> SQL Editor kalau mau mengulang seed ini.
-- Sebagian pakai stiker (hati/cincin/kue/teko), sebagian tanpa stiker.
insert into public.wishes (slug, name, message, sticker, attendance, pax, events, created_at) values
  ('dinda-rikky', 'Sari Wulandari', 'Selamat ya Dinda & Rikky! Akhirnya yang ditunggu-tunggu datang juga. Semoga lancar sampai hari H!', 'hati', 'hadir', 2, array['akad','resepsi'], '2026-11-10T08:12:00Z'),
  ('dinda-rikky', 'Andi Pratama', 'Wah akhirnya! Turut berbahagia, semoga samawa ya kalian berdua', null, 'hadir', 1, array['akad','resepsi'], '2026-11-10T10:45:00Z'),
  ('dinda-rikky', 'Dewi Lestari', 'Congrats Dinda! Cantik banget undangannya, nggak sabar ketemu di Balikpapan', 'cincin', 'hadir', 1, array['resepsi'], '2026-11-10T14:20:00Z'),
  ('dinda-rikky', 'Budi Santoso', 'Selamat menempuh hidup baru, Rikky! Jangan lupa traktirannya', null, 'hadir', 2, array['akad','resepsi'], '2026-11-11T09:05:00Z'),
  ('dinda-rikky', 'Maya Kusuma', 'Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin', 'kue', 'hadir', 1, array['akad'], '2026-11-11T11:30:00Z'),
  ('dinda-rikky', 'Rizki Ramadhan', 'Akhirnyaaa! Dari zaman kuliah ditunggu-tunggu kabar ini', null, 'hadir', 1, array['akad','resepsi'], '2026-11-11T16:40:00Z'),
  ('dinda-rikky', 'Putri Ayu', 'Dinda cantik banget pasti jadi pengantinnya! Selamat yaa', 'teko', 'hadir', 1, array['resepsi'], '2026-11-12T08:55:00Z'),
  ('dinda-rikky', 'Fajar Nugroho', 'Selamat Rikky & Dinda, semoga lancar akadnya. Maaf nggak bisa hadir, doa terbaik dari jauh', null, 'tidak', 1, '{}', '2026-11-12T13:15:00Z'),
  ('dinda-rikky', 'Intan Permata', 'Happy wedding! Semoga cepat dapat momongan', 'hati', 'hadir', 2, array['akad','resepsi'], '2026-11-12T19:25:00Z'),
  ('dinda-rikky', 'Agus Wijaya', 'Turut berbahagia untuk kedua mempelai dan keluarga besar', null, 'hadir', 1, array['akad'], '2026-11-13T07:40:00Z'),
  ('dinda-rikky', 'Lestari Ningsih', 'Selamat ya nak Dinda, semoga bahagia selalu', 'cincin', 'hadir', 1, array['akad','resepsi'], '2026-11-13T12:10:00Z'),
  ('dinda-rikky', 'Bambang Sutrisno', 'Wah, nggak nyangka udah nikah aja. Selamat Rikky!', null, 'hadir', 1, array['resepsi'], '2026-11-13T18:30:00Z'),
  ('dinda-rikky', 'Ratna Sari', 'Semoga pernikahannya berkah dan langgeng sampai kakek nenek', 'kue', 'hadir', 2, array['akad','resepsi'], '2026-11-14T09:20:00Z'),
  ('dinda-rikky', 'Yudi Hartono', 'Akhirnya yang ditunggu! Selamat ya, semoga lancar semua', 'teko', 'hadir', 1, array['akad'], '2026-11-14T11:50:00Z'),
  ('dinda-rikky', 'Sinta Maharani', 'Dinda & Rikky, selamat! Maaf belum bisa hadir, semoga acaranya meriah', null, 'tidak', 1, '{}', '2026-11-14T15:05:00Z');
