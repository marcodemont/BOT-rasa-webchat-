-- AURUM | 04_markers_audio_geo_and_settings
-- v0.08 erweitert Marker um Audio-Pfad, Ort und Ring-Parameter.
-- Zusätzlich wird der Storage-Bucket fuer Audiomarker vorbereitet.

alter table public.markers
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_label text,
  add column if not exists audio_path text,
  add column if not exists summary text,
  add column if not exists compression_seconds int not null default 30,
  add column if not exists repeat_interval_minutes int;

alter table public.markers
  drop constraint if exists markers_compression_seconds_check;

alter table public.markers
  add constraint markers_compression_seconds_check
  check (compression_seconds between 10 and 60);

alter table public.markers
  drop constraint if exists markers_repeat_interval_minutes_check;

alter table public.markers
  add constraint markers_repeat_interval_minutes_check
  check (repeat_interval_minutes is null or repeat_interval_minutes >= 0);

create index if not exists markers_audio_path_idx
  on public.markers (audio_path)
  where audio_path is not null;

insert into storage.buckets (id, name, public)
values ('audio-markers', 'audio-markers', false)
on conflict (id) do nothing;

drop policy if exists "audio_markers_select_own" on storage.objects;
create policy "audio_markers_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'audio-markers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "audio_markers_insert_own" on storage.objects;
create policy "audio_markers_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'audio-markers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "audio_markers_update_own" on storage.objects;
create policy "audio_markers_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'audio-markers'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'audio-markers'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "audio_markers_delete_own" on storage.objects;
create policy "audio_markers_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'audio-markers'
  and (storage.foldername(name))[1] = auth.uid()::text
);
