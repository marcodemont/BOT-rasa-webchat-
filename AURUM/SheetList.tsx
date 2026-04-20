/**
 * AURUM Sheet List Component
 * Displays all user sheets with creation and management
 * Integrated with Timeline/Marker system
 */

import React, { useState, useEffect } from 'react';
import { Plus, FileText, Calendar, Loader2, Layers } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import type { Sheet } from './types';
import { aurumClient } from './aurum-client';

interface SheetListProps {
  onSelectSheet: (sheetId: string) => void;
  onRefresh?: () => void;
  isAuthenticated?: boolean;
  useLocalMode?: boolean;
}

export function SheetList({ onSelectSheet, onRefresh, isAuthenticated = true, useLocalMode = false }: SheetListProps) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');

  // Load sheets
  const loadSheets = async () => {
    setIsLoading(true);
    try {
      if (useLocalMode) {
        // Load from localStorage in demo mode
        const saved = localStorage.getItem('aurum-sheets');
        if (saved) {
          const parsed = JSON.parse(saved);
          const activeSheets = parsed.filter((s: Sheet) => !s.isArchived);
          setSheets(activeSheets);
        } else {
          setSheets([]);
        }
      } else if (isAuthenticated) {
        // Load from API
        const data = await aurumClient.getSheets();
        const activeSheets = data.filter(s => !s.isArchived);
        setSheets(activeSheets);
      }
      onRefresh?.();
    } catch (error) {
      console.error('Failed to load sheets:', error);
      // Fallback to localStorage on error
      const saved = localStorage.getItem('aurum-sheets');
      if (saved) {
        const parsed = JSON.parse(saved);
        const activeSheets = parsed.filter((s: Sheet) => !s.isArchived);
        setSheets(activeSheets);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, useLocalMode]);

  // Save to localStorage
  const saveToLocal = (updatedSheets: Sheet[]) => {
    localStorage.setItem('aurum-sheets', JSON.stringify(updatedSheets));
  };

  // Create new sheet
  const handleCreateSheet = async () => {
    if (!newSheetTitle.trim()) return;

    try {
      if (useLocalMode) {
        // Create in localStorage
        const newSheet: Sheet = {
          id: `sheet-${Date.now()}`,
          userId: 'demo-user',
          title: newSheetTitle,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          layerIds: [],
          isArchived: false,
          metadata: {},
        };
        const updatedSheets = [...sheets, newSheet];
        setSheets(updatedSheets);
        saveToLocal(updatedSheets);
        setNewSheetTitle('');
        setIsCreating(false);
        onSelectSheet(newSheet.id);
      } else {
        // Create via API
        const sheet = await aurumClient.createSheet(newSheetTitle);
        setNewSheetTitle('');
        setIsCreating(false);
        await loadSheets();
        onSelectSheet(sheet.id);
      }
    } catch (error) {
      console.error('Failed to create sheet:', error);
    }
  };

  // Sort sheets by update time (most recent first)
  const sortedSheets = [...sheets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-light text-gray-800">Your Sheets</h2>
          <p className="text-sm text-gray-500 mt-1">
            Notes that connect to your timeline
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sheet
        </Button>
      </div>

      {/* Create Sheet Panel */}
      {isCreating && (
        <div className="mb-6 p-4 border border-amber-300 rounded-2xl bg-gradient-to-r from-amber-50/50 via-orange-50/50 to-rose-50/50">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Create New Sheet</h3>
          <div className="flex gap-2">
            <Input
              value={newSheetTitle}
              onChange={(e) => setNewSheetTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSheet()}
              placeholder="Sheet title..."
              className="flex-1"
              autoFocus
            />
            <Button 
              onClick={handleCreateSheet} 
              disabled={!newSheetTitle.trim()}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
            >
              Create
            </Button>
            <Button onClick={() => setIsCreating(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Sheet Grid */}
      {sortedSheets.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 rounded-2xl shadow border border-amber-200/50">
          <div className="relative inline-block mb-4">
            <FileText className="w-16 h-16 text-amber-300" />
            <Layers className="w-8 h-8 text-amber-400 absolute -bottom-1 -right-1" />
          </div>
          <h3 className="text-xl font-light text-gray-700 mb-2">A sheet is the beginning</h3>
          <p className="text-gray-500 mb-2 max-w-md mx-auto">
            Create your first digital sheet. Freely writable, drawable, and structurally adaptable.
          </p>
          <p className="text-sm text-gray-400 italic mb-6">
            "A single stroke can become an idea. Multiple layers can evolve into entire worlds."
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Sheet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSheets.map((sheet) => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              onSelect={() => onSelectSheet(sheet.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sheet Card Component
// ============================================================================

interface SheetCardProps {
  sheet: Sheet;
  onSelect: () => void;
}

function SheetCard({ sheet, onSelect }: SheetCardProps) {
  const layerCount = sheet.layerIds?.length || 0;
  const lastUpdated = new Date(sheet.updatedAt);
  const isRecent = Date.now() - lastUpdated.getTime() < 24 * 60 * 60 * 1000; // 24 hours

  return (
    <div
      onClick={onSelect}
      className="
        bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30
        rounded-2xl shadow hover:shadow-lg transition-all cursor-pointer
        border border-amber-200/50 hover:border-amber-300
        p-5 group
      "
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FileText className="w-5 h-5 text-white" />
        </div>
        {isRecent && (
          <span className="text-xs bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 py-1 rounded-full font-medium">
            Recent
          </span>
        )}
      </div>

      <h3 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
        {sheet.title}
      </h3>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{lastUpdated.toLocaleDateString('de-DE')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span>{layerCount} {layerCount === 1 ? 'layer' : 'layers'}</span>
        </div>
      </div>
    </div>
  );
}
