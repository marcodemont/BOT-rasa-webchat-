/**
 * Einstellungen — portiert aus AURUM (s-settings).
 * Sections: Geplante Marker, Anker, Armreif, Konto, Archiv (versteckt).
 * Wired auf AURUMs `user_settings`-Tabelle via Supabase.
 */

import React, { useEffect, useState } from 'react';
import { LogOut, ChevronDown, ChevronRight, RotateCcw, Trash2 } from 'lucide-react';
import { fetchUserSettings, upsertUserSettings, type UserSettingsRow, type UserSettingsPatch } from './settings-api';
import { fetchArchivedMarkers, unarchiveMarker, hardDeleteMarker, MARKER_TYPE_COLORS, MARKER_TYPE_LABELS, type MarkerRow } from './markers-api';
import { fetchArchivedNotes, unarchiveNote, deleteNote, type NoteRow } from './notes-api';
import { useAdminMode } from './useAdminMode';
import { useAuth } from '../auth/AuthProvider';

const REPEAT_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: 'Aus' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

interface SettingsViewProps {
  onLogout?: () => void;
  isAuthenticated: boolean;
}

export function SettingsView({ onLogout, isAuthenticated }: SettingsViewProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [adminMode, setAdminMode] = useAdminMode();

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const s = await fetchUserSettings();
        if (!cancelled) setSettings(s);
      } catch (e) {
        console.error('SettingsView load:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const update = async (patch: UserSettingsPatch) => {
    setSettings(prev => prev ? { ...prev, ...patch } as UserSettingsRow : null);
    try {
      const next = await upsertUserSettings(patch);
      setSettings(next);
    } catch (e) {
      console.error('SettingsView save:', e);
    }
  };

  const compression = settings?.compression_seconds ?? 30;
  const repeat = settings?.repeat_interval_minutes ?? null;
  const geo = settings?.geo_enabled ?? true;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#faf5eb' }}>
      <div className="px-4 md:px-6 py-4 max-w-2xl mx-auto">
        <h2 className="text-lg md:text-2xl font-light mb-4" style={{ color: '#2e2820' }}>
          Einstellungen
        </h2>

        {!isAuthenticated ? (
          <div className="text-center py-8 text-[13px]" style={{ color: '#a89f8d' }}>
            Einstellungen sind nur eingeloggt verfügbar.
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-[13px]" style={{ color: '#a89f8d' }}>Lädt…</div>
        ) : (
          <div className="space-y-6">
            <Section title="Geplante Marker">
              <Row label="Druckaufbau">
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={compression}
                  onChange={e => update({ compression_seconds: Number(e.target.value) })}
                  className="w-32 md:w-40 accent-amber-600"
                />
                <span className="text-[12px] tabular-nums w-10 text-right" style={{ color: '#7a7062' }}>
                  {compression}s
                </span>
              </Row>
              <Row label="Wiederholung">
                <select
                  value={repeat ?? ''}
                  onChange={e => update({ repeat_interval_minutes: e.target.value ? Number(e.target.value) : null })}
                  className="bg-white border rounded p-1 text-[13px]"
                  style={{ borderColor: '#ece0c6', color: '#2e2820' }}
                >
                  {REPEAT_OPTIONS.map(o => (
                    <option key={String(o.value)} value={o.value ?? ''}>{o.label}</option>
                  ))}
                </select>
              </Row>
              <Hint>0 / Aus deaktiviert wiederholte Erinnerungen für geplante Marker.</Hint>
            </Section>

            <Section title="Anker">
              <Row label="Geo-Lokalisierung">
                <Toggle on={geo} onChange={v => update({ geo_enabled: v })} />
              </Row>
            </Section>

            <Section title="Armreif">
              <Row label="Status">
                <span className="text-[12px]" style={{ color: '#a89f8d' }}>
                  {settings?.ring_paired_id
                    ? `gekoppelt: ${settings.ring_paired_id.slice(0, 8)}…`
                    : 'Nicht gekoppelt'}
                </span>
              </Row>
              <Hint>Bluetooth-Pairing folgt in einer kommenden Version.</Hint>
            </Section>

            <Section title="Konto">
              <Row label="E-Mail">
                <span className="text-[13px]" style={{ color: '#7a7062' }}>{user?.email ?? '—'}</span>
              </Row>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white text-[13px]"
                  style={{ background: '#b85555' }}
                >
                  <LogOut className="w-4 h-4" /> Abmelden
                </button>
              )}
            </Section>

            <Section title="Entwickler">
              <Row label="Admin-Modus">
                <Toggle on={adminMode} onChange={setAdminMode} />
              </Row>
              <Hint>
                Schaltet manuelle Aktionen frei, die sonst der Armreif ausloesen wuerde
                (z.B. „Anker setzen" direkt in der Timeline). Lokal pro Geraet.
              </Hint>
            </Section>

            {/* Versteckter Archiv-Bereich */}
            <div>
              <button
                onClick={() => setShowArchive(s => !s)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: '#f2ecdf', color: '#7a7062' }}
              >
                <span className="text-[13px]">Archiv</span>
                {showArchive ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              {showArchive && <ArchiveContent />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#a89f8d', letterSpacing: '0.1em' }}>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2.5"
      style={{ border: '1px solid #ece0c6' }}
    >
      <span className="text-[13px]" style={{ color: '#2e2820' }}>{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] italic mt-1 px-1" style={{ color: '#a89f8d', lineHeight: 1.4 }}>
      {children}
    </p>
  );
}

function ArchiveContent() {
  const [tab, setTab] = useState<'markers' | 'notes'>('markers');
  const [markers, setMarkers] = useState<MarkerRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const [m, n] = await Promise.all([fetchArchivedMarkers(), fetchArchivedNotes()]);
      setMarkers(m);
      setNotes(n);
    } catch (e) {
      console.error('ArchiveContent reload:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  return (
    <div className="mt-2 px-3 py-3 bg-white rounded-lg" style={{ border: '1px solid #ece0c6' }}>
      <p className="text-[11px] italic mb-3" style={{ color: '#a89f8d', lineHeight: 1.4 }}>
        Archivierte Eintraege werden automatisch nach 60 Tagen endgueltig geloescht.
      </p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setTab('markers')}
          className="px-3 py-1 rounded text-[12px]"
          style={{
            background: tab === 'markers' ? '#b89668' : '#f2ecdf',
            color: tab === 'markers' ? 'white' : '#7a7062',
          }}
        >
          Marker ({markers.length})
        </button>
        <button
          onClick={() => setTab('notes')}
          className="px-3 py-1 rounded text-[12px]"
          style={{
            background: tab === 'notes' ? '#b89668' : '#f2ecdf',
            color: tab === 'notes' ? 'white' : '#7a7062',
          }}
        >
          Notizen ({notes.length})
        </button>
      </div>

      {loading ? (
        <p className="text-[12px] text-center py-4" style={{ color: '#a89f8d' }}>Laedt…</p>
      ) : tab === 'markers' ? (
        markers.length === 0 ? (
          <p className="text-[12px] text-center py-4" style={{ color: '#a89f8d' }}>Keine archivierten Marker.</p>
        ) : (
          <div className="space-y-1.5">
            {markers.map(m => (
              <ArchivedMarkerItem key={m.id} marker={m} onChanged={reload} />
            ))}
          </div>
        )
      ) : notes.length === 0 ? (
        <p className="text-[12px] text-center py-4" style={{ color: '#a89f8d' }}>Keine archivierten Notizen.</p>
      ) : (
        <div className="space-y-1.5">
          {notes.map(n => (
            <ArchivedNoteItem key={n.id} note={n} onChanged={reload} />
          ))}
        </div>
      )}
    </div>
  );
}

