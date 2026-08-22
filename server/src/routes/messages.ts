/**
 * Message persistence routes.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /messages/:roomId
router.get('/:roomId', async (req: AuthenticatedRequest, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const sb = createUserClient(req.accessToken!);

  const { data, error } = await sb
    .from('messages')
    .select('*, users(display_name, avatar_url)')
    .eq('room_id', req.params.roomId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json((data ?? []).reverse());
});

// POST /messages
router.post('/', async (req: AuthenticatedRequest, res) => {
  const body = z.object({
    room_id: z.string().uuid(),
    content: z.string().min(1).max(2000),
  }).parse(req.body);

  const sb = createUserClient(req.accessToken!);

  const { data, error } = await sb
    .from('messages')
    .insert({ ...body, user_id: req.userId })
    .select()
    .single();

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json(data);
});

export default router;
