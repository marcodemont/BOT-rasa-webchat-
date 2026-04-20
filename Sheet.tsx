/**
 * AURUM Sheet Component
 * The minimal digital sheet - freely writable, drawable, and structurally adaptable
 * Integrated with Timeline/Marker system via Notes and Tags
 */

import React, { useState, useRef, useEffect } from 'react';
import { Layers, Archive, MoreVertical, Pencil, Type, Image as ImageIcon, Trash2, Plane, Mail, History as HistoryIcon, Tag as TagIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import type { Sheet as SheetType, Layer } from './types';
import { aurumClient } from './aurum-client';
import { FoldMode } from '../features/FoldMode';
import { LetterMode } from '../features/LetterMode';
import { DrawingCanvas } from '../features/DrawingCanvas';
import { SketchCanvas } from '../features/SketchCanvas';
import { LayerHistory } from '../features/LayerHistory';
import { LayerOverview } from '../features/LayerOverview';

interface SheetProps {
  sheet: SheetType;
  layers: Layer[];
  onUpdate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  useLocalMode?: boolean;
}

export function Sheet({ sheet, layers, onUpdate, onArchive, onDelete, useLocalMode = false }: SheetProps) {
  const [title, setTitle] = useState(sheet.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isCreatingLayer, setIsCreatingLayer] = useState(false);
  const [newLayerType, setNewLayerType] = useState<'text' | 'drawing' | 'sketch'>('text');
  const [showFoldMode, setShowFoldMode] = useState(false);
  const [showLetterMode, setShowLetterMode] = useState(false);
  const [showLayerOverview, setShowLayerOverview] = useState(false);

  // Save title changes
  const handleTitleSave = async () => {
    if (title !== sheet.title) {
      try {
        if (useLocalMode) {
          // Update in localStorage
          const sheetsData = localStorage.getItem('aurum-sheets');
          if (sheetsData) {
            const allSheets: SheetType[] = JSON.parse(sheetsData);
            const updated = allSheets.map(s =>
              s.id === sheet.id ? { ...s, title, updatedAt: new Date().toISOString() } : s
            );
            localStorage.setItem('aurum-sheets', JSON.stringify(updated));
          }
        } else {
          await aurumClient.updateSheet(sheet.id, { title });
        }
        onUpdate?.();
      } catch (error) {
        console.error('Failed to update sheet title:', error);
      }
    }
    setIsEditingTitle(false);
  };

  // Archive sheet
  const handleArchive = async () => {
    try {
      if (useLocalMode) {
        // Update in localStorage
        const sheetsData = localStorage.getItem('aurum-sheets');
        if (sheetsData) {
          const allSheets: SheetType[] = JSON.parse(sheetsData);
          const updated = allSheets.map(s =>
            s.id === sheet.id ? { ...s, isArchived: true, archivedAt: new Date().toISOString() } : s
          );
          localStorage.setItem('aurum-sheets', JSON.stringify(updated));
        }
      } else {
        await aurumClient.archiveSheet(sheet.id);
      }
      onArchive?.();
    } catch (error) {
      console.error('Failed to archive sheet:', error);
    }
  };

  // Delete sheet
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this sheet? This action cannot be undone.')) {
      try {
        if (useLocalMode) {
          // Delete from localStorage
          const sheetsData = localStorage.getItem('aurum-sheets');
          if (sheetsData) {
            const allSheets: SheetType[] = JSON.parse(sheetsData);
            const updated = allSheets.filter(s => s.id !== sheet.id);
            localStorage.setItem('aurum-sheets', JSON.stringify(updated));
          }
          // Also delete layers
          const layersData = localStorage.getItem('aurum-layers');
          if (layersData) {
            const allLayers: Layer[] = JSON.parse(layersData);
            const updated = allLayers.filter(l => l.sheetId !== sheet.id);
            localStorage.setItem('aurum-layers', JSON.stringify(updated));
          }
        } else {
          await aurumClient.deleteSheet(sheet.id);
        }
        onDelete?.();
      } catch (error) {
        console.error('Failed to delete sheet:', error);
      }
    }
  };

  // Create new layer
  const handleCreateLayer = async () => {
    try {
      if (useLocalMode) {
        // Create in localStorage
        const newLayer: Layer = {
          id: `layer-${Date.now()}`,
          sheetId: sheet.id,
          type: newLayerType,
          content: newLayerType === 'text' ? '' : null,
          position: layers.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versionHistory: [],
        };
        
        const layersData = localStorage.getItem('aurum-layers');
        const allLayers: Layer[] = layersData ? JSON.parse(layersData) : [];
        allLayers.push(newLayer);
        localStorage.setItem('aurum-layers', JSON.stringify(allLayers));
      } else {
        await aurumClient.createLayer(sheet.id, {
          type: newLayerType,
          content: newLayerType === 'text' ? '' : null,
          position: layers.length,
        });
      }
      setIsCreatingLayer(false);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to create layer:', error);
    }
  };

  // Sorted layers by position
  const sortedLayers = [...layers].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Sheet Header */}
      <div className="border-b border-amber-200/50 p-6 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-orange-50/50 to-rose-50/50">
        <div className="flex-1">
          {isEditingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="text-2xl font-light border-none bg-transparent focus:ring-0"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-light cursor-pointer hover:text-amber-600 transition-colors"
            >
              {title}
            </h1>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Created {new Date(sheet.createdAt).toLocaleDateString('de-DE')}
            {sheet.updatedAt !== sheet.createdAt && (
              <> · Updated {new Date(sheet.updatedAt).toLocaleDateString('de-DE')}</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLetterMode(true)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/50"
          >
            <Mail className="w-4 h-4 mr-2" />
            Letter
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFoldMode(true)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/50"
          >
            <Plane className="w-4 h-4 mr-2" />
            Fold
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreatingLayer(true)}
            className="bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600"
          >
            <Layers className="w-4 h-4 mr-2" />
            Add Layer
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Archive Sheet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Sheet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Layer Creation Panel */}
      {isCreatingLayer && (
        <div className="border-b border-amber-200/50 p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Create New Layer</h3>
          <div className="flex gap-2 mb-3">
            <Button
              variant={newLayerType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewLayerType('text')}
              className={newLayerType === 'text' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : ''}
            >
              <Type className="w-4 h-4 mr-2" />
              Text
            </Button>
            <Button
              variant={newLayerType === 'drawing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewLayerType('drawing')}
              className={newLayerType === 'drawing' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : ''}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Drawing
            </Button>
            <Button
              variant={newLayerType === 'sketch' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewLayerType('sketch')}
              className={newLayerType === 'sketch' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : ''}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Sketch
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleCreateLayer} 
              size="sm"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
            >
              Create Layer
            </Button>
            <Button onClick={() => setIsCreatingLayer(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Layers Display */}
      <div className="p-6 space-y-4 min-h-[400px]">
        {sortedLayers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Layers className="w-16 h-16 mx-auto mb-4 opacity-20 text-amber-300" />
            <p className="text-xl font-light text-gray-600 mb-2">Multiple sheets form layers</p>
            <p className="text-sm text-gray-500 mb-1">
              Content is never deleted, only layered. Each layer preserves a moment in time.
            </p>
            <p className="text-xs text-gray-400 italic mb-6">
              "Layers create space. Space creates meaning."
            </p>
            <Button
              onClick={() => setIsCreatingLayer(true)}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-md"
            >
              <Layers className="w-4 h-4 mr-2" />
              Create First Layer
            </Button>
          </div>
        ) : (
          <>
            {/* Layer Overview Button */}
            {sortedLayers.length > 1 && (
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowLayerOverview(true)}
                  className="border-amber-300 text-amber-600 hover:bg-amber-50"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  View Layer Stack ({sortedLayers.length} layers)
                </Button>
              </div>
            )}

            {sortedLayers.map((layer, index) => (
              <LayerComponent
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerId === layer.id}
                onSelect={() => setSelectedLayerId(layer.id)}
                onUpdate={onUpdate}
                position={index + 1}
                total={sortedLayers.length}
                useLocalMode={useLocalMode}
              />
            ))}
          </>
        )}
      </div>

      {/* Fold Mode Modal */}
      {showFoldMode && (
        <FoldMode
          sheet={sheet}
          onClose={() => setShowFoldMode(false)}
        />
      )}

      {/* Letter Mode Modal */}
      {showLetterMode && (
        <LetterMode
          sheet={sheet}
          onClose={() => setShowLetterMode(false)}
          onUpdate={onUpdate}
        />
      )}

      {/* Layer Overview Modal */}
      {showLayerOverview && (
        <LayerOverview
          sheet={sheet}
          layers={sortedLayers}
          onClose={() => setShowLayerOverview(false)}
          onSelectLayer={(layerId) => {
            setSelectedLayerId(layerId);
            setShowLayerOverview(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Layer Component
// ============================================================================

interface LayerComponentProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: () => void;
  position: number;
  total: number;
  useLocalMode?: boolean;
}

function LayerComponent({ layer, isSelected, onSelect, onUpdate, position, total, useLocalMode = false }: LayerComponentProps) {
  const [content, setContent] = useState(layer.content);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Save content changes
  const handleSave = async () => {
    if (content !== layer.content) {
      try {
        if (useLocalMode) {
          // Update in localStorage
          const layersData = localStorage.getItem('aurum-layers');
          if (layersData) {
            const allLayers: Layer[] = JSON.parse(layersData);
            const updated = allLayers.map(l =>
              l.id === layer.id ? { ...l, content, updatedAt: new Date().toISOString() } : l
            );
            localStorage.setItem('aurum-layers', JSON.stringify(updated));
          }
        } else {
          await aurumClient.updateLayer(layer.sheetId, layer.id, { content });
        }
        onUpdate?.();
      } catch (error) {
        console.error('Failed to update layer:', error);
      }
    }
    setIsEditing(false);
  };

  // Save canvas data (for drawing/sketch)
  const handleCanvasSave = async (data: string) => {
    try {
      if (useLocalMode) {
        // Update in localStorage
        const layersData = localStorage.getItem('aurum-layers');
        if (layersData) {
          const allLayers: Layer[] = JSON.parse(layersData);
          const updated = allLayers.map(l =>
            l.id === layer.id ? { ...l, content: data, updatedAt: new Date().toISOString() } : l
          );
          localStorage.setItem('aurum-layers', JSON.stringify(updated));
        }
      } else {
        await aurumClient.updateLayer(layer.sheetId, layer.id, { content: data });
      }
      onUpdate?.();
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  };

  // Delete layer
  const handleDelete = async () => {
    if (confirm('Delete this layer?')) {
      try {
        if (useLocalMode) {
          // Delete from localStorage
          const layersData = localStorage.getItem('aurum-layers');
          if (layersData) {
            const allLayers: Layer[] = JSON.parse(layersData);
            const updated = allLayers.filter(l => l.id !== layer.id);
            localStorage.setItem('aurum-layers', JSON.stringify(updated));
          }
        } else {
          await aurumClient.deleteLayer(layer.sheetId, layer.id);
        }
        onUpdate?.();
      } catch (error) {
        console.error('Failed to delete layer:', error);
      }
    }
  };

  // Restore from history
  const handleRestore = async (version: any) => {
    try {
      if (useLocalMode) {
        // Update in localStorage
        const layersData = localStorage.getItem('aurum-layers');
        if (layersData) {
          const allLayers: Layer[] = JSON.parse(layersData);
          const updated = allLayers.map(l =>
            l.id === layer.id ? { ...l, content: version.content, updatedAt: new Date().toISOString() } : l
          );
          localStorage.setItem('aurum-layers', JSON.stringify(updated));
        }
      } else {
        await aurumClient.updateLayer(layer.sheetId, layer.id, { content: version.content });
      }
      onUpdate?.();
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`
        relative border rounded-2xl p-4 transition-all cursor-pointer
        ${isSelected ? 'border-amber-400 bg-gradient-to-br from-amber-50/50 to-orange-50/50 shadow-md' : 'border-amber-200/50 hover:border-amber-300'}
        ${position > 1 ? 'opacity-95' : ''}
      `}
      style={{
        transform: position > 1 ? `translateY(-${(position - 1) * 2}px)` : 'none',
      }}
    >
      {/* Layer Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {layer.type === 'text' && <Type className="w-4 h-4 text-amber-500" />}
          {layer.type === 'drawing' && <Pencil className="w-4 h-4 text-amber-500" />}
          {layer.type === 'sketch' && <ImageIcon className="w-4 h-4 text-amber-500" />}
          <span className="font-medium">
            Layer {position} of {total}
          </span>
          {layer.versionHistory && layer.versionHistory.length > 0 && (
            <span className="text-xs text-amber-600">
              · {layer.versionHistory.length} version{layer.versionHistory.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSelected && (
            <>
              {layer.versionHistory && layer.versionHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHistory(true);
                  }}
                  title="View history"
                  className="hover:bg-amber-100"
                >
                  <HistoryIcon className="w-3 h-3" />
                </Button>
              )}
              {layer.type === 'text' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(!isEditing);
                  }}
                  className="hover:bg-amber-100"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Layer Content */}
      {layer.type === 'text' && (
        <div>
          {isEditing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave}
              className="w-full min-h-[100px] font-light"
              placeholder="Write your thoughts..."
              autoFocus
            />
          ) : (
            <p className="whitespace-pre-wrap font-light text-gray-700">
              {content || <span className="text-gray-400 italic">Empty layer</span>}
            </p>
          )}
        </div>
      )}

      {layer.type === 'drawing' && (
        <div onClick={(e) => e.stopPropagation()}>
          <DrawingCanvas
            initialData={layer.content}
            onSave={handleCanvasSave}
            readonly={!isSelected}
          />
        </div>
      )}

      {layer.type === 'sketch' && (
        <div onClick={(e) => e.stopPropagation()}>
          <SketchCanvas
            initialData={layer.content}
            onSave={handleCanvasSave}
            readonly={!isSelected}
          />
        </div>
      )}

      {/* Layer History Modal */}
      {showHistory && (
        <LayerHistory
          layer={layer}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}