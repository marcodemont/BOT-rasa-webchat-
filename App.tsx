import { AuthProvider, useAuth } from './modules/auth/AuthProvider';
import { SystemProvider, useSystem } from './modules/systems/SystemProvider';
import { AurumAuthScreen } from './modules/auth/AurumAuthScreen';
import { AurumCore } from './modules/AURUM/AurumCore';
import { ArgentumCore } from './modules/ARGENTUM/ArgentumCore';
import { ErrorBoundary } from './modules/dev/ErrorBoundary';
import { ToastProvider } from './modules/ui/ToastNotification';
import { SystemToggle } from './modules/systems/SystemToggle';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

function AppContent() {
  const { user, accessToken, isLoading, signOut } = useAuth();
  const { currentSystem, isTransitioning, toggleSystem } = useSystem();
  const [forceAuthScreen, setForceAuthScreen] = useState(false);

  // Reset Force-Flag, sobald wieder ein User da ist
  useEffect(() => {
    if (user) setForceAuthScreen(false);
  }, [user]);

  const handleLogout = useCallback(async () => {
    try { await signOut(); } catch { /* no-op fuer Demo */ }
    setForceAuthScreen(true);
  }, [signOut]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading AURUM...</p>
        </div>
      </div>
    );
  }

  // Demo nur wenn AURUM-System UND nicht explizit Login angefordert
  const allowDemoMode = currentSystem === 'AURUM' && !forceAuthScreen;

  if (!user && !allowDemoMode) {
    return <AurumAuthScreen />;
  }

  // Render system toggle button (always visible when logged in)
  return (
    <div className="relative min-h-screen">
      {/* Session Monitor - handles automatic logout on session expiration */}
      {user && <SystemToggle />}
      
      {/* Show transition overlay if transitioning */}
      {isTransitioning && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-2" />
            <p className="text-gray-700 text-sm">Switching systems...</p>
          </div>
        </div>
      )}
      
      {/* Switch between two complete apps based on current system */}
      {/* Use key prop to force complete remount on system change */}
      {currentSystem === 'ARGENTUM' ? (
        <ArgentumCore key="argentum" accessToken={accessToken} onLogout={handleLogout} />
      ) : (
        <AurumCore key="aurum" accessToken={accessToken || null} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <SystemProvider>
            <AppContent />
          </SystemProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}