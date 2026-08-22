/**
 * Referral service — 3 verified users → 1 month premium.
 * 
 * Server-side validation prevents abuse.
 */
import { apiClient } from '../api';
import { logger } from '../../utils/logger';
import type { Referral } from '../../types';

export interface ReferralReward {
  earned: boolean;
  completedReferrals: number;
  requiredReferrals: number;
}

export class ReferralService {
  private readonly REQUIRED_REFERRALS = 3;

  async createReferral(referredEmail: string): Promise<Referral | null> {
    try {
      const { data } = await apiClient.post<Referral>('/referrals', { referred_email: referredEmail });
      logger.info('[Referral] Created for:', referredEmail);
      return data;
    } catch (err) {
      logger.warn('[Referral] Create failed:', err);
      return null;
    }
  }

  async listMyReferrals(): Promise<Referral[]> {
    try {
      const { data } = await apiClient.get<Referral[]>('/referrals');
      return data;
    } catch (err) {
      logger.warn('[Referral] List failed:', err);
      return [];
    }
  }

  async checkRewardEligibility(): Promise<ReferralReward> {
    try {
      const { data } = await apiClient.get<ReferralReward>('/referrals/reward');
      return data;
    } catch (err) {
      logger.warn('[Referral] Check reward failed:', err);
      return {
        earned: false,
        completedReferrals: 0,
        requiredReferrals: this.REQUIRED_REFERRALS,
      };
    }
  }

  async claimReward(): Promise<boolean> {
    try {
      await apiClient.post('/referrals/claim-reward', {});
      logger.info('[Referral] Reward claimed');
      return true;
    } catch (err) {
      logger.warn('[Referral] Claim reward failed:', err);
      return false;
    }
  }
}

export const referralService = new ReferralService();
