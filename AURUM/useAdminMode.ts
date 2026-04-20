/**
 * Lokaler Admin-/Entwickler-Modus.
 * Nicht in Supabase — pro Geraet via localStorage.
 * Schaltet manuelle Aktionen frei, die sonst die Hardware (Armreif) ausloesen wuerde.
 */

import { useEffect, useState } from 'react';

const KEY = 'aurum_admin_mode';

export function useAdminMode(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch { /* ignore */ }
  }, [enabled]);

  return [enabled, setEnabled];
}
