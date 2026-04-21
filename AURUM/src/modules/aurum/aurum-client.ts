/**
 * AURUM API Client
 * Frontend client for interacting with AURUM backend
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info.tsx';
import type { Sheet, Layer, LayerVersion, AurumAPIClient } from './types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e27c6bd5/aurum`;

console.log('🔗 AurumClient: Initialized with BASE_URL:', BASE_URL);
console.log('🔗 AurumClient: Project ID:', projectId);

class AurumClient implements AurumAPIClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    console.log('🔐 AurumClient: Access token set:', token ? 'Token present' : 'No token');
    if (token) {
      console.log('🔑 AurumClient: Token length:', token.length);
      console.log('🔑 AurumClient: Token preview:', token.substring(0, 30) + '...');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Don't make request if no access token is available
    if (!this.accessToken) {
      console.error('❌ AurumClient: No access token available for request:', endpoint);
      throw new Error('Not authenticated. Please sign in.');
    }

    const url = `${BASE_URL}${endpoint}`;
    console.log('📡 AurumClient: Making request to:', url);
    console.log('🔑 AurumClient: Using token:', this.accessToken.substring(0, 30) + '...');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    console.log('📨 AurumClient: Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken.substring(0, 30)}...`
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📥 AurumClient: Response status:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = error.error || error.message || `HTTP ${response.status}`;
        
        console.error(`❌ AURUM API Error [${endpoint}]:`, {
          code: response.status,
          message: errorMessage
        });
        
        // Handle JWT-specific errors
        if (errorMessage.includes('Invalid JWT') || errorMessage.includes('JWT expired') || errorMessage.includes('jwt expired')) {
          console.error('❌ AurumClient: JWT token is invalid or expired. Please sign in again.');
          throw new Error('Your session has expired. Please sign in again.');
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      // Better error handling for network errors
      if (error instanceof TypeError && error.message === 'Load failed') {
        console.error('❌ AurumClient: Network request failed. Is the backend server running?');
        console.error('❌ AurumClient: URL attempted:', url);
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      throw error;
    }
  }

  // ============================================================================
  // SHEETS
  // ============================================================================

  async getSheets(): Promise<Sheet[]> {
    const data = await this.request<{ sheets: Sheet[] }>('/sheets');
    return data.sheets;
  }

  async getSheet(id: string): Promise<{ sheet: Sheet; layers: Layer[] }> {
    return this.request(`/sheets/${id}`);
  }

  async createSheet(
    title: string = 'Untitled Sheet',
    metadata: Record<string, any> = {}
  ): Promise<Sheet> {
    const data = await this.request<{ sheet: Sheet }>('/sheets', {
      method: 'POST',
      body: JSON.stringify({ title, metadata }),
    });
    return data.sheet;
  }

  async updateSheet(id: string, data: Partial<Sheet>): Promise<Sheet> {
    const response = await this.request<{ sheet: Sheet }>(`/sheets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.sheet;
  }

  async deleteSheet(id: string): Promise<void> {
    await this.request(`/sheets/${id}`, { method: 'DELETE' });
  }

  // ============================================================================
  // LAYERS
  // ============================================================================

  async createLayer(sheetId: string, data: Partial<Layer>): Promise<Layer> {
    const response = await this.request<{ layer: Layer }>(
      `/sheets/${sheetId}/layers`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.layer;
  }

  async updateLayer(
    sheetId: string,
    layerId: string,
    data: Partial<Layer>
  ): Promise<Layer> {
    const response = await this.request<{ layer: Layer }>(
      `/sheets/${sheetId}/layers/${layerId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return response.layer;
  }

  async deleteLayer(sheetId: string, layerId: string): Promise<void> {
    await this.request(`/sheets/${sheetId}/layers/${layerId}`, {
      method: 'DELETE',
    });
  }

  async getLayerHistory(sheetId: string, layerId: string): Promise<LayerVersion[]> {
    const data = await this.request<{ history: LayerVersion[] }>(
      `/sheets/${sheetId}/layers/${layerId}/history`
    );
    return data.history;
  }

  // ============================================================================
  // ARCHIVE
  // ============================================================================

  async archiveSheet(id: string): Promise<Sheet> {
    const response = await this.request<{ sheet: Sheet }>(
      `/sheets/${id}/archive`,
      { method: 'POST' }
    );
    return response.sheet;
  }

  async unarchiveSheet(id: string): Promise<Sheet> {
    const response = await this.request<{ sheet: Sheet }>(
      `/sheets/${id}/unarchive`,
      { method: 'POST' }
    );
    return response.sheet;
  }

  async getArchive(): Promise<Sheet[]> {
    const data = await this.request<{ archive: Sheet[] }>('/archive');
    return data.archive;
  }
}

// Singleton instance
export const aurumClient = new AurumClient();