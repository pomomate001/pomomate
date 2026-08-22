/**
 * PomoMate — Environment / Config System
 *
 * Centralised, typed access to runtime configuration. Values are sourced from
 * environment variables so that **no secret is ever hard-coded** in the source
 * tree (see .env.example for the required keys).
 *
 * Expo inlines any variable prefixed with `EXPO_PUBLIC_` into the JS bundle at
 * build time via `process.env`. We read those here and expose a single,
 * validated `config` object to the rest of the app.
 *
 * IMPORTANT: Only put *publishable* values here (public API URLs, Supabase
 * anon key, signaling URL). True server-side secrets (service role keys, etc.)
 * must live on the backend (M03/M07) and never reach the client bundle.
 */

export type Environment = 'dev' | 'staging' | 'prod';

export interface AppConfig {
  /** Base URL of the PomoMate backend API (M03). */
  apiUrl: string;
  /** Self-hosted Supabase project URL (M03). */
  supabaseUrl: string;
  /** Supabase anonymous/public key (safe to ship to clients). */
  supabaseAnonKey: string;
  /** WebRTC signaling server URL (M04). */
  webrtcSignalingUrl: string;
  /** Active environment. */
  env: Environment;
}

/** Coerces a possibly-undefined env value to a string with a fallback. */
function orDefault(value: string | undefined, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/** Normalises the ENV value into a known Environment, defaulting to `dev`. */
function parseEnvironment(raw: string): Environment {
  if (raw === 'prod' || raw === 'staging' || raw === 'dev') {
    return raw;
  }
  return 'dev';
}

// NOTE: process.env access must be static (not computed) so that Expo/Metro can
// inline the EXPO_PUBLIC_* values into the bundle at build time.
export const config: AppConfig = {
  apiUrl: orDefault(process.env.EXPO_PUBLIC_API_URL),
  supabaseUrl: orDefault(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: orDefault(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  webrtcSignalingUrl: orDefault(process.env.EXPO_PUBLIC_WEBRTC_SIGNALING_URL),
  env: parseEnvironment(orDefault(process.env.EXPO_PUBLIC_ENV, 'dev')),
};

export const isDev = config.env === 'dev';
export const isStaging = config.env === 'staging';
export const isProd = config.env === 'prod';

/**
 * Warns (in dev only) about any missing configuration keys. Intentionally
 * non-throwing so that M01 remains runnable before real values exist.
 */
export function validateConfig(cfg: AppConfig = config): string[] {
  const missing: string[] = [];
  if (!cfg.apiUrl) missing.push('EXPO_PUBLIC_API_URL');
  if (!cfg.supabaseUrl) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!cfg.supabaseAnonKey) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  if (!cfg.webrtcSignalingUrl) missing.push('EXPO_PUBLIC_WEBRTC_SIGNALING_URL');

  if (missing.length > 0 && isDev) {
    console.warn(
      `[config] Missing environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values.',
    );
  }
  return missing;
}
