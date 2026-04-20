-- AURUM | 01_create_markers_table
-- Kleinste zeitbasierte Einheit des Systems.
-- Deckt Timeline-Darstellung ab und ist für Audiomarker, Transkripte,
-- Kompression, geplante Marker, Tags und Notizen vorbereitet.

create table public.markers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Zeit
  marker_date date not null default current_date,
  start_time time not null,
  end_time time,
  duration_minutes int,

  -- Inhalt (alles optional, Marker duerfen leer sein)
  title text,
  sub text,
  note text,
  tags text[] not null default '{}',

  -- Typ (wird in 03 auf AURUM-Begriffe umgestellt)
  marker_type text not null default 'standard'
    check (marker_type in ('standard','audio','compression')),
  audio_url text,
  transcript text,

  -- Darstellung
  icon text not null default 'list',
  color text not null default '#b89668',
  is_done boolean not null default false,
  repeat boolean not null default false,
  sort_order int not null default 0
);

-- updated_at Trigger-Funktion
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

create trigger markers_set_updated_at
  before update on public.markers
  for each row
  execute function public.set_updated_at();

alter table public.markers enable row level security;
