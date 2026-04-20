/**
 * Marker-Detail-Modal — analog AURUMs `s-marker-detail`.
 * Inhalt dynamisch je marker_type. Actions: Archivieren, Zur Notiz, Löschen, Done-Toggle (nur planned).
 */

import React, { useState } from 'react';
import { X, Archive, Trash2, Check, MapPin, Clock, AudioWaveform, ChevronsRightLeft, Anchor as AnchorIcon, FileText } from 'lucide-react';
import { archiveMarker, hardDeleteMarker, updateMarkerDone, MARKER_TYPE_COLORS, MARKER_TYPE_LABELS } from './markers-api';
import { fetchNotes, createNote, type NoteRow } from './notes-api';
import { NoteEditor } from './NotesView';
import type { Marker } from './types';

interface MarkerDetailProps {
  marker: Marker;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}

export function MarkerDetail({ marker, onClose, onChanged }: MarkerDetailProps) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(marker.completed);
  const [editingNote, setEditingNote] = useState<NoteRow | null>(null);
  const type = marker.markerType;

  const time = new Date(marker.time);
  const dateStr = time.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const accent = type ? MARKER_TYPE_COLORS[type] : marker.color;

  const handleArchive = async () => {
    setBusy(true);
    try {
      await archiveMarker(marker.id);
      await onChanged();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Archivieren');
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Marker endgültig löschen?')) return;
    setBusy(true);
    try {
      await hardDeleteMarker(marker.id);
      await onChanged();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Fehler beim Löschen');
      setBusy(false);
    }
  };

  const handleGoToNote = async () => {
    setBusy(true);
    try {
      const notes = await fetchNotes();
      const existing = notes.find((n) => n.marker_id === marker.id);
      if (existing) {
        setEditingNote(existing);
      } else {
        const created = await createNote({ marker_id: marker.id, content: '' });
        setEditingNote(created);
      }
    } catch (e) {
      console.error(e);
      alert('Notiz konnte nicht geöffnet werden');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleDone = async () => {
    const next = !done;
    setDone(next);
    try {
      await updateMarkerDone(marker.id, next);
      await onChanged();
    } catch (e) {
      console.error(e);
      setDone(!next);
      alert('Fehler beim Speichern');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/30">
      <div
        className="w-full md:max-w-xl rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#faf5eb', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={onClose} className="p-1" aria-label="Schliessen">
            <X className="w-5 h-5" style={{ color: '#7a7062' }} />
          </button>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: '#a89f8d', letterSpacing: '0.1em' }}>
            {type ? MARKER_TYPE_LABELS[type] : 'Marker'}
          </div>
          <div style={{ width: 28 }} />
        </div>

        {/* Bubble + Title */}
        <div className="px-4 flex items-start gap-3 mb-4">
          <div
            className="flex items-center justify-center text-white flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              background: accent,
              boxShadow: '0 2px 6px rgba(46,40,32,0.12)',
            }}
          >
            <TypeIcon type={type} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-[18px] font-semibold leading-tight" style={{ color: '#2e2820' }}>
              {marker.title}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-[12px]" style={{ color: '#7a7062' }}>
              <Clock className="w-3.5 h-3.5" />
              <span className="tabular-nums">{timeStr}</span>
              <span style={{ color: '#a89f8d' }}>·</span>
              <span>{dateStr}</span>
            </div>
          </div>
        </div>

        {/* Body — typabhaengig */}
        <div className="px-4 space-y-3">
          {type === 'audio' && (
            <>
              {marker.audioUrl && (
                <audio controls src={marker.audioUrl} className="w-full" style={{ height: 36 }} />
              )}
              {marker.summary && (
                <div
                  className="p-3 rounded-lg bg-white"
                  style={{ borderLeft: `3px solid ${accent}` }}
                >
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#a89f8d' }}>
                    AURA-Zusammenfassung
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#2e2820' }}>
                    {marker.summary}
                  </p>
                </div>
              )}
              {marker.transcript && (
                <div className="p-3 rounded-lg bg-white" style={{ border: '1px solid #ece0c6' }}>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#a89f8d' }}>
                    Transkript
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#2e2820' }}>
                    {marker.transcript}
                  </p>
                </div>
              )}
              {!marker.audioUrl && !marker.summary && !marker.transcript && (
                <p className="text-[12px] italic" style={{ color: '#a89f8d' }}>
                  Inhalt liegt in der verknuepften Notiz.
                </p>
              )}
            </>
          )}

          {type === 'compression' && (
            <p className="text-[13px] leading-relaxed" style={{ color: '#2e2820' }}>
              {marker.sub || 'koerperlicher Eingriff am Armreif'}
            </p>
          )}

          {type === 'anchor' && marker.locationLabel && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[12px]" style={{ background: '#f2ecdf', color: '#7a7062' }}>
              <MapPin className="w-3.5 h-3.5" />
              {marker.locationLabel}
            </div>
          )}

          {type === 'planned' && (
            <button
              onClick={handleToggleDone}
              className="flex items-center gap-2 px-3 py-2 rounded-lg w-full"
              style={{
                background: done ? accent : 'white',
                color: done ? 'white' : '#2e2820',
                border: `1px solid ${accent}`,
              }}
            >
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full"
                style={{
                  background: done ? 'white' : 'transparent',
                  border: `2px solid ${done ? 'white' : accent}`,
                }}
              >
                {done && <Check className="w-3 h-3" style={{ color: accent }} />}
              </span>
              <span className="text-[13px]">{done ? 'Erledigt' : 'Als erledigt markieren'}</span>
            </button>
          )}

          {marker.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {marker.tags.map((t, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded" style={{ background: '#f2ecdf', color: '#7a7062' }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 px-4 pt-3 flex items-center justify-between gap-3" style={{ borderTop: '1px solid #ece0c6' }}>
          <button
            onClick={handleArchive}
            disabled={busy}
            className="flex items-center gap-1.5 text-[13px] disabled:opacity-50"
            style={{ color: '#7a7062' }}
          >
            <Archive className="w-4 h-4" /> Archivieren
          </button>
          <button
            onClick={handleGoToNote}
            disabled={busy}
            className="flex items-center gap-1.5 text-[13px] disabled:opacity-50"
            style={{ color: '#b89668' }}
          >
            <FileText className="w-4 h-4" /> Zur Notiz
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="flex items-center gap-1.5 text-[13px] disabled:opacity-50"
            style={{ color: '#b85555' }}
          >
            <Trash2 className="w-4 h-4" /> Löschen
          </button>
        </div>
      </div>
      </div>

      {editingNote && (
        <NoteEditor
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSaved={async () => {
            setEditingNote(null);
            await onChanged();
          }}
        />
      )}
    </>
  );
}

function TypeIcon({ type }: { type?: Marker['markerType'] }) {
  switch (type) {
    case 'audio': return <AudioWaveform className="w-6 h-6" />;
    case 'compression': return <ChevronsRightLeft className="w-6 h-6" />;
    case 'planned': return <Clock className="w-6 h-6" />;
    case 'anchor': return <AnchorIcon className="w-6 h-6" />;
    default: return null;
  }
}
