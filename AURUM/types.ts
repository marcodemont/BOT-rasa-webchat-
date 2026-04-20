/**
 * AURUM Type Definitions
 */

// Tag für Organisation und Kategorisierung
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

// Marker auf der Timeline
export interface Marker {
  id: string;
  userId: string;
  title: string;
  time: string; // ISO timestamp
  duration?: number; // in Minuten
  color: string;
  icon?: string;
  completed: boolean;
  noteIds: string[]; // Verknüpfte Notizen
  tags: string[]; // Tag IDs
  // Wiederholung
  recurring: boolean;
  recurrencePattern?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  recurrenceDays?: number[]; // 0=Sonntag, 1=Montag, ..., 6=Samstag
  recurrenceEndDate?: string | null; // Optional: Enddatum für Wiederholung
  createdAt: string;
  updatedAt: string;
  // Optional: nur gesetzt wenn aus AURUM-Supabase geladen, fehlt bei localStorage-Demo
  markerType?: 'anchor' | 'audio' | 'compression' | 'planned';
  sub?: string;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  locationLabel?: string;
}

// Notiz (erweitert mit Tags und Marker-Verknüpfung)
export interface Note {
  id: string;
  userId: string;
  content: string;
  markerIds: string[]; // Verknüpfte Marker
  tags: string[]; // Tag IDs
  createdAt: string;
  updatedAt: string;
}

// Sheet (bestehend)
export interface Sheet {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  layerIds: string[];
  isArchived: boolean;
  archivedAt?: string | null;
  metadata: Record<string, any>;
}

export interface Layer {
  id: string;
  sheetId: string;
  type: 'text' | 'drawing' | 'image' | 'sketch';
  content: any;
  position: number;
  createdAt: string;
  updatedAt: string;
  versionHistory: LayerVersion[];
}

export interface LayerVersion {
  timestamp: string;
  content: any;
  action: 'created' | 'updated' | 'edited' | 'restored';
}

export interface AurumAPIClient {
  // Sheets
  getSheets: () => Promise<Sheet[]>;
  getSheet: (id: string) => Promise<{ sheet: Sheet; layers: Layer[] }>;
  createSheet: (title?: string, metadata?: Record<string, any>) => Promise<Sheet>;
  updateSheet: (id: string, data: Partial<Sheet>) => Promise<Sheet>;
  deleteSheet: (id: string) => Promise<void>;
  
  // Layers
  createLayer: (sheetId: string, data: Partial<Layer>) => Promise<Layer>;
  updateLayer: (sheetId: string, layerId: string, data: Partial<Layer>) => Promise<Layer>;
  deleteLayer: (sheetId: string, layerId: string) => Promise<void>;
  getLayerHistory: (sheetId: string, layerId: string) => Promise<LayerVersion[]>;
  
  // Archive
  archiveSheet: (id: string) => Promise<Sheet>;
  unarchiveSheet: (id: string) => Promise<Sheet>;
  getArchive: () => Promise<Sheet[]>;
}