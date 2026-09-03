/**
 * Referral Service — Supabase-backed 3 friends invite -> 1 month free Pro flow.
 * 
 * Manages referral code generation, pending attribution across auth providers,
 * eligibility checks, and reward claims via Postgres RPC functions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../auth/supabaseClient';
import { logger } from '../../utils/logger';

const PENDING_REFERRAL_KEY = '@pomomate_pending_referral_code';

export interface ReferralFriend {
  id: string;
  displayName: string;
  createdAt: string;
}

export interface ReferralStats {
  myCode: string;
  completedCount: number;
  requiredCount: number;
  claimedCount: number;
  canClaim: boolean;
  hasUsedReferral: boolean;
  premiumUntil: string | null;
  subscriptionTier: 'free' | 'premium';
  friends: ReferralFriend[];
}

export interface ApplyReferralResult {
  success: boolean;
  referrerName?: string;
  message: string;
  error?: string;
}

export interface ClaimRewardResult {
  success: boolean;
  expiresAt?: string;
  message: string;
  error?: string;
}

export class ReferralService {
  readonly REQUIRED_REFERRALS = 3;

  /**
   * Cleans and extracts a referral code from either plain text or full join URL.
   */
  extractReferralCode(input: string | null | undefined): string {
    if (!input) return '';
    const trimmed = input.trim();
    if (trimmed.includes('ref=')) {
      const match = trimmed.match(/[?&]ref=([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        return match[1].toUpperCase();
      }
    }
    // Handle generic string (alphanumeric up to 16 chars)
    return trimmed.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  }

  /**
   * Saves a pending referral code in local storage (e.g. from deep link).
   */
  async savePendingCode(code: string): Promise<void> {
    const cleanCode = this.extractReferralCode(code);
    if (!cleanCode) return;
    try {
      await AsyncStorage.setItem(PENDING_REFERRAL_KEY, cleanCode);
      logger.info('[Referral] Stored pending referral code:', cleanCode);
    } catch (err) {
      logger.warn('[Referral] Failed to store pending code:', err);
    }
  }

  /**
   * Retrieves the pending referral code if one was saved.
   */
  async getPendingCode(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PENDING_REFERRAL_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Clears any saved pending referral code.
   */
  async clearPendingCode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PENDING_REFERRAL_KEY);
    } catch {
      // Ignored
    }
  }

  /**
   * Applies a referral code to the currently authenticated user.
   */
  async applyReferralCode(rawCode: string): Promise<ApplyReferralResult> {
    const cleanCode = this.extractReferralCode(rawCode);
    if (!cleanCode) {
      return {
        success: false,
        error: 'empty_code',
        message: 'Lütfen geçerli bir davet kodu girin.',
      };
    }

    try {
      const { data, error } = await supabase.rpc('apply_referral_code', {
        code_input: cleanCode,
      });

      if (error) {
        logger.warn('[Referral] apply_referral_code RPC error:', error);
        return {
          success: false,
          error: error.code || 'rpc_error',
          message: error.message || 'Davet kodu uygulanamadı.',
        };
      }

      const result = data as ApplyReferralResult;
      logger.info('[Referral] apply_referral_code result:', result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bağlantı hatası oluştu.';
      logger.warn('[Referral] applyReferralCode exception:', err);
      return {
        success: false,
        error: 'network_error',
        message: msg,
      };
    }
  }

  /**
   * If a pending referral code was stored, applies it to current user and clears storage.
   */
  async consumePendingCodeIfAny(): Promise<ApplyReferralResult | null> {
    const pendingCode = await this.getPendingCode();
    if (!pendingCode) return null;

    logger.info('[Referral] Found pending referral code, consuming:', pendingCode);
    const res = await this.applyReferralCode(pendingCode);

    // If successfully consumed or permanent conflict (already referred / self-referral), clear storage
    if (res.success || res.error === 'already_referred' || res.error === 'self_referral' || res.error === 'invalid_code') {
      await this.clearPendingCode();
    }

    return res;
  }

  /**
   * Fetches real-time referral progress, stats, and referred friends list from Supabase.
   */
  async getReferralStats(): Promise<ReferralStats> {
    try {
      const { data, error } = await supabase.rpc('get_referral_stats');
      if (error || !data) {
        logger.warn('[Referral] get_referral_stats RPC error:', error);
        return {
          myCode: 'POMO-PRO',
          completedCount: 0,
          requiredCount: this.REQUIRED_REFERRALS,
          claimedCount: 0,
          canClaim: false,
          hasUsedReferral: false,
          premiumUntil: null,
          subscriptionTier: 'free',
          friends: [],
        };
      }

      const raw = data as any;
      return {
        myCode: raw.myCode || 'POMO-PRO',
        completedCount: Number(raw.completedCount) || 0,
        requiredCount: Number(raw.requiredCount) || this.REQUIRED_REFERRALS,
        claimedCount: Number(raw.claimedCount) || 0,
        canClaim: Boolean(raw.canClaim),
        hasUsedReferral: Boolean(raw.hasUsedReferral),
        premiumUntil: raw.premiumUntil || null,
        subscriptionTier: raw.subscriptionTier || 'free',
        friends: Array.isArray(raw.friends) ? raw.friends : [],
      };
    } catch (err) {
      logger.warn('[Referral] getReferralStats exception:', err);
      return {
        myCode: 'POMO-PRO',
        completedCount: 0,
        requiredCount: this.REQUIRED_REFERRALS,
        claimedCount: 0,
        canClaim: false,
        hasUsedReferral: false,
        premiumUntil: null,
        subscriptionTier: 'free',
        friends: [],
      };
    }
  }

  /**
   * Claims 1 month free Premium once user reaches 3 completed referrals.
   */
  async claimReward(): Promise<ClaimRewardResult> {
    try {
      const { data, error } = await supabase.rpc('claim_referral_reward');
      if (error) {
        logger.warn('[Referral] claim_referral_reward RPC error:', error);
        return {
          success: false,
          error: error.code || 'rpc_error',
          message: error.message || 'Ödül alınamadı.',
        };
      }

      const result = data as ClaimRewardResult;
      logger.info('[Referral] claimReward result:', result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ödül alınırken bir hata oluştu.';
      logger.warn('[Referral] claimReward exception:', err);
      return {
        success: false,
        error: 'network_error',
        message: msg,
      };
    }
  }
}

export const referralService = new ReferralService();
