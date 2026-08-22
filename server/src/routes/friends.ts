/**
 * Friendship routes — requests, accept/reject, remove, friend stats.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /friends — list friends with summary stats
router.get('/', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const uid = req.userId!;

  const { data: friendships } = await sb
    .from('friendships')
    .select('user_a, user_b')
    .or(`user_a.eq.${uid},user_b.eq.${uid}`);

  if (!friendships || friendships.length === 0) { res.json([]); return; }

  const friendIds = friendships.map((f) =>
    f.user_a === uid ? f.user_b : f.user_a,
  ) as string[];

  // Get friend profiles
  const { data: profiles } = await sb
    .from('users')
    .select('id, display_name, avatar_url')
    .in('id', friendIds);

  // Get friend stats (respecting sharing preferences)
  const friends = await Promise.all(
    (profiles ?? []).map(async (p: Record<string, unknown>) => {
      // Check sharing prefs
      const { data: prefs } = await sb
        .from('statistics_preferences')
        .select('*')
        .eq('user_id', p.id as string)
        .single();

      const shareOk = prefs?.share_with_friends !== false;

      let totalWorkSeconds = 0;
      let totalPomodoros = 0;

      if (shareOk) {
        const { data: sessions } = await sb
          .from('pomodoro_sessions')
          .select('duration_seconds')
          .eq('user_id', p.id as string)
          .eq('mode', 'work');

        totalPomodoros = sessions?.length ?? 0;
        totalWorkSeconds = sessions?.reduce(
          (sum, s) => sum + (s.duration_seconds as number), 0,
        ) ?? 0;
      }

      return {
        userId: p.id,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        totalWorkSeconds: shareOk ? totalWorkSeconds : 0,
        totalPomodoros: shareOk ? totalPomodoros : 0,
        streak: 0, // Simplified; full streak calc can be added
      };
    }),
  );

  res.json(friends);
});

// POST /friends/requests — send friend request
router.post('/requests', async (req: AuthenticatedRequest, res) => {
  const { to_user_id } = z.object({ to_user_id: z.string().uuid() }).parse(req.body);
  const sb = createUserClient(req.accessToken!);

  if (to_user_id === req.userId) {
    res.status(400).json({ error: 'Cannot send request to yourself' });
    return;
  }

  const { data, error } = await sb
    .from('friendship_requests')
    .insert({ from_user_id: req.userId, to_user_id })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json(data);
});

// GET /friends/requests/incoming
router.get('/requests/incoming', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data } = await sb
    .from('friendship_requests')
    .select('*, users!friendship_requests_from_user_id_fkey(display_name, avatar_url)')
    .eq('to_user_id', req.userId!)
    .eq('status', 'pending');

  res.json(data ?? []);
});

// GET /friends/requests/outgoing
router.get('/requests/outgoing', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data } = await sb
    .from('friendship_requests')
    .select('*, users!friendship_requests_to_user_id_fkey(display_name, avatar_url)')
    .eq('from_user_id', req.userId!)
    .eq('status', 'pending');

  res.json(data ?? []);
});

// POST /friends/requests/:id/accept
router.post('/requests/:id/accept', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);

  const { data: request, error: findErr } = await sb
    .from('friendship_requests')
    .select('*')
    .eq('id', req.params.id)
    .eq('to_user_id', req.userId!)
    .eq('status', 'pending')
    .single();

  if (findErr || !request) { res.status(404).json({ error: 'Request not found' }); return; }

  // Update request status
  await sb.from('friendship_requests').update({ status: 'accepted' }).eq('id', req.params.id);

  // Create friendship (ensure user_a < user_b)
  const [a, b] = [request.from_user_id as string, req.userId!].sort();
  await sb.from('friendships').insert({ user_a: a, user_b: b });

  res.json({ ok: true });
});

// POST /friends/requests/:id/reject
router.post('/requests/:id/reject', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  await sb.from('friendship_requests').update({ status: 'rejected' }).eq('id', req.params.id).eq('to_user_id', req.userId!);
  res.json({ ok: true });
});

// DELETE /friends/:userId — remove friend
router.delete('/:userId', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const [a, b] = [req.userId!, req.params.userId].sort();
  await sb.from('friendships').delete().eq('user_a', a).eq('user_b', b);
  res.json({ ok: true });
});

// GET /friends/stats-prefs — own sharing preferences
router.get('/stats-prefs', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data } = await sb
    .from('statistics_preferences')
    .select('*')
    .eq('user_id', req.userId!)
    .single();

  if (!data) {
    const { data: created } = await sb
      .from('statistics_preferences')
      .insert({ user_id: req.userId })
      .select()
      .single();
    res.json(created);
    return;
  }
  res.json(data);
});

// PATCH /friends/stats-prefs — update sharing preferences
router.patch('/stats-prefs', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb
    .from('statistics_preferences')
    .update(req.body)
    .eq('user_id', req.userId!)
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(data);
});

export default router;
