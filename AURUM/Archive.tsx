/**
 * AURUM Archive Component
 * Structured space for archived sheets - nothing is lost
 */

import React, { useState, useEffect } from 'react';
import { Archive as ArchiveIcon, FileText, Calendar, RotateCcw, Trash2, Loader2, Layers } from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { Sheet } from './types';
import { aurumClient } from './aurum-client';

interface ArchiveProps {
  onSelectSheet?: (sheetId: string) => void;
  onRefresh?: () => void;
  isAuthenticated?: boolean;
  useLocalMode?: boolean;
}

export function Archive({ onSelectSheet, onRefresh, isAuthenticated = true, useLocalMode = false }: ArchiveProps) {
  const [archivedSheets, setArchivedSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load archived sheets
  const loadArchive = async () => {
    setIsLoading(true);
    try {
      if (useLocalMode) {
        // Load from localStorage
        const saved = localStorage.getItem('aurum-sheets');
        if (saved) {
          const parsed = JSON.parse(saved);
          const archived = parsed.filter((s: Sheet) => s.isArchived);
          setArchivedSheets(archived);
        } else {
          setArchivedSheets([]);
        }
      } else if (isAuthenticated) {
        // Load from API
        const data = await aurumClient.getArchive();
        setArchivedSheets(data);
      }
      onRefresh?.();
    } catch (error) {
      console.error('Failed to load archive:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('aurum-sheets');
      if (saved) {
        const parsed = JSON.parse(saved);
        const archived = parsed.filter((s: Sheet) => s.isArchived);
        setArchivedSheets(archived);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArchive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, useLocalMode]);

  // Save to localStorage
  const saveToLocal = (updatedSheets: Sheet[]) => {
    localStorage.setItem('aurum-sheets', JSON.stringify(updatedSheets));
  };

  // Unarchive sheet
  const handleUnarchive = async (sheetId: string) => {
    try {
      if (useLocalMode) {
        // Update in localStorage
        const saved = localStorage.getItem('aurum-sheets');
        if (saved) {
          const allSheets: Sheet[] = JSON.parse(saved);
          const updated = allSheets.map(s =>
            s.id === sheetId ? { ...s, isArchived: false, archivedAt: null } : s
          );
          saveToLocal(updated);
          await loadArchive();
        }
      } else {
        await aurumClient.unarchiveSheet(sheetId);
        await loadArchive();
      }
    } catch (error) {
      console.error('Failed to unarchive sheet:', error);
    }
  };

  // Delete sheet permanently
  const handleDeletePermanently = async (sheetId: string) => {
    if (confirm('Permanently delete this sheet? This action cannot be undone.')) {
      try {
        if (useLocalMode) {
          // Delete from localStorage
          const saved = localStorage.getItem('aurum-sheets');
          if (saved) {
            const allSheets: Sheet[] = JSON.parse(saved);
            const updated = allSheets.filter(s => s.id !== sheetId);
            saveToLocal(updated);
            await loadArchive();
          }
        } else {
          await aurumClient.deleteSheet(sheetId);
          await loadArchive();
        }
      } catch (error) {
        console.error('Failed to delete sheet:', error);
      }
    }
  };

  // Sort by archived date (most recent first)
  const sortedSheets = [...archivedSheets].sort((a, b) => {
    const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
    const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
          <ArchiveIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-light text-gray-800">Archive</h2>
          <p className="text-sm text-gray-500">
            {sortedSheets.length} archived {sortedSheets.length === 1 ? 'sheet' : 'sheets'}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-8 max-w-2xl">
        A structured space for previous versions, sketches, and ideas. Nothing is lost.
      </p>

      {/* Archive List */}
      {sortedSheets.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-2xl shadow border border-amber-200/50">
          <ArchiveIcon className="w-16 h-16 mx-auto mb-4 text-amber-300" />
          <h3 className="text-xl font-light text-gray-700 mb-2">Nothing is lost</h3>
          <p className="text-gray-500 mb-2">
            A structured space for previous versions, sketches, and ideas.
          </p>
          <p className="text-sm text-gray-400 italic">
            Archived sheets will appear here. The past remains visible.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSheets.map((sheet) => (
            <ArchivedSheetCard
              key={sheet.id}
              sheet={sheet}
              onUnarchive={() => handleUnarchive(sheet.id)}
              onDelete={() => handleDeletePermanently(sheet.id)}
              onView={() => onSelectSheet?.(sheet.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Archived Sheet Card Component
// ============================================================================

interface ArchivedSheetCardProps {
  sheet: Sheet;
  onUnarchive: () => void;
  onDelete: () => void;
  onView: () => void;
}

function ArchivedSheetCard({ sheet, onUnarchive, onDelete, onView }: ArchivedSheetCardProps) {
  const layerCount = sheet.layerIds?.length || 0;
  const archivedDate = sheet.archivedAt ? new Date(sheet.archivedAt) : new Date();

  return (
    <div className="bg-gradient-to-br from-white via-amber-50/20 to-orange-50/20 rounded-2xl shadow border border-amber-200/50 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        {/* Sheet Info */}
        <div className="flex-1 cursor-pointer group" onClick={onView}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
              {sheet.title}
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 ml-13">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Archived {archivedDate.toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{layerCount} {layerCount === 1 ? 'layer' : 'layers'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUnarchive}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
