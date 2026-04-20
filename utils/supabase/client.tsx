/**
 * Supabase Client Singleton
 * Ensures only one Supabase client instance is created
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js@2';
import { projectId, publicAnonKey } from './info.tsx';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client singleton
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseInstance = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

// Export default instance
export const supabase = getSupabaseClient();