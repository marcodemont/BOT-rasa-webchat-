-- AURUM | 03_markers_types_and_notes
-- Bringt das Begriffssystem ins Schema (anchor/audio/compression/planned)
-- und legt die Notizen-Ebene an.

-- ── Marker-Typen ──
alter table public.markers drop constraint if exists markers_marker_type_check;

-- bestehende 'standard' zu 'anchor' umbenennen
update public.markers set marker_type = 'anchor' where marker_type = 'standard';

alter table public.markers
  alter column marker_type set default 'anchor';

alter table public.markers
  add constraint markers_marker_type_check
  check (marker_type in ('anchor','audio','compression','planned'));

-- ── Notizen-Tabelle (zweite Ebene) ──
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

alter table public.notes enable row level security;

create policy "notes_select_own"
  on public.notes for select to authenticated
  using (auth.uid() = user_id);

create policy "notes_insert_own"
  on public.notes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "notes_update_own"
  on public.notes for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes_delete_own"
  on public.notes for delete to authenticated
  using (auth.uid() = user_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row
  execute function public.set_updated_at();
