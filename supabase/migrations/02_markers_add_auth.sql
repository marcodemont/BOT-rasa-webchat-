-- AURUM | 02_markers_add_auth
-- Verknuepft Marker mit Supabase Auth. RLS wird von offen
-- auf user-gebunden umgestellt.

-- user_id Spalte, automatisch aus JWT
alter table public.markers
  add column user_id uuid references auth.users(id) on delete cascade;

alter table public.markers
  alter column user_id set default auth.uid(),
  alter column user_id set not null;

-- Policies: pro Operation gebunden an auth.uid() = user_id
create policy "markers_select_own"
  on public.markers for select
  to authenticated
  using (auth.uid() = user_id);

create policy "markers_insert_own"
  on public.markers for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "markers_update_own"
  on public.markers for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "markers_delete_own"
  on public.markers for delete
  to authenticated
  using (auth.uid() = user_id);

-- User-zentrischer Index fuer Timeline-Queries
create index markers_user_date_idx
  on public.markers (user_id, marker_date, start_time, sort_order);
