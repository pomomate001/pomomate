/**
 * Supabase client — client-side auth and RLS-respecting queries.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';

export const supabase: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
