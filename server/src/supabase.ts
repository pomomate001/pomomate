/**
 * Supabase clients.
 *
 * - adminClient: uses service role key — bypasses RLS, for server-side operations.
 * - createUserClient: creates a client scoped to a user's JWT — respects RLS.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './config/env.js';

/** Server-side admin client — bypasses RLS. */
export const adminClient: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** Per-request user client — respects RLS. */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
