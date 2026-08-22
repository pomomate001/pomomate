/**
 * Room assets routes — file upload metadata & presigned URLs.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient, adminClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const UploadAssetSchema = z.object({
  room_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_type: z.string().min(1),
  file_size: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
});

// POST /assets/upload — get presigned upload URL + create metadata
router.post('/upload', async (req: AuthenticatedRequest, res) => {
  try {
    const body = UploadAssetSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);

    // Verify user is a room member
    const { data: membership } = await sb
      .from('room_members')
      .select('id')
      .eq('room_id', body.room_id)
      .eq('user_id', req.userId!)
      .single();

    if (!membership) {
      res.status(403).json({ error: 'Not a room member' });
      return;
    }

    // Generate storage path
    const ext = body.file_name.split('.').pop() ?? 'bin';
    const storagePath = `${body.room_id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Get presigned upload URL
    const { data: signedData, error: signErr } = await adminClient.storage
      .from('room-assets')
      .createSignedUploadUrl(storagePath);

    if (signErr) { res.status(400).json({ error: signErr.message }); return; }

    // Create metadata record
    const { data: asset, error: insertErr } = await sb
      .from('room_assets')
      .insert({
        room_id: body.room_id,
        uploaded_by: req.userId,
        file_name: body.file_name,
        file_type: body.file_type,
        file_size: body.file_size,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (insertErr) { res.status(400).json({ error: insertErr.message }); return; }

    res.status(201).json({
      asset,
      uploadUrl: signedData.signedUrl,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    res.status(400).json({ error: msg });
  }
});

// GET /assets/room/:roomId — list assets for a room
router.get('/room/:roomId', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb
    .from('room_assets')
    .select('*')
    .eq('room_id', req.params.roomId)
    .order('created_at', { ascending: false });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(data);
});

// DELETE /assets/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);

  // Get asset to delete from storage
  const { data: asset } = await sb
    .from('room_assets')
    .select('storage_path')
    .eq('id', req.params.id)
    .single();

  if (asset) {
    await adminClient.storage.from('room-assets').remove([asset.storage_path as string]);
    await sb.from('room_assets').delete().eq('id', req.params.id);
  }

  res.json({ ok: true });
});

export default router;
