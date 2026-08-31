/**
 * Supabase-based AuthService implementation.
 */
import { supabase } from './supabaseClient';
import { logger } from '../../utils/logger';
import type { AuthService } from '../interfaces';
import type { User } from '../../types';

export class SupabaseAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) return null;

      // Fetch full user profile from database
      let { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle(); // maybeSingle doesn't throw if 0 rows

      if (!profile) {
        // Create the profile if it doesn't exist
        const email = authUser.email || '';
        // Extract Google / OAuth metadata if available
        const meta = authUser.user_metadata || {};
        const name = meta.full_name || meta.name || meta.display_name || email.split('@')[0];
        const avatarUrl = meta.avatar_url || meta.picture || null;

        const { data: newProfile, error: insertError } = await supabase.from('users').upsert(
          {
            id: authUser.id,
            email,
            display_name: name,
            ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
          },
          { onConflict: 'id' }
        ).select().single();

        if (insertError) {
          logger.warn('[Auth] Failed to create missing profile:', insertError);
          return null;
        }
        profile = newProfile;
      }

      return {
        id: profile.id as string,
        email: profile.email as string,
        displayName: profile.display_name as string,
        avatarUrl: profile.avatar_url as string | undefined,
        subscriptionTier: profile.subscription_tier as 'free' | 'premium',
        createdAt: profile.created_at as string,
        updatedAt: profile.updated_at as string,
      };
    } catch (err) {
      logger.warn('[Auth] getCurrentUser failed:', err);
      return null;
    }
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message ?? 'Sign-in failed');
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to fetch user profile');
    return user;
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: 'pomomate://', // Deep link to return to the app
      }
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Kayıt işlemi başarısız oldu');
    }

    // Only attempt to create profile if we have a session (meaning email confirmation is off or they auto-signed in)
    if (data.session) {
      const { error: profileError } = await supabase.from('users').upsert(
        {
          id: data.user.id,
          email,
          display_name: email.split('@')[0],
        },
        { onConflict: 'id' },
      );

      if (profileError) {
        throw new Error('Kullanıcı profili oluşturulamadı');
      }
    }

    const user = await this.getCurrentUser();
    if (user) return user;

    // E-posta doğrulama açık olduğunda oturum hemen oluşmayabilir.
    return {
      id: data.user.id,
      email,
      displayName: (data.user.user_metadata?.display_name as string | undefined) ?? email.split('@')[0],
      avatarUrl: undefined,
      subscriptionTier: 'free',
      createdAt: data.user.created_at,
      updatedAt: new Date().toISOString(),
    };
  }

  async signInWithGoogle(): Promise<User> {
    const WebBrowser = await import('expo-web-browser');
    const redirectUrl = 'pomomate://';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw new Error(error.message);
    if (!data.url) throw new Error('OAuth bağlantısı alınamadı.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success' && result.url) {
      // Extract tokens from deep link URL
      let accessToken = '';
      let refreshToken = '';

      if (result.url.includes('#')) {
        const fragment = result.url.split('#')[1];
        const parts = fragment.split('&');
        parts.forEach(p => {
          const [k, v] = p.split('=');
          if (k === 'access_token') accessToken = v;
          if (k === 'refresh_token') refreshToken = v;
        });
      }

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      } else {
        throw new Error('Google girişi başarısız oldu veya token alınamadı.');
      }
    } else if (result.type !== 'cancel') {
      throw new Error('Google girişi tamamlanamadı.');
    } else {
      throw new Error('Giriş iptal edildi.');
    }

    const user = await this.getCurrentUser();
    if (!user) throw new Error('Kullanıcı profili getirilemedi.');
    return user;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'pomomate://reset-password',
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    logger.info('[Auth] Signed out');
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }
}

export const authService = new SupabaseAuthService();
