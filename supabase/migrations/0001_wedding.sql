-- Migrasi awal: tabel ucapan, RSVP, dan pengaturan undangan.
-- Jalankan di Supabase Dashboard -> SQL Editor (sekali saja).
--
-- RLS diaktifkan di semua tabel TANPA policy untuk peran anon:
-- tidak ada akses langsung dari browser. Semua baca/tulis lewat
-- API route Next.js yang memakai service_role key.

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

create index if not exists wishes_slug_created_at_idx
  on public.wishes (slug, created_at desc);

create index if not exists rsvps_slug_created_at_idx
  on public.rsvps (slug, created_at desc);
