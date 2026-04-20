/**
 * ARGENTUM Surface Component
 * Single, temporary, flat writing surface
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Download, Lock, Unlock, Clock, Zap, AlertCircle, WifiOff, Wifi } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner@2.0.3';
import { argentumClient } from './argentum-client';
import { useNetworkStatus } from '../utils/network';
import { announceToScreenReader } from '../../utils/accessibility';
import { analytics } from '../../utils/analytics';
import type { Surface as SurfaceType } from './types';

const EXPIRE_MINUTES = 30;

interface SurfaceProps {
  isAuthenticated?: boolean;
}

export function Surface({ isAuthenticated = true }: SurfaceProps) {
  const [surface, setSurface] = useState<SurfaceType | null>(null);
  const [content, setContent] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const networkStatus = useNetworkStatus();
  const isOnline = networkStatus.isOnline;

  // Define all callbacks FIRST before any useEffect that uses them
  const loadSurface = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await argentumClient.getCurrentSurface();
      if (data) {
        setSurface(data);
        setContent(data.content);
        setIsLocked(data.isLocked);
      }
    } catch (error) {
      console.error('Failed to load surface:', error);
      const message = error instanceof Error ? error.message : 'Failed to load surface';
      setError(message);
      
      // Only show toast if it's not a session expiration (handled globally)
      if (!message.includes('session has expired')) {
        toast.error('Error', { description: message });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!content.trim() && !surface?.content) return;
    
    // Save locally if offline
    if (!isOnline) {
      // Save to localStorage as fallback
      try {
        localStorage.setItem('argentum_offline_backup', content);
      } catch (e) {
        console.error('Failed to save offline backup:', e);
      }
      setHasUnsavedChanges(true);
      toast.warning('Offline mode', {
        description: 'Changes saved locally. Will sync when online.',
      });
      announceToScreenReader('Changes saved locally');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      const updated = await argentumClient.updateSurface(content);
      setSurface(updated);
      setHasUnsavedChanges(false);
      
      // Clear offline backup
      try {
        localStorage.removeItem('argentum_offline_backup');
      } catch (e) {
        console.error('Failed to clear offline backup:', e);
      }
      
      // Track save
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
      console.log('Surface saved:', { chars: content.length, words: wordCount });
      
      announceToScreenReader('Content saved successfully');
    } catch (error) {
      console.error('Failed to save surface:', error);
      const message = error instanceof Error ? error.message : 'Failed to save';
      setError(message);
      toast.error('Save failed', { description: message });
      announceToScreenReader('Save failed: ' + message, 'assertive');
      
      // Save locally as fallback
      try {
        localStorage.setItem('argentum_offline_backup', content);
      } catch (e) {
        console.error('Failed to save offline backup:', e);
      }
      setHasUnsavedChanges(true);
    } finally {
      setIsSaving(false);
    }
  }, [content, surface?.content, isOnline]);

  const handleClear = useCallback(async () => {
    if (!confirm('Delete all content? This action is final and cannot be undone.')) {
      return;
    }
    
    setError(null);
    try {
      await argentumClient.clearSurface();
      setContent('');
      setSurface(null);
      toast.success('Surface cleared', {
        description: 'All content has been permanently deleted',
      });
    } catch (error) {
      console.error('Failed to clear surface:', error);
      const message = error instanceof Error ? error.message : 'Failed to clear surface';
      setError(message);
      toast.error('Clear failed', { description: message });
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Nothing to export', {
        description: 'Surface is empty',
      });
      return;
    }
    
    setError(null);
    try {
      const exportData = isOnline 
        ? await argentumClient.exportSurface()
        : content; // Use local content if offline
      
      // Create download
      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `argentum_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export successful', {
        description: 'File downloaded to your device',
      });
      announceToScreenReader('Export successful');
      
      // Track export
      console.log('Surface exported:', 'txt');
    } catch (error) {
      console.error('Failed to export surface:', error);
      const message = error instanceof Error ? error.message : 'Failed to export';
      setError(message);
      toast.error('Export failed', { description: message });
      announceToScreenReader('Export failed: ' + message, 'assertive');
    }
  }, [content, isOnline]);

  const handleToggleLock = useCallback(async () => {
    if (!isOnline) {
      toast.error('Offline mode', {
        description: 'Cannot change lock status while offline',
      });
      return;
    }
    
    setError(null);
    try {
      const updated = await argentumClient.lockSurface(!isLocked);
      setSurface(updated);
      setIsLocked(updated.isLocked);
      
      toast.success(updated.isLocked ? 'Surface locked' : 'Surface unlocked', {
        description: updated.isLocked 
          ? 'Content will not auto-expire' 
          : `Content will expire in ${EXPIRE_MINUTES} minutes`,
      });
      announceToScreenReader(updated.isLocked ? 'Surface locked' : 'Surface unlocked');
      
      // Track lock
      console.log('Surface lock toggled:', updated.isLocked);
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      const message = error instanceof Error ? error.message : 'Failed to toggle lock';
      setError(message);
      toast.error('Lock failed', { description: message });
      announceToScreenReader('Lock failed: ' + message, 'assertive');
    }
  }, [isLocked, isOnline]);

  // NOW define all useEffects that use the callbacks above

  // Track page view
  useEffect(() => {
    analytics.trackPageView('argentum_surface');
  }, []);

  // Auto-backup when offline
  useEffect(() => {
    if (!isOnline && content) {
      try {
        localStorage.setItem('argentum_offline_backup', content);
        console.log('Offline backup saved');
      } catch (e) {
        console.error('Failed to save offline backup:', e);
      }
    }
  }, [content, isOnline]);

  // Restore from offline backup on load
  useEffect(() => {
    if (!isOnline && isLoading) {
      try {
        const backup = localStorage.getItem('argentum_offline_backup');
        if (backup) {
          setContent(backup);
          setHasUnsavedChanges(true);
          toast.info('Offline mode', {
            description: 'Restored from local backup',
          });
          announceToScreenReader('Offline mode: Content restored from local backup');
        }
      } catch (e) {
        console.error('Failed to load offline backup:', e);
      }
    }
  }, [isOnline, isLoading]);

  // Load surface on mount
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure token is set in client
      const timer = setTimeout(() => {
        loadSurface();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loadSurface]);

  // Auto-save on content change
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (surface && content !== surface.content && isAuthenticated) {
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 1000); // 1 second debounce
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, surface?.content, isAuthenticated, handleSave]);

  // Update time remaining
  useEffect(() => {
    if (!surface?.expiresAt || isLocked) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(surface.expiresAt!).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        toast.error('Surface expired', {
          description: 'Your content has been deleted',
        });
        loadSurface(); // Reload to check if expired
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [surface?.expiresAt, isLocked, loadSurface]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4" />
        <p className="text-gray-500">Loading surface...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Error Banner */}
      {error && (
        null
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div 
          className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3"
          role="alert"
          aria-live="polite"
        >
          <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Offline Mode</p>
            <p className="text-sm text-yellow-600">
              Changes are saved locally and will sync when you're back online.
              {hasUnsavedChanges && ' (Unsaved changes pending)'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Surface</h1>
          <p className="text-sm text-gray-500 mt-1">
            Temporary writing space. Content auto-expires unless locked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Network Status */}
          <div 
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs
              ${isOnline ? 'text-green-600' : 'text-yellow-600'}
            `}
            title={isOnline ? 'Online' : 'Offline'}
            aria-label={isOnline ? 'Online' : 'Offline'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          </div>

          {/* Time Remaining */}
          {timeRemaining && !isLocked && (
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm
              ${timeRemaining === 'Expired' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-600'}
            `}>
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
          )}

          {/* Lock Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLock}
            className={isLocked ? 'border-blue-500 text-blue-600' : ''}
          >
            {isLocked ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Temporary
              </>
            )}
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!content.trim()}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* Clear */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={!content.trim()}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mb-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Instant Mode
          </span>
          {isSaving && (
            <span className="text-blue-600 animate-pulse">Saving...</span>
          )}
        </div>
        <div>
          {content.length} characters · {content.split(/\s+/).filter(w => w.length > 0).length} words
        </div>
      </div>

      {/* Writing Surface */}
      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing. Content is temporary unless locked. No history. No layers. Only the present moment."
          className="
            w-full min-h-[600px] p-8 border-none resize-none
            focus:outline-none focus:ring-0
            font-mono text-base leading-relaxed
            bg-gray-50
          "
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, #e5e7eb 39px, #e5e7eb 40px)',
            lineHeight: '40px',
          }}
          autoFocus
        />
      </div>

      {/* Philosophy Footer */}
      <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <p className="text-sm text-gray-600 italic">
          "A stroke is temporary. A thought exists briefly, then dissolves. Meaning exists only in the moment of use."
        </p>
      </div>
    </div>
  );
}