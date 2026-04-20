/**
 * ARGENTUM Core Types
 * Flat structure, minimal persistence, temporary content
 */

export interface Surface {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  expiresAt?: string | null;
  isLocked: boolean; // If true, won't auto-expire
}

export interface ArgentumAPIClient {
  // Surface Management
  getCurrentSurface: () => Promise<Surface | null>;
  updateSurface: (content: string) => Promise<Surface>;
  clearSurface: () => Promise<void>;
  exportSurface: () => Promise<string>;
  lockSurface: (lock: boolean) => Promise<Surface>;
}
