-- AURUM | 05_markers_source_and_user_settings
-- v0.11: Marker-Herkunft (app/ring) und persistente user_settings.

alter table public.markers
  add column if not exists source text not null default 'app';

alter table public.markers
  drop constraint if exists markers_source_check;

alter table public.markers
  add constraint markers_source_check
  check (source in ('app', 'ring'));

update public.markers
set source = 'ring'
where source = 'app'
  and (
    lower(coalesce(sub, '')) like 'ring%'
    or ('ring' = any(coalesce(tags, '{}')))
  );

create table if not exists public.user_settings (
  user_id uuid primary key
    default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  compression_seconds int not null default 30
    check (compression_seconds between 10 and 60),
  repeat_interval_minutes int not null default 0
    check (repeat_interval_minutes between 0 and 240),

  ring_service_uuid text not null default '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  ring_notify_char_uuid text not null default '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  ring_write_char_uuid text not null default '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  ring_device_name_prefix text not null default 'AURUM',

  geo_enabled boolean not null default true,
  ring_paired_id text
);

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row
  execute function public.set_updated_at();

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own" on public.user_settings for select
  to authenticated using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own" on public.user_settings for insert
  to authenticated with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own" on public.user_settings for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own" on public.user_settings for delete
  to authenticated using (auth.uid() = user_id);