function ArchivedMarkerItem({ marker, onChanged }: { marker: MarkerRow; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const handleRestore = async () => {
    setBusy(true);
    try { await unarchiveMarker(marker.id); onChanged(); }
    catch (e) { console.error(e); alert('Fehler beim Wiederherstellen'); }
    finally { setBusy(false); }
  };
  const handleDelete = async () => {
    if (!confirm('Marker endgueltig loeschen?')) return;
    setBusy(true);
    try { await hardDeleteMarker(marker.id); onChanged(); }
    catch (e) { console.error(e); alert('Fehler beim Loeschen'); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#faf5eb' }}>
      <span
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: MARKER_TYPE_COLORS[marker.marker_type] }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] truncate" style={{ color: '#2e2820' }}>
          {marker.title || MARKER_TYPE_LABELS[marker.marker_type]}
        </div>
        <div className="text-[10px]" style={{ color: '#a89f8d' }}>
          {marker.marker_date} {marker.start_time?.slice(0, 5)}
        </div>
      </div>
      <button onClick={handleRestore} disabled={busy} title="Wiederherstellen" className="p-1 disabled:opacity-50">
        <RotateCcw className="w-4 h-4" style={{ color: '#b89668' }} />
      </button>
      <button onClick={handleDelete} disabled={busy} title="Endgueltig loeschen" className="p-1 disabled:opacity-50">
        <Trash2 className="w-4 h-4" style={{ color: '#b85555' }} />
      </button>
    </div>
  );
}

function ArchivedNoteItem({ note, onChanged }: { note: NoteRow; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const handleRestore = async () => {
    setBusy(true);
    try { await unarchiveNote(note.id); onChanged(); }
    catch (e) { console.error(e); alert('Fehler beim Wiederherstellen'); }
    finally { setBusy(false); }
  };
  const handleDelete = async () => {
    if (!confirm('Notiz endgueltig loeschen?')) return;
    setBusy(true);
    try { await deleteNote(note.id); onChanged(); }
    catch (e) { console.error(e); alert('Fehler beim Loeschen'); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#faf5eb' }}>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] truncate" style={{ color: '#2e2820' }}>
          {note.title || note.content.slice(0, 40) || 'Ohne Titel'}
        </div>
        <div className="text-[10px]" style={{ color: '#a89f8d' }}>
          archiviert {note.archived_at ? new Date(note.archived_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : ''}
        </div>
      </div>
      <button onClick={handleRestore} disabled={busy} title="Wiederherstellen" className="p-1 disabled:opacity-50">
        <RotateCcw className="w-4 h-4" style={{ color: '#b89668' }} />
      </button>
      <button onClick={handleDelete} disabled={busy} title="Endgueltig loeschen" className="p-1 disabled:opacity-50">
        <Trash2 className="w-4 h-4" style={{ color: '#b85555' }} />
      </button>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="relative w-10 h-6 rounded-full transition-colors"
      style={{ background: on ? '#b89668' : '#d4cfc0' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
        style={{ transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  );
}
