/**
 * Referral routes — 3 verified users → 1 month premium.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient, adminClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const REQUIRED_REFERRALS = 3;
const REWARD_DURATION_DAYS = 30;

// POST /referrals — create referral
router.post('/', async (req: AuthenticatedRequest, res) => {
  const { referred_email } = z.object({ referred_email: z.string().email() }).parse(req.body);
  const sb = createUserClient(req.accessToken!);

  // Check if referred user exists
  const { data: referredUser } = await adminClient
    .from('users')
    .select('id')
    .eq('email', referred_email)
    .single();

  if (!referredUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (referredUser.id === req.userId) {
    res.status(400).json({ error: 'Cannot refer yourself' });
    return;
  }

  // Create referral
  const { data, error } = await sb
    .from('referrals')
    .insert({
      referrer_id: req.userId,
      referred_id: referredUser.id as string,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

// GET /referrals — list my referrals
router.get('/', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data } = await sb
    .from('referrals')
    .select('*, users!referrals_referred_id_fkey(email, display_name)')
    .eq('referrer_id', req.userId!);

  res.json(data ?? []);
});

// GET /referrals/reward — check eligibility
router.get('/reward', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);

  const { count: completed } = await sb
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', req.userId!)
    .eq('status', 'completed');

  const earned = (completed ?? 0) >= REQUIRED_REFERRALS;

  res.json({
    earned,
    completedReferrals: completed ?? 0,
    requiredReferrals: REQUIRED_REFERRALS,
  });
});

// POST /referrals/claim-reward — claim 1 month premium
router.post('/claim-reward', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);

  const { count: completed } = await sb
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', req.userId!)
    .eq('status', 'completed');

  if ((completed ?? 0) < REQUIRED_REFERRALS) {
    res.status(403).json({ error: 'Not enough completed referrals' });
    return;
  }

  // Check if already claimed
  const { data: existing } = await sb
    .from('subscriptions')
    .select('*')
    .eq('user_id', req.userId!)
    .eq('tier', 'premium')
    .single();

  if (existing) {
    res.status(400).json({ error: 'Reward already claimed' });
    return;
  }

  // Grant 1 month premium
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REWARD_DURATION_DAYS);

  await sb.from('subscriptions').insert({
    user_id: req.userId,
    tier: 'premium',
    expires_at: expiresAt.toISOString(),
  });

  // Update user tier
  await sb.from('users').update({ subscription_tier: 'premium' }).eq('id', req.userId!);

  res.json({ ok: true, expiresAt: expiresAt.toISOString() });
});

export default router;
