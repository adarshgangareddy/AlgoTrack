import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Helper to retrieve the Supabase URL across Next.js (process.env) and Vite (import.meta.env)
export function getSupabaseUrl(): string {
  const url =
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    '';
  return url;
}

// Helper to retrieve the Supabase Publishable / Anon Key across Next.js and Vite
export function getSupabasePublishableKey(): string {
  const key =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    '';
  return key;
}

// Validate if environment variables point to a valid Supabase endpoint (not placeholders)
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  return (
    typeof url === 'string' &&
    url.trim().length > 0 &&
    !url.includes('your-project') &&
    typeof key === 'string' &&
    key.trim().length > 0 &&
    !key.includes('your-publishable-key') &&
    !key.includes('your-anon-key')
  );
}

/**
 * Creates a browser-compatible Supabase client using @supabase/ssr.
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 */
export function createClient(): SupabaseClient {
  const url = isSupabaseConfigured() ? getSupabaseUrl() : 'https://placeholder-project.supabase.co';
  const key = isSupabaseConfigured() ? getSupabasePublishableKey() : 'placeholder-anon-key';

  return createBrowserClient(url, key);
}

