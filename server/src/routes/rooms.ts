/**
 * Room CRUD + invitation + members routes.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { generateInviteCode } from '../utils/invite.js';

const router = Router();

const CreateRoomSchema = z.object({
  name: z.string().min(1).max(100),
});

// POST /rooms — create
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { name } = CreateRoomSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);
    const inviteCode = generateInviteCode();

    const { data: room, error } = await sb
      .from('rooms')
      .insert({ name, host_id: req.userId, invite_code: inviteCode })
      .select()
      .single();

    if (error) { res.status(400).json({ error: error.message }); return; }

    // Add host as member
    await sb.from('room_members').insert({
      room_id: room.id,
      user_id: req.userId,
      role: 'host',
    });

    // Init room state
    await sb.from('room_state').insert({ room_id: room.id });

    res.status(201).json(room);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    res.status(400).json({ error: msg });
  }
});

// GET /rooms — list user's rooms
router.get('/', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);

  const { data, error } = await sb
    .from('room_members')
    .select('room_id, rooms(*)')
    .eq('user_id', req.userId!);

  if (error) { res.status(400).json({ error: error.message }); return; }
  const rooms = data?.map((rm: Record<string, unknown>) => rm.rooms) ?? [];
  res.json(rooms);
});

// GET /rooms/:id
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb.from('rooms').select('*').eq('id', req.params.id).single();
  if (error) { res.status(404).json({ error: error.message }); return; }
  res.json(data);
});

// POST /rooms/join — join by invite code
router.post('/join', async (req: AuthenticatedRequest, res) => {
  const { code } = z.object({ code: z.string() }).parse(req.body);
  const sb = createUserClient(req.accessToken!);

  const { data: room, error: findErr } = await sb
    .from('rooms')
    .select('*')
    .eq('invite_code', code)
    .eq('is_active', true)
    .single();

  if (findErr || !room) { res.status(404).json({ error: 'Room not found or inactive' }); return; }

  // Check capacity
  const { count } = await sb
    .from('room_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);

  if ((count ?? 0) >= room.max_members) {
    res.status(403).json({ error: 'Room is full' });
    return;
  }

  const { error: joinErr } = await sb
    .from('room_members')
    .insert({ room_id: room.id, user_id: req.userId, role: 'member' });

  if (joinErr) { res.status(400).json({ error: joinErr.message }); return; }
  res.json(room);
});

// POST /rooms/:id/leave
router.post('/:id/leave', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  await sb.from('room_members').delete().eq('room_id', req.params.id).eq('user_id', req.userId!);
  res.json({ ok: true });
});

// GET /rooms/:id/members
router.get('/:id/members', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb
    .from('room_members')
    .select('*, users(display_name, avatar_url)')
    .eq('room_id', req.params.id);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(data);
});

export default router;
