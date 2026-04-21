/**
 * Direkter Supabase-Zugriff auf die AURUM `notes`-Tabelle.
 * RLS regelt Zugriff per auth.uid().
 */

import { supabase } from '../../utils/supabase/client.tsx';

export interface NoteRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  marker_id: string | null;
  title: string | null;
  content: string;
  tags: string[];
  archived_at: string | null;
}

export interface NoteInput {
  title?: string | null;
  content: string;
  tags?: string[];
  marker_id?: string | null;
}

export async function fetchNotes(): Promise<NoteRow[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .is('archived_at', null)
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as NoteRow[];
}

export async function fetchArchivedNotes(): Promise<NoteRow[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as NoteRow[];
}

export async function archiveNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function unarchiveNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ archived_at: null })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/** Loescht Notes, deren archived_at aelter als 60 Tage ist. Client-side Cleanup. */
export async function cleanupOldArchivedNotes(daysOld = 60): Promise<number> {
  const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
  const { error, count } = await supabase
    .from('notes')
    .delete({ count: 'exact' })
    .not('archived_at', 'is', null)
    .lt('archived_at', cutoff);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function createNote(input: NoteInput): Promise<NoteRow> {
  const { data, error } = await supabase
    .from('notes')
    .insert({ tags: [], ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as NoteRow;
}

export async function updateNote(id: string, input: Partial<NoteInput>): Promise<NoteRow> {
  const { data, error } = await supabase
    .from('notes')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as NoteRow;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
