/**
 * Notizen-Liste + Edit-Modal. Nutzt AURUMs `notes`-Tabelle direkt via Supabase.
 * Layout im AURUM-Stil (Cream-BG, gold-Akzent).
 */

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X, Archive } from 'lucide-react';
import { fetchNotes, createNote, updateNote, deleteNote, archiveNote, type NoteRow } from './notes-api';

interface NotesViewProps {
  isAuthenticated: boolean;
  onCreate?: () => void;
}

export function NotesView({ isAuthenticated }: NotesViewProps) {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NoteRow | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    if (!isAuthenticated) {
      setNotes([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setNotes(await fetchNotes());
    } catch (e) {
      console.error('NotesView load:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, [isAuthenticated]);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#faf5eb' }}>
      <div className="px-3 md:px-4 py-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-light" style={{ color: '#2e2820' }}>
            Notizen
          </h2>
          <button
            onClick={() => setCreating(true)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-white text-[13px]"
            style={{ background: '#b89668' }}
          >
            <Plus className="w-4 h-4" /> Neu
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-16" style={{ color: '#a89f8d' }}>
            <p className="text-[13px]">Notizen sind nur eingeloggt verfügbar.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-[13px]" style={{ color: '#a89f8d' }}>Lädt…</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#a89f8d' }}>
            <p className="text-[13px] mb-2">Noch keine Notiz.</p>
            <p className="text-[12px]">Tippe auf das Plus, um eine zu erstellen.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} onClick={() => setEditing(n)} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB fuer Notiz-Erstellung */}
      <button
        onClick={() => setCreating(true)}
        aria-label="Neue Notiz"
        className="md:hidden fixed right-5 z-30 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: '#b89668', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {(editing || creating) && (
        <NoteEditor
          note={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); reload(); }}
        />
      )}
    </div>
  );
}

function NoteCard({ note, onClick }: { note: NoteRow; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-3 cursor-pointer transition active:scale-[0.99]"
      style={{ border: '1px solid #ece0c6' }}
    >
      <div className="text-[10px] uppercase tracking-wider mb-1 flex items-center justify-between" style={{ color: '#a89f8d' }}>
        <span>
          {new Date(note.updated_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        {note.marker_id && (
          <span style={{ color: '#b89668' }}>verknüpft</span>
        )}
      </div>
      {note.title && (
        <div className="text-[14px] font-semibold leading-tight mb-1" style={{ color: '#2e2820' }}>
          {note.title}
        </div>
      )}
      <div className="text-[12px] leading-snug line-clamp-3" style={{ color: '#7a7062' }}>
        {note.content || (note.title ? '' : 'Ohne Inhalt')}
      </div>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.map((t, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#f2ecdf', color: '#7a7062' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface NoteEditorProps {
  note: NoteRow | null;
  onClose: () => void;
  onSaved: () => void;
}

export function NoteEditor({ note, onClose, onSaved }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [tagsStr, setTagsStr] = useState((note?.tags ?? []).join(', '));
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { title: title.trim() || null, content, tags };
      if (note) await updateNote(note.id, payload);
      else await createNote(payload);
      onSaved();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Speichern');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!note) return;
    if (!confirm('Notiz wirklich löschen?')) return;
    setBusy(true);
    try {
      await deleteNote(note.id);
      onSaved();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Löschen');
    } finally {
      setBusy(false);
    }
  };

  const handleArchive = async () => {
    if (!note) return;
    setBusy(true);
    try {
      await archiveNote(note.id);
      onSaved();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Archivieren');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full md:max-w-xl rounded-t-2xl md:rounded-2xl p-4 max-h-[90vh] overflow-y-auto"
        style={{ background: '#faf5eb', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="p-1" aria-label="Schliessen">
            <X className="w-5 h-5" style={{ color: '#7a7062' }} />
          </button>
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-[13px] disabled:opacity-50"
            style={{ background: '#b89668' }}
          >
            <Save className="w-4 h-4" /> Speichern
          </button>
        </div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titel (optional)"
          className="w-full bg-transparent text-xl font-medium outline-none mb-2 placeholder-[#a89f8d]"
          style={{ color: '#2e2820' }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Inhalt…"
          rows={10}
          className="w-full bg-transparent outline-none resize-none text-[14px] leading-relaxed placeholder-[#a89f8d]"
          style={{ color: '#2e2820' }}
        />
        <div className="mt-3">
          <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: '#a89f8d' }}>
            Tags (Komma-getrennt)
          </label>
          <input
            value={tagsStr}
            onChange={e => setTagsStr(e.target.value)}
            className="w-full bg-white border rounded p-2 text-[14px]"
            style={{ borderColor: '#ece0c6', color: '#2e2820' }}
          />
        </div>
        {note && (
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleArchive}
              disabled={busy}
              className="flex items-center gap-1 text-[12px] disabled:opacity-50"
              style={{ color: '#7a7062' }}
            >
              <Archive className="w-4 h-4" /> Archivieren
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              className="flex items-center gap-1 text-[12px] disabled:opacity-50"
              style={{ color: '#b85555' }}
            >
              <Trash2 className="w-4 h-4" /> Löschen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
