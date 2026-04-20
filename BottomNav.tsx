/**
 * Mobile Bottom-Nav (analog AURUM-Pattern: 3 Items + zentraler FAB-Slot ueber der Nav).
 * Nur sichtbar auf <md (iPhone, kleine Screens). Beruecksichtigt iOS Safe-Area unten.
 */

import React from 'react';
import { Calendar, ScrollText, Settings as SettingsIcon, Plus } from 'lucide-react';

export type NavView = 'timeline' | 'list' | 'settings';

interface BottomNavProps {
  active: NavView;
  onSelect: (view: NavView) => void;
  onCreate?: () => void;
  showFab?: boolean;
}

const ITEMS: Array<{ id: NavView; label: string; Icon: typeof Calendar }> = [
  { id: 'timeline', label: 'Timeline', Icon: Calendar },
  { id: 'list', label: 'Sheets', Icon: ScrollText },
  { id: 'settings', label: 'Einstellungen', Icon: SettingsIcon },
];

export function BottomNav({ active, onSelect, onCreate, showFab = true }: BottomNavProps) {
  return (
    <>
      {showFab && onCreate && (
        <button
          onClick={onCreate}
          aria-label="Neuer Marker"
          className="md:hidden fixed right-5 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-amber-200/50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch justify-around h-16">
          {ITEMS.map(({ id, label, Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
