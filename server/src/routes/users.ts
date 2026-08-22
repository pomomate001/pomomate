/**
 * User profile + preferences + avatar routes.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient, adminClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

const UpdatePreferencesSchema = z.object({
  theme_id: z.string().optional(),
  timer_design_id: z.string().optional(),
  background_effect_id: z.string().optional(),
  sound_enabled: z.boolean().optional(),
  sound_id: z.string().optional(),
  work_duration_seconds: z.number().int().min(60).max(5400).optional(),
  short_break_duration_seconds: z.number().int().min(60).max(900).optional(),
  long_break_duration_seconds: z.number().int().min(300).max(3600).optional(),
  cycles_before_long_break: z.number().int().min(2).max(10).optional(),
});

// GET /users/me
router.get('/me', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb.from('users').select('*').eq('id', req.userId!).single();
  if (error) { res.status(404).json({ error: error.message }); return; }
  res.json(data);
});

// PATCH /users/me
router.patch('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const patch = UpdateProfileSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);
    const { data, error } = await sb
      .from('users')
      .update(patch)
      .eq('id', req.userId!)
      .select()
      .single();
    if (error) { res.status(400).json({ error: error.message }); return; }
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    res.status(400).json({ error: msg });
  }
});

// GET /users/me/preferences
router.get('/me/preferences', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb
    .from('user_preferences')
    .select('*')
    .eq('user_id', req.userId!)
    .single();

  if (error) {
    // Create default if not exists
    const { data: created, error: createErr } = await sb
      .from('user_preferences')
      .insert({ user_id: req.userId })
      .select()
      .single();
    if (createErr) { res.status(400).json({ error: createErr.message }); return; }
    res.json(created);
    return;
  }
  res.json(data);
});

// PATCH /users/me/preferences
router.patch('/me/preferences', async (req: AuthenticatedRequest, res) => {
  try {
    const patch = UpdatePreferencesSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);
    const { data, error } = await sb
      .from('user_preferences')
      .update(patch)
      .eq('user_id', req.userId!)
      .select()
      .single();
    if (error) { res.status(400).json({ error: error.message }); return; }
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    res.status(400).json({ error: msg });
  }
});

// POST /users/me/avatar — returns presigned upload URL
router.post('/me/avatar', async (req: AuthenticatedRequest, res) => {
  const path = `${req.userId}/avatar.jpg`;
  const { data, error } = await adminClient.storage
    .from('avatars')
    .createSignedUploadUrl(path);

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ uploadUrl: data.signedUrl, path });
});

export default router;
