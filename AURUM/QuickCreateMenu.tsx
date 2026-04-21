import React from 'react';
import { Anchor, AudioWaveform, CalendarClock, CalendarDays, ChevronsRightLeft, X } from 'lucide-react';

export type QuickCreateType = 'anchor' | 'audio' | 'planned' | 'event' | 'compression';

interface QuickCreateMenuProps {
  adminMode: boolean;
  onClose: () => void;
  onSelect: (type: QuickCreateType) => void;
}

const ADMIN_ITEMS: Array<{ type: QuickCreateType; title: string; description: string; icon: React.ReactNode }> = [
  { type: 'anchor', title: 'Anker', description: 'Leerer Zeitpunkt mit optionalem Ort.', icon: <Anchor className="w-5 h-5" /> },
  { type: 'audio', title: 'Audiomarker', description: 'Sprachaufnahme mit Upload und optionalem Transkript.', icon: <AudioWaveform className="w-5 h-5" /> },
  { type: 'planned', title: 'Termin planen', description: 'Verbindlichen Zeitpunkt mit Ring-Rückmeldung einplanen.', icon: <CalendarClock className="w-5 h-5" /> },
  { type: 'event', title: 'Ereignis planen', description: 'Event oder Anlass erfassen, inkl. optionaler Details.', icon: <CalendarDays className="w-5 h-5" /> },
  { type: 'compression', title: 'Kompression protokollieren', description: 'Momentaufnahme eines haptischen Eingriffs.', icon: <ChevronsRightLeft className="w-5 h-5" /> },
];

const USER_ITEMS = ADMIN_ITEMS.filter(i => i.type !== 'anchor' && i.type !== 'audio');

export function QuickCreateMenu({ adminMode, onClose, onSelect }: QuickCreateMenuProps) {
  const items = adminMode ? ADMIN_ITEMS : USER_ITEMS;

  return (
    <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-end justify-center p-3 md:p-6">
      <div className="w-full max-w-xl rounded-3xl border border-amber-200 bg-[#f6f2e8] shadow-2xl overflow-hidden">
        <div className="px-5 pt-3 pb-2">
          <div className="w-10 h-1 bg-[#d4c9af] rounded-full mx-auto mb-3" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[28px] leading-none font-semibold text-[#2d2a22]">Planung &amp; Protokoll</h3>
              <p className="mt-2 text-sm text-[#6f6758]">Wähle eine Aktion aus.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-amber-100/60 text-[#6f6758]" aria-label="Schliessen">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.type}
              onClick={() => onSelect(item.type)}
              className="w-full text-left rounded-2xl border border-[#e9dfcc] bg-white px-4 py-3 hover:bg-amber-50/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d7c9ae] text-white flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#2d2a22]">{item.title}</p>
                  <p className="text-sm text-[#6f6758]">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
