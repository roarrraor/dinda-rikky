-- Seed ucapan contoh (dari lib/pesta-teh/wishes.json, slug dinda-rikky).
-- Jalankan di Supabase Dashboard -> SQL Editor, SETELAH migrasi
-- supabase/migrations/0001_wedding.sql. Aman dijalankan ulang
-- (baris dengan id yang sama dilewati).

insert into public.wishes (id, slug, name, message, attendance, parent_id, created_at) values
  ('9f524580-3416-4734-8373-33e83ac1b541', 'dinda-rikky', 'Tamu Undangan', '❤️🙌🔥👏😢😍😮😂', 'online', NULL, '2026-10-28T22:01:48.237526+00:00'),
  ('f74d8796-56fb-4188-a2a8-7162be895f15', 'dinda-rikky', 'Tamu
Undangan', 'Barakallah', 'online', NULL, '2026-10-19T13:59:08.237435+00:00'),
  ('25a54af9-196d-4bd4-9ab9-df23fa5f2aef', 'dinda-rikky', 'Tamu Undangan', 'Ppp', 'online', NULL, '2026-10-01T05:53:48.451522+00:00'),
  ('3975a0d6-e811-4097-8e99-1a534bacd541', 'dinda-rikky', 'Tamu
Undangan', 'keren', 'online', NULL, '2026-10-01T05:06:29.062305+00:00'),
  ('2340660a-fd7c-465c-9421-d82456d4d142', 'dinda-rikky', 'Tamu Undangan', '😍😍😍😍😍', 'online', NULL, '2026-10-01T01:27:17.072661+00:00'),
  ('ef423ce8-7f80-4379-863a-3ebaf8e1d486', 'dinda-rikky', 'Tamu
Undangan', '@rizky_amira dd', 'online', NULL, '2026-10-01T01:24:56.181629+00:00'),
  ('801333ad-fa0d-415f-9d1c-1865ec203567', 'dinda-rikky', 'Tamu Undangan', '@paneer7508
mantappp', 'online', NULL, '2026-09-27T06:48:06.624169+00:00'),
  ('863f6c53-5e8c-4b76-b3f3-17e068c6211c', 'dinda-rikky', 'Tamu Undangan', '@paneer7508
gokill', 'online', NULL, '2026-09-27T06:47:12.050997+00:00'),
  ('0ecdf3b4-adf4-4d27-913d-df4c4ba21ff7', 'dinda-rikky', 'Tamu Undangan', '@paneer7508
terima kasih kak', 'online', NULL, '2026-09-27T05:16:08.224962+00:00'),
  ('7cd7df55-b3fe-4306-a930-bf05806e7a22', 'dinda-rikky', 'Tamu Undangan', '@paneer7508
gokil', 'online', NULL, '2026-09-27T04:58:23.002672+00:00'),
  ('ce440bc4-0301-48b3-9160-7dcab076dd92', 'dinda-rikky', 'Tamu Undangan', '@Tamu Undangan
goks', 'online', NULL, '2026-09-27T04:47:39.411618+00:00'),
  ('cccfc553-f452-4165-a16f-10302914fb5b', 'dinda-rikky', 'Tamu Undangan', 'dasdadaa', 'online', NULL, '2026-09-27T04:47:28.45554+00:00'),
  ('b55b7b43-4c94-44b8-94da-04749d4f0ac9', 'dinda-rikky', 'Tamu
Undangan', 'dsadasdas', 'online', NULL, '2026-09-27T04:36:35.420599+00:00')
on conflict (id) do nothing;
