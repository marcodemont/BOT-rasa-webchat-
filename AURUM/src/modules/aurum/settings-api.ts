/**
 * Direkter Supabase-Zugriff auf die AURUM `user_settings`-Tabelle.
 * Eine Zeile pro user_id (PK), RLS per auth.uid().
 */

import { supabase } from '../../utils/supabase/client.tsx';

export interface UserSettingsRow {
  user_id: string;
  created_at: string;
  updated_at: string;
  compression_seconds: number;
  repeat_interval_minutes: number | null;
  geo_enabled: boolean;
  ring_paired_id: string | null;
}

export type UserSettingsPatch = Partial<Omit<UserSettingsRow, 'user_id' | 'created_at' | 'updated_at'>>;

export async function fetchUserSettings(): Promise<UserSettingsRow | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as UserSettingsRow | null) ?? null;
}

export async function upsertUserSettings(patch: UserSettingsPatch): Promise<UserSettingsRow> {
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user?.id) throw new Error('Nicht eingeloggt');

  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: authData.user.id, ...patch }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as UserSettingsRow;
}
