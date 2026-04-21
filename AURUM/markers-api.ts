/**
 * Direkter Supabase-Zugriff auf die AURUM `markers`-Tabelle.
 * Nutzt das geteilte Supabase-Projekt von AURUM (siehe utils/supabase/info.tsx).
 * Kein Edge-Function-Aufruf — RLS regelt Zugriff per auth.uid().
 */

import { supabase } from '../../utils/supabase/client.tsx';
import type { Marker } from './types';

export type MarkerType = 'anchor' | 'audio' | 'compression' | 'planned';

export interface MarkerRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  marker_date: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  title: string | null;
  sub: string | null;
  note: string | null;
  tags: string[];
  marker_type: MarkerType;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  audio_path: string | null;
  audio_url: string | null;
  transcript: string | null;
  summary: string | null;
  source: 'app' | 'ring';
  icon: string;
  color: string;
  is_done: boolean;
  repeat: boolean;
  sort_order: number;
  archived_at: string | null;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function fetchMarkersForRange(from: Date, to: Date): Promise<MarkerRow[]> {
  const fromIso = isoDate(from);
  const toIso = isoDate(to);

  const { data, error } = await supabase
    .from('markers')
    .select('*')
    .is('archived_at', null)
    .gte('marker_date', fromIso)
    .lte('marker_date', toIso)
    .order('marker_date', { ascending: true })
    .order('start_time', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`Markers konnten nicht geladen werden: ${error.message}`);
  }

  return (data ?? []) as MarkerRow[];
}

export async function fetchArchivedMarkers(): Promise<MarkerRow[]> {
  const { data, error } = await supabase
    .from('markers')
    .select('*')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as MarkerRow[];
}

export async function updateMarkerDone(id: string, done: boolean): Promise<void> {
  const { error } = await supabase
    .from('markers')
    .update({ is_done: done })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function archiveMarker(id: string): Promise<void> {
  const { error } = await supabase
    .from('markers')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function unarchiveMarker(id: string): Promise<void> {
  const { error } = await supabase
    .from('markers')
    .update({ archived_at: null })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function hardDeleteMarker(id: string): Promise<void> {
  const { error } = await supabase.from('markers').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Loescht Markers, deren archived_at aelter als 60 Tage ist. Client-side Cleanup. */
export async function cleanupOldArchivedMarkers(daysOld = 60): Promise<number> {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await supabase
    .from('markers')
    .delete({ count: 'exact' })
    .not('archived_at', 'is', null)
    .lt('archived_at', cutoff);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export function mapRowToMarker(row: MarkerRow): Marker {
  // marker_date + start_time (HH:MM:SS) → ISO timestamp im lokalen Tag
  const [hh, mm] = String(row.start_time || '00:00:00').split(':').map(Number);
  const [year, month, day] = row.marker_date.split('-').map(Number);
  const time = new Date(year, month - 1, day, hh || 0, mm || 0, 0).toISOString();

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title || titleFallback(row),
    time,
    duration: row.duration_minutes ?? undefined,
    color: row.color,
    icon: row.icon,
    completed: row.is_done,
    noteIds: [],
    tags: row.tags || [],
    // AURUMs `repeat` ist eine andere Semantik als ARGENTUMs Calendar-Recurrence (Pattern/Days).
    // Bis das gemappt ist, nicht als recurring rendern, sonst greift Pattern-Filter und versteckt den Marker.
    recurring: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    markerType: row.marker_type,
    sub: row.sub ?? undefined,
    audioUrl: row.audio_url ?? undefined,
    transcript: row.transcript ?? undefined,
    summary: row.summary ?? undefined,
    locationLabel: row.location_label ?? undefined,
  };
}

function titleFallback(row: MarkerRow): string {
  switch (row.marker_type) {
    case 'audio': return 'Audiomarker';
    case 'compression': return 'Kompression';
    case 'anchor': return row.location_label || 'Anker';
    case 'planned': return 'Termin';
    default: return 'Marker';
  }
}

export interface CreateAnchorOptions {
  latitude?: number;
  longitude?: number;
  locationLabel?: string;
}

export async function createAnchor(opts: CreateAnchorOptions = {}): Promise<MarkerRow> {
  const now = new Date();
  const marker_date = isoDate(now);
  const start_time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const { data: authData } = await supabase.auth.getUser();
  const uid = authData?.user?.id;
  if (!uid) throw new Error('Nicht eingeloggt');

  const insert = {
    user_id: uid,
    marker_date,
    start_time,
    marker_type: 'anchor' as const,
    source: 'app' as const,
    icon: 'list',
    color: '#b85555',
    latitude: opts.latitude ?? null,
    longitude: opts.longitude ?? null,
    location_label: opts.locationLabel ?? null,
  };

  const { data, error } = await supabase
    .from('markers')
    .insert(insert)
    .select()
    .single();

  if (error) throw new Error(`Anker konnte nicht erstellt werden: ${error.message}`);
  return data as MarkerRow;
}

export const MARKER_TYPE_COLORS: Record<MarkerType, string> = {
  anchor: '#c4bca8',
  audio: '#b89668',
  compression: '#c08a7a',
  planned: '#b5c5d5',
};

export const MARKER_TYPE_LABELS: Record<MarkerType, string> = {
  anchor: 'Anker',
  audio: 'Audiomarker',
  compression: 'Kompression',
  planned: 'Termin',
};
