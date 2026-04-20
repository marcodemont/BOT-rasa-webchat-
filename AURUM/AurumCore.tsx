/**
 * AURUM Core Module
 * Main component integrating Sheet, Layers, and Archive
 */

import React, { useState, useEffect } from 'react';
import { ScrollText, LogOut, LogIn, Square, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { WelcomeScreen } from './WelcomeScreen';
import { PhilosophyFooter } from './PhilosophyFooter';
import { Timeline } from './Timeline';
import { CreateMarker } from './CreateMarker';
import { NotesView } from './NotesView';
import { SettingsView } from './SettingsView';
import { MarkerDetail } from './MarkerDetail';
import { aurumClient } from './aurum-client';
import { fetchMarkersForRange, mapRowToMarker, createAnchor, cleanupOldArchivedMarkers } from './markers-api';
import { cleanupOldArchivedNotes } from './notes-api';
import { BottomNav } from './BottomNav';
import { useSystem } from '../systems/SystemProvider';
import type { Marker } from './types';

type View = 'timeline' | 'list' | 'settings';

interface AurumCoreProps {
  accessToken?: string | null;
  onLogout?: () => void;
}

export function AurumCore({ accessToken, onLogout }: AurumCoreProps) {
  const { theme } = useSystem();
  const [currentView, setCurrentView] = useState<View>('timeline');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCreateMarker, setShowCreateMarker] = useState(false);
  const [detailMarker, setDetailMarker] = useState<Marker | null>(null);
  const [useLocalMode, setUseLocalMode] = useState(false); // Fallback to localStorage if no auth
  const [markers, setMarkers] = useState<Marker[]>([]);

  // Load markers: Supabase wenn authentifiziert, sonst localStorage als Demo-Fallback
  const loadMarkersFromSupabase = async () => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 31);
    const to = new Date(today);
    to.setDate(to.getDate() + 31);
    const rows = await fetchMarkersForRange(from, to);
    setMarkers(rows.map(mapRowToMarker));
  };

  useEffect(() => {
    if (useLocalMode) {
      const saved = localStorage.getItem('aurum-markers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const migratedMarkers = parsed.map((marker: any) => ({
            ...marker,
            recurring: marker.recurring ?? false,
            recurrencePattern: marker.recurrencePattern ?? undefined,
            recurrenceDays: marker.recurrenceDays ?? undefined,
            recurrenceEndDate: marker.recurrenceEndDate ?? null,
          }));
          setMarkers(migratedMarkers);
        } catch {
          setMarkers([]);
        }
      }
      return;
    }

    if (!isAuthenticated) return;

    let cancelled = false;
    (async () => {
      try {
        await loadMarkersFromSupabase();
        // Cleanup: archivierte Eintraege aelter als 60 Tage hard-deleten (fire & forget)
        Promise.all([cleanupOldArchivedMarkers(), cleanupOldArchivedNotes()])
          .then(([m, n]) => {
            if (m + n > 0) console.log(`AurumCore: Auto-Cleanup ${m} Markers + ${n} Notes geloescht (60-Tage-Regel)`);
          })
          .catch(err => console.warn('AurumCore: Cleanup-Fehler (nicht kritisch):', err));
      } catch (err) {
        if (!cancelled) console.error('AurumCore: Failed to load markers from Supabase:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, useLocalMode]);

  const handleCreateAnchor = async () => {
    try {
      await createAnchor();
      await loadMarkersFromSupabase();
    } catch (err) {
      console.error('Anker setzen fehlgeschlagen:', err);
      alert(`Anker konnte nicht gesetzt werden: ${err instanceof Error ? err.message : err}`);
    }
  };

  // localStorage-Persistenz nur im Demo-Mode (im Auth-Mode ist Supabase die Quelle)
  useEffect(() => {
    if (!useLocalMode) return;
    const timeoutId = setTimeout(() => {
      localStorage.setItem('aurum-markers', JSON.stringify(markers));
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [markers, useLocalMode]);

  // Set access token when available
  useEffect(() => {
    if (accessToken) {
      console.log('AurumCore: Setting access token');
      console.log('AurumCore: Token length:', accessToken.length);
      console.log('AurumCore: Token preview:', accessToken.substring(0, 20) + '...');
      
      // Validate token is not expired
      try {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = tokenPayload.exp * 1000;
        const now = Date.now();
        
        if (expiresAt < now) {
          console.warn('AurumCore: Token is expired, using local mode');
          setUseLocalMode(true);
          setIsAuthenticated(false);
        } else {
          console.log('AurumCore: Token is valid');
          aurumClient.setAccessToken(accessToken);
          setIsAuthenticated(true);
          setUseLocalMode(false);
        }
      } catch (error) {
        console.error('AurumCore: Failed to validate token, using local mode:', error);
        setUseLocalMode(true);
        setIsAuthenticated(false);
      }
      
      // Check if this is first visit
      const hasSeenWelcome = localStorage.getItem('aurum_welcome_seen');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    } else {
      console.log('AurumCore: No access token available, using local mode');
      aurumClient.setAccessToken(null);
      setIsAuthenticated(false);
      setUseLocalMode(true);
    }
    
    return () => {
      console.log('AurumCore: Cleanup');
    };
  }, [accessToken]);

  // Welcome screen handlers
  const handleWelcomeComplete = () => {
    localStorage.setItem('aurum_welcome_seen', 'true');
    setShowWelcome(false);
  };

  const handleWelcomeSkip = () => {
    localStorage.setItem('aurum_welcome_seen', 'true');
    setShowWelcome(false);
  };

  // Marker handlers
  const createMarker = async (markerData: Omit<Marker, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newMarker: Marker = {
      ...markerData,
      id: `marker-${Date.now()}`,
      userId: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Ensure recurrence fields exist
      recurring: markerData.recurring || false,
      recurrencePattern: markerData.recurrencePattern,
      recurrenceDays: markerData.recurrenceDays || [],
      recurrenceEndDate: markerData.recurrenceEndDate,
    };

    if (useLocalMode) {
      // Save to localStorage
      const updatedMarkers = [...markers, newMarker];
      setMarkers(updatedMarkers);
      localStorage.setItem('aurum-markers', JSON.stringify(updatedMarkers));
    } else {
      // TODO: API call
      setMarkers([...markers, newMarker]);
    }

    setShowCreateMarker(false);
  };

  const handleMarkerClick = (marker: Marker) => {
    setDetailMarker(marker);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} transition-colors duration-500`}>
      {/* Mobile Header (kompakt) */}
      <header className={`md:hidden border-b ${theme.navBorder} ${theme.navBg}`}>
        <div className="px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
              <Square className="w-4 h-4 text-white" />
            </div>
            <h1 className={`text-lg font-light ${theme.textPrimary}`}>{theme.name}</h1>
            {useLocalMode && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                Demo
              </span>
            )}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className={`p-2 ${theme.textSecondary}`}
              aria-label={useLocalMode ? 'Login' : 'Logout'}
            >
              {useLocalMode ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Desktop Navigation Bar */}
      <nav className={`hidden md:block border-b transition-all duration-500 ${theme.navBorder} ${theme.navBg}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500">
                <Square className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-light ${theme.textPrimary} transition-colors duration-500`}>
                {theme.name}
              </h1>
              {useLocalMode && (
                <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                  Demo Mode
                </span>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant={currentView === 'timeline' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('timeline')}
                className={currentView === 'timeline' ? `bg-gradient-to-r ${theme.buttonGradient} text-white` : theme.textSecondary}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('list')}
                className={currentView === 'list' ? `bg-gradient-to-r ${theme.buttonGradient} text-white` : theme.textSecondary}
              >
                <ScrollText className="w-4 h-4 mr-2" />
                Sheets
              </Button>
              <Button
                variant={currentView === 'settings' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('settings')}
                className={currentView === 'settings' ? `bg-gradient-to-r ${theme.buttonGradient} text-white` : theme.textSecondary}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>

              {onLogout && (
                <Button variant="ghost" onClick={onLogout} className={`${theme.textSecondary}`}>
                  {useLocalMode ? <LogIn className="w-4 h-4 mr-2" /> : <LogOut className="w-4 h-4 mr-2" />}
                  {useLocalMode ? 'Login' : 'Logout'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content (Bottom-Padding fuer fixed BottomNav auf Mobile) */}
      <main className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8 pb-24 md:pb-8">
        {showWelcome && (
          <WelcomeScreen
            onComplete={handleWelcomeComplete}
            onSkip={handleWelcomeSkip}
          />
        )}

        {currentView === 'timeline' && (
          <Timeline
            onMarkerClick={handleMarkerClick}
            onCreateMarker={() => setShowCreateMarker(true)}
            onCreateAnchor={handleCreateAnchor}
            isAuthenticated={isAuthenticated}
            markers={markers}
          />
        )}

        {currentView === 'list' && (
          <NotesView isAuthenticated={isAuthenticated} />
        )}

        {currentView === 'settings' && (
          <SettingsView
            isAuthenticated={isAuthenticated}
            onLogout={onLogout}
          />
        )}
      </main>

      {/* Create Marker Modal */}
      {showCreateMarker && (
        <CreateMarker
          onClose={() => setShowCreateMarker(false)}
          onSave={createMarker}
        />
      )}

      {/* Philosophy Footer (Desktop only — auf Mobile braucht die BottomNav den Platz) */}
      <div className="hidden md:block">
        <PhilosophyFooter />
      </div>

      {detailMarker && (
        <MarkerDetail
          marker={detailMarker}
          onClose={() => {
            console.log('[DEBUG] MarkerDetail.onClose triggered from:', new Error().stack);
            setDetailMarker(null);
          }}
          onChanged={loadMarkersFromSupabase}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav
        active={currentView}
        onSelect={(v) => setCurrentView(v)}
        onCreate={() => setShowCreateMarker(true)}
        showFab={currentView === 'timeline'}
      />
    </div>
  );
}