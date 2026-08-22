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
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) return null;

      // Fetch full user profile from database
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!profile) return null;

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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      throw new Error(error?.message ?? 'Kayıt işlemi başarısız oldu');
    }

    // Kullanıcı profilini oluştur / güncelle.
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
