-- Migrasi awal: tabel ucapan, RSVP, dan pengaturan undangan.
-- Jalankan di Supabase Dashboard -> SQL Editor (sekali saja).
--
-- RLS diaktifkan di semua tabel. Peran anon (publishable key) hanya boleh:
--   - baca ucapan (wishes) + tulis ucapan baru,
--   - tulis RSVP baru,
--   - baca pengaturan undangan (data yang memang tampil di situs).
-- Semua tulis/hapus lain (ubah data undangan, hapus ucapan, baca daftar
-- RSVP) hanya bisa lewat service_role key dari API route /admin.

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  message text not null,
  attendance text,
  pax int,
  events text[] not null default '{}',
  category text,
  parent_id uuid references public.wishes (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  attendance text,
  pax int not null default 1,
  events text[] not null default '{}',
  category text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.wedding_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.wishes enable row level security;
alter table public.rsvps enable row level security;
alter table public.wedding_settings enable row level security;

-- Policy untuk peran anon (publishable key): tamu boleh baca + kirim
-- ucapan, kirim RSVP, dan baca data undangan. Tanpa policy update/delete,
-- anon tidak bisa mengubah atau menghapus apa pun.
-- (DROP dulu supaya file ini aman dijalankan ulang.)
drop policy if exists "tamu boleh baca ucapan" on public.wishes;
drop policy if exists "tamu boleh kirim ucapan" on public.wishes;
drop policy if exists "tamu boleh kirim rsvp" on public.rsvps;
drop policy if exists "tamu boleh baca data undangan" on public.wedding_settings;

create policy "tamu boleh baca ucapan"
  on public.wishes for select to anon using (true);

create policy "tamu boleh kirim ucapan"
  on public.wishes for insert to anon with check (true);

create policy "tamu boleh kirim rsvp"
  on public.rsvps for insert to anon with check (true);

create policy "tamu boleh baca data undangan"
  on public.wedding_settings for select to anon using (true);

create index if not exists wishes_slug_created_at_idx
  on public.wishes (slug, created_at desc);

create index if not exists rsvps_slug_created_at_idx
  on public.rsvps (slug, created_at desc);
