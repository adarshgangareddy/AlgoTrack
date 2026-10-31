import { createClient as createSupabaseJsClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseUrl,
  getSupabasePublishableKey,
  isSupabaseConfigured,
} from './supabase/client';

export { getSupabaseUrl, getSupabasePublishableKey, isSupabaseConfigured };

// Fallback dummy URL so createClient does not throw at initialization if env is pending
const validUrl = isSupabaseConfigured() ? getSupabaseUrl() : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured() ? getSupabasePublishableKey() : 'placeholder-anon-key';

export const supabase: SupabaseClient = createSupabaseJsClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

/**
 * Diagnostic helper to verify Supabase connectivity
 */
export async function verifySupabaseConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  message: string;
  url?: string;
  error?: string;
}> {
  const configured = isSupabaseConfigured();
  const url = getSupabaseUrl();

  if (!configured) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase is not configured yet. Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local',
      url,
    };
  }

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        configured: true,
        connected: false,
        message: `Supabase Auth error: ${error.message}`,
        url,
        error: error.message,
      };
    }

    return {
      configured: true,
      connected: true,
      message: 'Successfully connected to Supabase!',
      url,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      configured: true,
      connected: false,
      message: `Failed to connect: ${errorMsg}`,
      url,
      error: errorMsg,
    };
  }
}
