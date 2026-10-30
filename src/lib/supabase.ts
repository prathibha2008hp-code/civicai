/**
 * CivicAI - Supabase Official Client Configuration
 * Uses @supabase/supabase-js with client-safe environment variables.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validates whether genuine Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ CivicAI: Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are pending. Operating in verified pre-migration state.'
  );
}

// Client instance configured with session persistence and auto-refresh
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
