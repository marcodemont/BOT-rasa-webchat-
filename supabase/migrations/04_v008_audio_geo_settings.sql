-- AURUM | 04_v008_audio_geo_settings
-- v0.08 erweitert das Schema um:
--   * Geokoordinaten am Marker (Anker speichert Ort, wenn iPhone es erlaubt)
--   * Audio-Pfad (Verweis ins Storage Bucket 'audio-markers')
--   * AURA-Felder: summary, source (woher kam der Marker)
--   * neue Tabelle 'user_settings' fuer Druckaufbau-Dauer und
--     Wiederholungs-Intervall geplanter Marker
-- Storage-Bucket muss separat im Dashboard angelegt werden, siehe README.

-- ── markers: neue Felder ──
alter table public.markers
  add column if not exists latitude        double precision,
  add column if not exists longitude       double precision,
  add column if not exists location_label  text,
  add column if not exists audio_path      text,
  add column if not exists summary         text,
  add column if not exists source          text not null default 'app'
    check (source in ('app','ring'));

-- ── user_settings: pro User ein Datensatz ──
create table if not exists public.user_settings (
  user_id uuid primary key
    default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- geplante Marker
  compression_seconds      int  not null default 30
    check (compression_seconds between 10 and 60),
  repeat_interval_minutes  int           -- null = keine Wiederholung
    check (repeat_interval_minutes is null or repeat_interval_minutes between 1 and 1440),

  -- Geo
  geo_enabled boolean not null default true,

  -- Ring (Platzhalter fuer spaetere BLE-Anbindung)
  ring_paired_id text
);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row
  execute function public.set_updated_at();

alter table public.user_settings enable row level security;

create policy "user_settings_select_own"
  on public.user_settings for select to authenticated
  using (auth.uid() = user_id);

create policy "user_settings_insert_own"
  on public.user_settings for insert to authenticated
  with check (auth.uid() = user_id);

create policy "user_settings_update_own"
  on public.user_settings for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings_delete_own"
  on public.user_settings for delete to authenticated
  using (auth.uid() = user_id);

-- ── Storage-Bucket 'audio-markers' ──
-- Bucket muss im Supabase Dashboard angelegt werden:
--   Storage → New bucket → name: 'audio-markers' → Public: false
-- Danach diese Policies im SQL Editor ausfuehren:

-- Policy: User darf eigene Dateien im Pfad <user_id>/... lesen
create policy "audio_markers_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'audio-markers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: User darf in eigenen Ordner schreiben
create policy "audio_markers_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'audio-markers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: User darf eigene Dateien loeschen
create policy "audio_markers_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'audio-markers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
