/**
 * AURUM Timeline Component
 * Zeigt Marker entlang eines Zeitstrahls für Tag oder Woche
 * Unterstützt wiederholende Marker
 */

import React, { useState, useEffect } from 'react';
import { Circle, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Repeat, Check, Grid3x3, Square, AudioWaveform, ChevronsRightLeft, Anchor } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { MARKER_TYPE_COLORS, MARKER_TYPE_LABELS } from './markers-api';
import { useAdminMode } from './useAdminMode';
import type { Marker } from './types';

function markerColor(marker: Marker): string {
  if (marker.markerType) return MARKER_TYPE_COLORS[marker.markerType];
  return marker.color;
}

function MarkerTypeIcon({ marker, className }: { marker: Marker; className?: string }) {
  switch (marker.markerType) {
    case 'audio': return <AudioWaveform className={className} />;
    case 'compression': return <ChevronsRightLeft className={className} />;
    case 'planned': return <Clock className={className} />;
    case 'anchor': return <Anchor className={className} />;
    default: return null;
  }
}

interface TimelineProps {
  markers: Marker[];
  onMarkerClick?: (marker: Marker) => void;
  onCreateMarker: () => void;
  onCreateAnchor?: () => void | Promise<void>;
  isAuthenticated?: boolean;
}

type ViewMode = 'day' | 'week';

