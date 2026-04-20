/**
 * ARGENTUM API Client
 * Minimal persistence, flat structure, immediate operations
 */

import { projectId } from '../../utils/supabase/info.tsx';
import type { Surface, ArgentumAPIClient } from './types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e27c6bd5/argentum`;

class ArgentumClient implements ArgentumAPIClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    console.log('ArgentumClient: Access token set:', token ? 'Token present' : 'No token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.accessToken) {
      console.error('ArgentumClient: No access token available');
      throw new Error('Not authenticated. Please sign in.');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = error.error || error.message || `HTTP ${response.status}`;
      
      // Handle JWT-specific errors
      if (errorMessage.includes('Invalid JWT') || errorMessage.includes('JWT expired') || errorMessage.includes('jwt expired')) {
        console.error('ArgentumClient: JWT token is invalid or expired. Please sign in again.');
        throw new Error('Your session has expired. Please sign in again.');
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ============================================================================
  // SURFACE (Single, Temporary, Flat)
  // ============================================================================

  async getCurrentSurface(): Promise<Surface | null> {
    const data = await this.request<{ surface: Surface | null }>('/surface');
    return data.surface;
  }

  async updateSurface(content: string): Promise<Surface> {
    const data = await this.request<{ surface: Surface }>('/surface', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return data.surface;
  }

  async clearSurface(): Promise<void> {
    await this.request('/surface', { method: 'DELETE' });
  }

  async exportSurface(): Promise<string> {
    const data = await this.request<{ export: string }>('/surface/export');
    return data.export;
  }

  async lockSurface(lock: boolean): Promise<Surface> {
    const data = await this.request<{ surface: Surface }>('/surface/lock', {
      method: 'POST',
      body: JSON.stringify({ lock }),
    });
    return data.surface;
  }
}

// Singleton instance
export const argentumClient = new ArgentumClient();
