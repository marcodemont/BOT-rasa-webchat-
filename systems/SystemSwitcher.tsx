/**
 * System Switcher Button
 * Minimal toggle between AURUM (Au) and ARGENTUM (Ag)
 */

import { motion } from 'motion/react';
import { useSystem } from './SystemProvider';

export function SystemSwitcher() {
  const { currentSystem, toggleSystem, theme, isTransitioning } = useSystem();
  const isAurum = currentSystem === 'AURUM';

  return (
    <motion.button
      onClick={toggleSystem}
      disabled={isTransitioning}
      className={`
        relative px-3 py-1.5 rounded-md font-mono text-xs
        transition-all duration-300 ease-in-out
        flex items-center gap-1.5
        ${isAurum 
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
        }
        ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        border border-current/20
      `}
      whileHover={!isTransitioning ? { scale: 1.05 } : {}}
      whileTap={!isTransitioning ? { scale: 0.95 } : {}}
      title={isTransitioning 
        ? 'Switching...' 
        : `Switch to ${isAurum ? 'ARGENTUM (Ag)' : 'AURUM (Au)'}`
      }
    >
      {/* Current System Chemical Symbol */}
      <span className="font-bold text-sm">
        {isTransitioning ? '⟳' : (isAurum ? 'Au' : 'Ag')}
      </span>
    </motion.button>
  );
}