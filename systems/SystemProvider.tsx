/**
 * System Provider - AURUM vs ARGENTUM
 * Manages the dual philosophy system
 * 
 * AURUM (Gold) - Permanence, Warmth, Layering, Archive
 * ARGENTUM (Silver) - Transience, Coolness, Flatness, No Archive
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type SystemType = 'AURUM' | 'ARGENTUM';

interface SystemContextType {
  currentSystem: SystemType;
  setSystem: (system: SystemType) => void;
  toggleSystem: () => void;
  isTransitioning: boolean;
  theme: {
    // Color schemes
    gradient: string;
    bgGradient: string;
    buttonGradient: string;
    textPrimary: string;
    textSecondary: string;
    borderColor: string;
    cardBg: string;
    // Philosophy
    name: string;
    subtitle: string;
    icon: string;
  };
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within SystemProvider');
  }
  return context;
}

const AURUM_THEME = {
  gradient: 'from-amber-500 to-orange-500',
  bgGradient: 'from-amber-50 via-orange-50 to-white',
  buttonGradient: 'from-amber-500 to-orange-500',
  textPrimary: 'text-gray-800',
  textSecondary: 'text-gray-600',
  borderColor: 'border-amber-300',
  cardBg: 'bg-white',
  name: 'AURUM',
  subtitle: 'Gold • Permanence • Layers',
  icon: '🌟',
};

const ARGENTUM_THEME = {
  gradient: 'from-slate-600 to-blue-700',
  bgGradient: 'from-slate-900 via-blue-950 to-slate-950',
  buttonGradient: 'from-slate-600 to-blue-600',
  textPrimary: 'text-slate-100',
  textSecondary: 'text-slate-400',
  borderColor: 'border-slate-600',
  cardBg: 'bg-slate-800',
  name: 'ARGENTUM',
  subtitle: 'Silver • Transience • Flow',
  icon: '🌙',
};

const STORAGE_KEY = 'aurum_current_system';

export function SystemProvider({ children }: { children: React.ReactNode }) {
  // Initialize from localStorage
  const [currentSystem, setCurrentSystem] = useState<SystemType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        console.log('💾 Loaded from storage:', saved);
        if (saved === 'AURUM' || saved === 'ARGENTUM') {
          return saved as SystemType;
        }
      } catch (error) {
        console.error('Failed to load system preference:', error);
      }
    }
    console.log('🎯 Defaulting to AURUM');
    return 'AURUM';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Save to localStorage and update document class whenever system changes
  useEffect(() => {
    console.log('💾 Saving to localStorage:', currentSystem);
    try {
      localStorage.setItem(STORAGE_KEY, currentSystem);
      
      // Update document class for global styling
      if (currentSystem === 'ARGENTUM') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      
      console.log(`✨ System is now: ${currentSystem}`);
    } catch (error) {
      console.error('Failed to save system preference:', error);
    }
  }, [currentSystem]);

  const setSystem = useCallback((system: SystemType) => {
    console.log(`🔄 setSystem called: ${system}`);
    
    if (system === currentSystem) {
      console.log('⚠️ Already on this system');
      return;
    }
    
    console.log(`✅ Changing system from ${currentSystem} to ${system}`);
    setIsTransitioning(true);
    
    // Immediate change
    setCurrentSystem(system);
    
    // End transition after a moment
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentSystem]);

  const toggleSystem = useCallback(() => {
    const nextSystem = currentSystem === 'AURUM' ? 'ARGENTUM' : 'AURUM';
    console.log(`🔀 Toggling: ${currentSystem} -> ${nextSystem}`);
    setSystem(nextSystem);
  }, [currentSystem, setSystem]);

  const theme = currentSystem === 'AURUM' ? AURUM_THEME : ARGENTUM_THEME;

  const value: SystemContextType = {
    currentSystem,
    setSystem,
    toggleSystem,
    isTransitioning,
    theme,
  };

  console.log('🎨 SystemProvider render - Current:', currentSystem);

  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
}
