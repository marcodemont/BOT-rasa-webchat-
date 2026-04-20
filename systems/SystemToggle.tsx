/**
 * System Toggle - Fixed position toggle button
 * Simple, reliable system switcher - collapses after 5 seconds
 */

import React, { useState, useEffect } from 'react';
import { useSystem } from './SystemProvider';
import { ScrollText, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SystemToggle() {
  const { currentSystem, toggleSystem, theme } = useSystem();
  const isAurum = currentSystem === 'AURUM';
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    console.log('🔘 Toggle clicked! Current:', currentSystem);
    
    // If collapsed, expand first before toggling
    if (isCollapsed) {
      setIsCollapsed(false);
      // Auto-collapse again after 5 seconds
      setTimeout(() => setIsCollapsed(true), 5000);
    } else {
      // If expanded, toggle system
      toggleSystem();
      console.log('✅ Toggle executed');
    }
  };

  console.log('🎨 SystemToggle render - Current:', currentSystem);

  return (
    <motion.button
      onClick={handleClick}
      animate={{
        width: isCollapsed ? '48px' : 'auto',
        padding: isCollapsed ? '12px' : '8px 16px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50
        flex items-center justify-center gap-2 rounded-full
        font-medium text-sm
        shadow-lg hover:shadow-xl
        transition-colors duration-300 ease-in-out
        hover:scale-105 active:scale-95
        ${isAurum 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' 
          : 'bg-gradient-to-r from-slate-600 to-blue-600 text-white hover:from-slate-700 hover:to-blue-700'
        }
      `}
      title={`Switch to ${isAurum ? 'ARGENTUM' : 'AURUM'}`}
      aria-label={`Switch to ${isAurum ? 'ARGENTUM' : 'AURUM'} system`}
    >
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {isAurum ? (
              <ScrollText className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {isAurum ? (
              <>
                <ScrollText className="w-4 h-4" />
                <span className="opacity-60">→</span>
                <Moon className="w-4 h-4 opacity-60" />
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="opacity-60">→</span>
                <ScrollText className="w-4 h-4 opacity-60" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}