export function Timeline({ markers, onMarkerClick, onCreateMarker, onCreateAnchor, isAuthenticated }: TimelineProps) {
  const [adminMode] = useAdminMode();
  const showAnchorButton = adminMode && isAuthenticated && !!onCreateAnchor;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 seconds

    return () => clearInterval(timer);
  }, []);

  // Helper: Check if marker should appear on a specific date
  const shouldShowMarker = (marker: Marker, date: Date): boolean => {
    const markerDate = new Date(marker.time);
    
    // Non-recurring marker - exact date match
    if (!marker.recurring) {
      return markerDate.toDateString() === date.toDateString();
    }

    // Recurring marker - check if date is after marker creation date
    const markerStartDate = new Date(markerDate);
    markerStartDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < markerStartDate) {
      return false; // Don't show recurring marker before it was created
    }

    // Recurring marker - check recurrence pattern
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    
    // Check if recurrence has ended
    if (marker.recurrenceEndDate) {
      const endDate = new Date(marker.recurrenceEndDate);
      if (date > endDate) return false;
    }

    // Check recurrence pattern
    switch (marker.recurrencePattern) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday-Friday
      case 'weekends':
        return dayOfWeek === 0 || dayOfWeek === 6; // Saturday-Sunday
      case 'custom':
        return marker.recurrenceDays?.includes(dayOfWeek) || false;
      default:
        return false;
    }
  };

  // Get markers for a specific date (including recurring ones)
  const getMarkersForDate = (date: Date): Marker[] => {
    return markers.filter(m => shouldShowMarker(m, date))
      .sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeA - timeB;
      });
  };

  // Navigate dates
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Get week days starting from Monday
  const getWeekDays = (baseDate: Date): Date[] => {
    const days: Date[] = [];
    const monday = new Date(baseDate);
    const dayOfWeek = monday.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Get to Monday
    monday.setDate(monday.getDate() + diff);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  const todaysMarkers = getMarkersForDate(selectedDate);

  // Calculate position on timeline
  const getTimePosition = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    return ((hours * 60 + minutes) / (24 * 60)) * 100;
  };

  const currentPosition = getTimePosition(currentTime);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50/50 to-orange-50/50">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-amber-200/50">
        <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
          <h2 className="text-lg md:text-2xl font-light text-gray-800">Timeline</h2>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-amber-200/50">
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className={viewMode === 'day' ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600' : ''}
              >
                <Square className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Tag</span>
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={viewMode === 'week' ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600' : ''}
              >
                <Grid3x3 className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Woche</span>
              </Button>
            </div>

            {/* Admin-only: Anker manuell setzen (ersatz fuer Armreif-Trigger) */}
            {showAnchorButton && (
              <Button
                onClick={() => onCreateAnchor?.()}
                size="sm"
                variant="outline"
                title="Anker jetzt setzen (Admin-Modus)"
                className="border-2"
                style={{ borderColor: '#b85555', color: '#b85555' }}
              >
                <Anchor className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Anker</span>
              </Button>
            )}

            {/* "+ Marker" nur Desktop — Mobile nutzt FAB */}
            <Button
              onClick={onCreateMarker}
              size="sm"
              className="hidden md:inline-flex bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Marker
            </Button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 md:gap-2 flex-1 min-w-0">
            <Button variant="ghost" size="sm" onClick={navigatePrevious} className="px-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="text-xs md:text-sm text-gray-700 flex-1 md:min-w-[250px] md:flex-none text-center truncate">
              {viewMode === 'day' ? (
                <>
                  <span className="md:hidden">
                    {selectedDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'short' })}
                  </span>
                  <span className="hidden md:inline">
                    {selectedDate.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </>
              ) : (
                <>
                  <span className="md:hidden">
                    KW {getWeekNumber(selectedDate)}
                  </span>
                  <span className="hidden md:inline">
                    KW {getWeekNumber(selectedDate)} · {weekDays[0].toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} - {weekDays[6].toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </>
              )}
            </div>

            <Button variant="ghost" size="sm" onClick={navigateNext} className="px-2">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={goToToday} className="px-2 md:px-3">
            <CalendarIcon className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Heute</span>
          </Button>
        </div>
      </div>

      {/* Timeline Visualisierung */}
      {viewMode === 'day' ? (
        <DayView 
          date={selectedDate}
          markers={todaysMarkers}
          currentTime={currentTime}
          currentPosition={currentPosition}
          onMarkerClick={onMarkerClick}
          onCreateMarker={onCreateMarker}
        />
      ) : (
        <WeekView
          weekDays={weekDays}
          getMarkersForDate={getMarkersForDate}
          onMarkerClick={onMarkerClick}
          onCreateMarker={onCreateMarker}
        />
      )}
    </div>
  );
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ============================================================================
// Day View Component
// ============================================================================

interface DayViewProps {
  date: Date;
  markers: Marker[];
  currentTime: Date;
  currentPosition: number;
  onMarkerClick?: (marker: Marker) => void;
  onCreateMarker: () => void;
}

function DayView({ date, markers, currentTime, currentPosition, onMarkerClick, onCreateMarker }: DayViewProps) {
  const nowHM = currentTime.toTimeString().slice(0, 5);
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#faf5eb' }}>
      <div className="px-3 md:px-4 py-4">
        {markers.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#a89f8d' }}>
            <p className="text-[13px] leading-relaxed mb-2">Noch kein Marker an diesem Tag.</p>
            <p className="text-[12px]">Setze einen über das Plus-Symbol.</p>
          </div>
        ) : (
          <div>
            {markers.map((marker) => (
              <MarkerRow
                key={`${marker.id}-${date.toISOString()}`}
                marker={marker}
                isToday={isToday}
                isPast={isPast}
                nowHM={nowHM}
                onClick={() => onMarkerClick?.(marker)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Week View Component
// ============================================================================

interface WeekViewProps {
  weekDays: Date[];
  getMarkersForDate: (date: Date) => Marker[];
  onMarkerClick?: (marker: Marker) => void;
  onCreateMarker: () => void;
}

function WeekView({ weekDays, getMarkersForDate, onMarkerClick, onCreateMarker }: WeekViewProps) {
  const today = new Date();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const markers = getMarkersForDate(day);
          const isToday = day.toDateString() === today.toDateString();

          return (
            <div
              key={day.toISOString()}
              className={`rounded-2xl border-2 overflow-hidden ${
                isToday ? 'border-amber-400 bg-amber-50/30' : 'border-amber-200/50 bg-white'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 text-center border-b ${
                isToday ? 'border-amber-300 bg-gradient-to-r from-amber-400 to-amber-500 text-white' : 'border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50'
              }`}>
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-amber-100' : 'text-gray-500'}`}>
                  {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-light ${isToday ? 'text-white' : 'text-gray-800'}`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Markers */}
              <div className="p-2 space-y-2 min-h-[200px]">
                {markers.length === 0 ? (
                  <div className="text-center py-8">
                    <Circle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs text-gray-400">Keine Marker</p>
                  </div>
                ) : (
                  markers.map((marker) => (
                    <WeekMarkerCard
                      key={`${marker.id}-${day.toISOString()}`}
                      marker={marker}
                      onClick={() => onMarkerClick?.(marker)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Marker Row Component (Day View) — AURUM-Stil
// Layout: 40px time | 42px track+bubble | 1fr content
// Anker = kleiner roter Kreis OHNE Card. Andere Typen = 40x40 Squircle + Card rechts.
// ============================================================================

interface MarkerRowProps {
  marker: Marker;
  isToday: boolean;
  isPast: boolean;
  nowHM: string;
  onClick: () => void;
}

function MarkerRow({ marker, isToday, isPast, nowHM, onClick }: MarkerRowProps) {
  const time = new Date(marker.time);
  const timeStr = time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const type = marker.markerType;
  const isAnchor = type === 'anchor';

  // Geplant + in Vergangenheit (passed) → durchgestrichen
  const passed = type === 'planned' && (isPast || (isToday && timeStr <= nowHM));
  const done = marker.completed || passed;

  return (
    <div
      onClick={onClick}
      className="grid items-start cursor-pointer min-h-[58px] mb-0.5 group"
      style={{ gridTemplateColumns: '40px 42px 1fr' }}
    >
      {/* Spalte 1: Zeit */}
      <div
        className="text-right pr-2 pt-3 text-[11px] tabular-nums leading-tight"
        style={{ color: '#a89f8d' }}
      >
        {timeStr}
      </div>

      {/* Spalte 2: Track mit vertikaler Linie + Bubble */}
      <div className="relative min-h-[58px]">
        {/* Vertikale Linie */}
        <div
          className="absolute w-0.5 rounded"
          style={{ left: '19px', top: 0, bottom: 0, background: '#e5dcc8' }}
        />
        {/* Bubble */}
        {isAnchor ? (
          <div
            className="absolute rounded-full transition-transform group-hover:scale-110"
            style={{
              left: '10px',
              top: '18px',
              width: '20px',
              height: '20px',
              background: '#b85555',
              boxShadow: '0 1px 3px rgba(184,85,85,0.35)',
              zIndex: 1,
            }}
          />
        ) : (
          <div
            className={`absolute flex items-center justify-center text-white transition-transform group-hover:scale-105 ${passed ? 'opacity-85' : ''}`}
            style={{
              left: 0,
              top: '8px',
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: type ? MARKER_TYPE_COLORS[type] : marker.color,
              boxShadow: '0 2px 6px rgba(46,40,32,0.12)',
              border: type === 'planned' ? `2px ${passed ? 'solid' : 'dashed'} rgba(255,255,255,0.55)` : undefined,
              zIndex: 1,
            }}
          >
            <MarkerTypeIcon marker={marker} className="w-[18px] h-[18px]" />
          </div>
        )}
      </div>

      {/* Spalte 3: Content (nur fuer non-anchor) */}
      {isAnchor ? (
        <div />
      ) : (
        <div className="pt-2 pr-2">
          <small
            className="block text-[9px] uppercase tracking-wider mb-0.5"
            style={{
              color: '#a89f8d',
              textDecoration: done ? 'line-through' : undefined,
              opacity: done ? 0.6 : 1,
            }}
          >
            {type ? MARKER_TYPE_LABELS[type] : 'Marker'}
          </small>
          <strong
            className="block text-[15px] font-semibold leading-tight"
            style={{
              color: '#2e2820',
              textDecoration: done ? 'line-through' : undefined,
              opacity: done ? 0.6 : 1,
            }}
          >
            {marker.title}
          </strong>
          {type === 'audio' && (marker.summary || marker.transcript || marker.sub) && (
            <p className="mt-1 text-[12px] leading-snug line-clamp-2" style={{ color: '#7a7062' }}>
              {marker.summary || marker.transcript || marker.sub}
            </p>
          )}
          {type === 'compression' && marker.sub && (
            <p className="mt-1 text-[12px] leading-snug" style={{ color: '#7a7062' }}>
              {marker.sub}
            </p>
          )}
          {type === 'anchor' && marker.locationLabel && (
            <p className="mt-1 text-[12px] leading-snug" style={{ color: '#7a7062' }}>
              {marker.locationLabel}
            </p>
          )}

          {marker.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {marker.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: '#f2ecdf', color: '#7a7062' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Week Marker Card Component (Week View)
// ============================================================================

interface WeekMarkerCardProps {
  marker: Marker;
  onClick: () => void;
}

function WeekMarkerCard({ marker, onClick }: WeekMarkerCardProps) {
  const time = new Date(marker.time);

  return (
    <div
      onClick={onClick}
      className={`
        relative p-2 rounded-lg cursor-pointer transition-all group
        border-l-4
        ${marker.completed ? 'bg-amber-50/50 opacity-70' : 'bg-white hover:bg-amber-50/30'}
      `}
      style={{ borderLeftColor: markerColor(marker) }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          {/* Zeit + Typ-Icon */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
            <MarkerTypeIcon marker={marker} className="w-3 h-3" />
            <span>
              {marker.duration === -1
                ? 'Ganztägig'
                : time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Titel */}
          <div className={`text-xs font-medium truncate ${marker.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {marker.title}
          </div>

          {/* Wiederholung Icon */}
          {marker.recurring && (
            <div className="mt-1">
              <Repeat className="w-3 h-3 text-amber-500" />
            </div>
          )}
        </div>

        {/* Status */}
        {marker.completed && (
          <Check className="w-3 h-3 text-amber-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}