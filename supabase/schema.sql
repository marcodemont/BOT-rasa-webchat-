-- AURUM | schema.sql (Stand v0.08)
-- Aktueller Endzustand der Datenbank nach allen Migrationen.
-- Diese Datei ist rein zum Lesen/Dokumentieren gedacht.
-- Wenn du die Datenbank neu aufbaust, fuehre stattdessen die
-- Migrationen in /supabase/migrations/ in Reihenfolge aus.

-- ═══════════════════════════════════════════════════
-- FUNKTIONEN
-- ═══════════════════════════════════════════════════

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ═══════════════════════════════════════════════════
-- TABELLE: markers
-- ═══════════════════════════════════════════════════

create table public.markers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  marker_date date not null default current_date,
  start_time time not null,
  end_time time,
  duration_minutes int,

  title text,
  sub text,
  note text,
  tags text[] not null default '{}',

  marker_type text not null default 'anchor'
    check (marker_type in ('anchor','audio','compression','planned')),

  -- v0.08
  latitude        double precision,
  longitude       double precision,
  location_label  text,
  audio_path      text,
  audio_url       text,
  transcript      text,
  summary         text,
  source          text not null default 'app'
    check (source in ('app','ring')),

  icon text not null default 'list',
  color text not null default '#b89668',
  is_done boolean not null default false,
  repeat boolean not null default false,
  sort_order int not null default 0
);

create index markers_user_date_idx
  on public.markers (user_id, marker_date, start_time, sort_order);

create trigger markers_set_updated_at
  before update on public.markers
  for each row
  execute function public.set_updated_at();

alter table public.markers enable row level security;

create policy "markers_select_own" on public.markers for select
  to authenticated using (auth.uid() = user_id);
create policy "markers_insert_own" on public.markers for insert
  to authenticated with check (auth.uid() = user_id);
create policy "markers_update_own" on public.markers for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "markers_delete_own" on public.markers for delete
  to authenticated using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- TABELLE: notes
-- ═══════════════════════════════════════════════════

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  marker_id uuid references public.markers(id) on delete set null,
  title text,
  content text not null default '',
  tags text[] not null default '{}'
);

create index notes_user_created_idx
  on public.notes (user_id, created_at desc);

create index notes_marker_idx
  on public.notes (marker_id)
  where marker_id is not null;

create trigger notes_set_updated_at
  before update on public.notes
  for each row
  execute function public.set_updated_at();

alter table public.notes enable row level security;

create policy "notes_select_own" on public.notes for select
  to authenticated using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes for insert
  to authenticated with check (auth.uid() = user_id);
create policy "notes_update_own" on public.notes for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes for delete
  to authenticated using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- TABELLE: user_settings (v0.08)
-- ═══════════════════════════════════════════════════

create table public.user_settings (
  user_id uuid primary key
    default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  compression_seconds int not null default 30
    check (compression_seconds between 10 and 60),
  repeat_interval_minutes int
    check (repeat_interval_minutes is null or repeat_interval_minutes between 1 and 1440),

  geo_enabled boolean not null default true,
  ring_paired_id text
);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row
  execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "user_settings_select_own" on public.user_settings for select
  to authenticated using (auth.uid() = user_id);
create policy "user_settings_insert_own" on public.user_settings for insert
  to authenticated with check (auth.uid() = user_id);
create policy "user_settings_update_own" on public.user_settings for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_settings_delete_own" on public.user_settings for delete
  to authenticated using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- STORAGE: Bucket 'audio-markers' (v0.08)
-- ═══════════════════════════════════════════════════
-- Bucket im Dashboard anlegen (Storage → New bucket → audio-markers, Public: false).
-- Dateipfad-Konvention: <user_id>/<marker_id>.<ext>
-- Policies (im SQL Editor):

create policy "audio_markers_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'audio-markers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "audio_markers_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'audio-markers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "audio_markers_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'audio-markers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
