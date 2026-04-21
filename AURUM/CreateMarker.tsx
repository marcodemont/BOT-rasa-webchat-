/**
 * AURUM Create Marker Component
 * Wizard-ähnlicher Flow zum Erstellen eines Markers
 * Unterstützt wiederholende Marker
 */

import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Clock, Repeat } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Marker } from './types';

interface CreateMarkerProps {
  onClose: () => void;
  onSave: (marker: Omit<Marker, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialDate?: Date;
  presetType?: 'audio' | 'planned' | 'event' | 'compression';
}

const COLORS = [
  { name: 'Koralle', value: '#FF6B6B' },
  { name: 'Gold', value: '#FFD93D' },
  { name: 'Grün', value: '#6BCB77' },
  { name: 'Blau', value: '#4D96FF' },
  { name: 'Lila', value: '#9D84B7' },
  { name: 'Rosa', value: '#FFB6C1' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const WEEKDAYS = [
  { short: 'Mo', full: 'Montag', value: 1 },
  { short: 'Di', full: 'Dienstag', value: 2 },
  { short: 'Mi', full: 'Mittwoch', value: 3 },
  { short: 'Do', full: 'Donnerstag', value: 4 },
  { short: 'Fr', full: 'Freitag', value: 5 },
  { short: 'Sa', full: 'Samstag', value: 6 },
  { short: 'So', full: 'Sonntag', value: 0 },
];

export function CreateMarker({ onClose, onSave, initialDate = new Date(), presetType }: CreateMarkerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [title, setTitle] = useState(
    presetType === 'event' ? 'Ereignis' :
    presetType === 'planned' ? 'Termin' :
    presetType === 'compression' ? 'Kompression' :
    presetType === 'audio' ? 'Audiomarker' : ''
  );
  const [color, setColor] = useState(
    presetType === 'audio' ? '#b89668' :
    presetType === 'compression' ? '#c08a7a' :
    presetType === 'planned' || presetType === 'event' ? '#b5c5d5' :
    COLORS[0].value
  );
  const [duration, setDuration] = useState<number | undefined>(30);
  const [time, setTime] = useState(() => {
    const now = new Date(initialDate);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    return now;
  });
  
  // Wiederholungs-State
  const [recurring, setRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekdays' | 'weekends' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<number[]>([]);

  const handleNext = () => {
    if (step < 5) setStep((step + 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleSave = () => {
    const mappedType =
      presetType === 'audio' ? 'audio' :
      presetType === 'compression' ? 'compression' :
      presetType === 'planned' || presetType === 'event' ? 'planned' :
      undefined;

    onSave({
      title:
        title ||
        (presetType === 'event' ? 'Ereignis' :
        presetType === 'planned' ? 'Termin' :
        presetType === 'compression' ? 'Kompression' :
        presetType === 'audio' ? 'Audiomarker' : 'Unbenannter Marker'),
      time: time.toISOString(),
      duration,
      color,
      markerType: mappedType,
      completed: false,
      noteIds: [],
      tags: [],
      recurring,
      recurrencePattern: recurring ? recurrencePattern : undefined,
      recurrenceDays: recurring && recurrencePattern === 'custom' ? customDays : undefined,
      recurrenceEndDate: null,
    });
    onClose();
  };

  const progress = (step / 5) * 100;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="relative p-6 border-b border-amber-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="h-1.5 bg-gray-100 rounded-full mb-4">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <h2 className="text-2xl font-light text-gray-800">
            {step === 1 && 'Marker erstellen'}
            {step === 2 && 'Welche Farbe?'}
            {step === 3 && 'Wie lange?'}
            {step === 4 && 'Zu welcher Uhrzeit?'}
            {step === 5 && 'Wiederholung?'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Schritt {step} von 5
          </p>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[320px]">
          {/* Step 1: Titel */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Was möchtest du tun?
                </span>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Einkaufen gehen, E-Mails beantworten..."
                  className="text-lg"
                  autoFocus
                />
              </label>
              <p className="text-xs text-gray-500">
                Gib deinem Marker einen prägnanten Titel
              </p>
            </div>
          )}

          {/* Step 2: Farbe */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full shadow-md"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Vorschau</p>
                    <p className="font-medium text-gray-800">{title || 'Unbenannter Marker'}</p>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="grid grid-cols-6 gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`
                        w-12 h-12 rounded-full transition-transform hover:scale-110
                        ${color === c.value ? 'ring-4 ring-amber-400 ring-offset-2' : ''}
                      `}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Dauer */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full shadow-md flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Vorschau</p>
                    <p className="font-medium text-gray-800">{title || 'Unbenannter Marker'}</p>
                    {duration === -1 ? (
                      <p className="text-xs text-gray-500">Ganztägig</p>
                    ) : duration ? (
                      <p className="text-xs text-gray-500">{duration} Minuten</p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Duration Options */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`
                        py-3 px-4 rounded-xl font-medium transition-all
                        ${duration === d 
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {d < 60 ? `${d}min` : `${d / 60}h`}
                    </button>
                  ))}
                </div>
                
                {/* Custom duration input */}
                <div className="mt-3 p-3 bg-white rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Individuelle Dauer (Minuten)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    placeholder="z.B. 45"
                    value={typeof duration === 'number' && duration > 0 && !DURATIONS.includes(duration) ? duration : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0) setDuration(val);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>

                {/* All-day and no duration options */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setDuration(-1)} // -1 represents all-day
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${duration === -1
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    Ganztägig
                  </button>
                  <button
                    onClick={() => setDuration(undefined)}
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${duration === undefined 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                      }
                    `}
                  >
                    Keine feste Dauer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Zeit */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full shadow-md flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">
                      {duration === -1 ? (
                        'Ganztägig'
                      ) : (
                        <>
                          {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          {duration && duration > 0 && ` – ${new Date(time.getTime() + duration * 60000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
                        </>
                      )}
                    </p>
                    <p className="font-medium text-gray-800">{title || 'Unbenannter Marker'}</p>
                  </div>
                </div>
              </div>

              {/* Time Picker */}
              <div className="flex items-center justify-center gap-4">
                <input
                  type="time"
                  value={`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newTime = new Date(time);
                    newTime.setHours(hours);
                    newTime.setMinutes(minutes);
                    setTime(newTime);
                  }}
                  className="text-4xl font-light text-center bg-transparent border-none focus:outline-none text-gray-800"
                />
              </div>
            </div>
          )}

          {/* Step 5: Wiederholung */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full shadow-md flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Repeat className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Vorschau</p>
                    <p className="font-medium text-gray-800">{title || 'Unbenannter Marker'}</p>
                    {recurring ? (
                      <>
                        {recurrencePattern === 'daily' && <p className="text-xs text-gray-500">Täglich</p>}
                        {recurrencePattern === 'weekdays' && <p className="text-xs text-gray-500">Wochentage</p>}
                        {recurrencePattern === 'weekends' && <p className="text-xs text-gray-500">Wochenende</p>}
                        {recurrencePattern === 'custom' && (
                          <p className="text-xs text-gray-500">
                            {customDays.map(day => WEEKDAYS.find(w => w.value === day)?.short).join(', ')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">Keine Wiederholung</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recurrence Options */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setRecurring(true);
                      setRecurrencePattern('daily');
                    }}
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${recurring && recurrencePattern === 'daily'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    Täglich
                  </button>
                  <button
                    onClick={() => {
                      setRecurring(true);
                      setRecurrencePattern('weekdays');
                    }}
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${recurring && recurrencePattern === 'weekdays'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    Wochentage
                  </button>
                  <button
                    onClick={() => {
                      setRecurring(true);
                      setRecurrencePattern('weekends');
                    }}
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${recurring && recurrencePattern === 'weekends'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    Wochenende
                  </button>
                  <button
                    onClick={() => {
                      setRecurring(true);
                      setRecurrencePattern('custom');
                    }}
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${recurring && recurrencePattern === 'custom'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    Benutzerdefiniert
                  </button>
                </div>

                {/* Custom Days Selection */}
                {recurrencePattern === 'custom' && (
                  <div className="mt-3 p-3 bg-white rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wochentage auswählen
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {WEEKDAYS.map(day => (
                        <button
                          key={day.value}
                          onClick={() => {
                            if (customDays.includes(day.value)) {
                              setCustomDays(customDays.filter(d => d !== day.value));
                            } else {
                              setCustomDays([...customDays, day.value]);
                            }
                          }}
                          className={`
                            py-2 rounded-xl text-sm font-medium transition-all
                            ${customDays.includes(day.value)
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md' 
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          {day.short}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Recurrence Option */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setRecurring(false)}
                    className={`
                      py-2 rounded-xl text-sm font-medium transition-all
                      ${!recurring 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                      }
                    `}
                  >
                    Keine Wiederholung
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : handleBack}
            className="text-gray-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Abbrechen' : 'Zurück'}
          </Button>

          {step < 5 ? (
            <Button
              onClick={handleNext}
              disabled={step === 1 && !title.trim()}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
            >
              Weiter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={recurring && recurrencePattern === 'custom' && customDays.length === 0}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 mr-2" />
              Erstellen
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
