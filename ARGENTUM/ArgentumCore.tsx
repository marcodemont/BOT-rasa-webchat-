/**
 * ARGENTUM Core Module
 * Single surface, no archive, no layers, immediate operations
 */

import React, { useState, useEffect } from 'react';
import { Square, LogOut, Minimize2, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Surface } from './Surface';
import { FlattenMode } from './FlattenMode';
import { argentumClient } from './argentum-client';
import { useSystem } from '../systems/SystemProvider';

interface ArgentumCoreProps {
  accessToken?: string | null;
  onLogout?: () => void;
}

export function ArgentumCore({ accessToken, onLogout }: ArgentumCoreProps) {
  const [showFlatten, setShowFlatten] = useState(false);
  const [isTokenSet, setIsTokenSet] = useState(false);
  const { theme } = useSystem();

  // Set access token when available
  useEffect(() => {
    if (accessToken) {
      console.log('ArgentumCore: Setting access token');
      argentumClient.setAccessToken(accessToken);
      setIsTokenSet(true);
    } else {
      console.log('ArgentumCore: No access token available');
      argentumClient.setAccessToken(null);
      setIsTokenSet(false);
    }
    
    // Cleanup on unmount
    return () => {
      console.log('ArgentumCore: Cleanup');
      setIsTokenSet(false);
    };
  }, [accessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative">
      {/* AURUM Shadow - Light shining through ARGENTUM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/20 via-orange-100/15 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-20 -left-40 w-[500px] h-[500px] bg-gradient-to-tl from-amber-50/15 via-orange-50/10 to-transparent rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-amber-50/10 to-orange-50/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#b8814a] to-[#8c5530] rounded-sm flex items-center justify-center">
                <Square className="w-6 h-6 text-amber-50" />
              </div>
              <h1 className="text-2xl font-light text-gray-200">AURUM</h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowFlatten(!showFlatten)}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <Minimize2 className="w-4 h-4 mr-2" />
                Flatten Mode
              </Button>

              {onLogout && (
                <Button 
                  variant="ghost" 
                  onClick={onLogout}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {isTokenSet ? (
          <Surface isAuthenticated={true} />
        ) : (
          <div className="w-full max-w-4xl mx-auto text-center py-16">
            <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Initializing ARGENTUM...</p>
          </div>
        )}
      </main>

      {/* Flatten Mode Modal */}
      {showFlatten && (
        <FlattenMode onClose={() => setShowFlatten(false)} />
      )}

      {/* Anti-Philosophy Footer */}
      <footer className="border-t border-gray-400 bg-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Anti-Principles */}
            <div className="p-3 bg-gray-700 rounded border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-600 rounded-sm flex items-center justify-center text-gray-300 text-xs">
                  1
                </div>
                <p className="text-sm text-gray-300 font-medium">A sheet is temporary</p>
              </div>
            </div>

            <div className="p-3 bg-gray-700 rounded border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-600 rounded-sm flex items-center justify-center text-gray-300 text-xs">
                  2
                </div>
                <p className="text-sm text-gray-300 font-medium">No stacking, no layers</p>
              </div>
            </div>

            <div className="p-3 bg-gray-700 rounded border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-600 rounded-sm flex items-center justify-center text-gray-300 text-xs">
                  3
                </div>
                <p className="text-sm text-gray-300 font-medium">No preserved history</p>
              </div>
            </div>

            <div className="p-3 bg-gray-700 rounded border border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-600 rounded-sm flex items-center justify-center text-gray-300 text-xs">
                  4
                </div>
                <p className="text-sm text-gray-300 font-medium">Meaning in the moment</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400 italic">
                "ARGENTUM rejects accumulation. It values impermanence over continuity."
              </p>
              <p className="text-xs text-gray-500">
                No archive. No depth. Only present interaction.
              </p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}