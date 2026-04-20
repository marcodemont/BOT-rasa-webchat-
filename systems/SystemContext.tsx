import React, { createContext, useContext, useState, useEffect } from 'react';

export type SystemType = 'AURUM' | 'ARGENTUM';

interface SystemContextType {
  currentSystem: SystemType;
  toggleSystem: () => void;
  setSystem: (system: SystemType) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const [currentSystem, setCurrentSystem] = useState<SystemType>('AURUM');

  // Load saved system preference from localStorage
  useEffect(() => {
    const savedSystem = localStorage.getItem('preferredSystem') as SystemType;
    if (savedSystem === 'AURUM' || savedSystem === 'ARGENTUM') {
      setCurrentSystem(savedSystem);
    }
  }, []);

  const toggleSystem = () => {
    const newSystem = currentSystem === 'AURUM' ? 'ARGENTUM' : 'AURUM';
    setCurrentSystem(newSystem);
    localStorage.setItem('preferredSystem', newSystem);
  };

  const setSystem = (system: SystemType) => {
    setCurrentSystem(system);
    localStorage.setItem('preferredSystem', system);
  };

  return (
    <SystemContext.Provider
      value={{
        currentSystem,
        toggleSystem,
        setSystem,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
}
