import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabasePublishableKey, isSupabaseConfigured } from './client';

export interface CookieMethodsServer {
  getAll: () => Array<{ name: string; value: string }> | Promise<Array<{ name: string; value: string }>>;
  setAll?: (
    cookiesToSet: Array<{
      name: string;
      value: string;
      options?: CookieOptionsWithName;
    }>
  ) => void | Promise<void>;
}

/**
 * Creates a Supabase server client for Next.js Server Components, Server Actions,
 * Route Handlers, and server-side environments.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 */
export function createClient(cookieStore?: CookieMethodsServer): SupabaseClient {
  const url = isSupabaseConfigured() ? getSupabaseUrl() : 'https://placeholder-project.supabase.co';
  const key = isSupabaseConfigured() ? getSupabasePublishableKey() : 'placeholder-anon-key';

  return createServerClient(url, key, {
    cookies: {
      async getAll() {
        if (!cookieStore) return [];
        const result = await cookieStore.getAll();
        return result || [];
      },
      async setAll(cookiesToSet) {
        if (!cookieStore || !cookieStore.setAll) return;
        try {
          await cookieStore.setAll(cookiesToSet);
        } catch {
          // Ignored if called from a Server Component where response cookies cannot be mutated
        }
      },
    },
  });
}
