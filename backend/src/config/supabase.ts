// backend/src/config/supabase.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_URL.includes('your-project')) {
    try {
      supabaseInstance = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('[Backend] Failed to initialize Supabase client:', err);
    }
  }

  return null;
}

export function isSupabaseReady(): boolean {
  return getSupabaseClient() !== null;
}
