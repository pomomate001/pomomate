/**
 * Task CRUD + sort persistence.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500),
  room_id: z.string().uuid().optional(),
});

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  pomodoro_count: z.number().int().min(0).optional(),
  sort_order: z.number().int().optional(),
});

const ReorderSchema = z.object({
  task_ids: z.array(z.string().uuid()),
});

// GET /tasks
router.get('/', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  const { data, error } = await sb
    .from('tasks')
    .select('*')
    .eq('user_id', req.userId!)
    .order('sort_order', { ascending: true });

  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json(data);
});

// POST /tasks
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const body = CreateTaskSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);

    const { data, error } = await sb
      .from('tasks')
      .insert({ ...body, user_id: req.userId })
      .select()
      .single();

    if (error) { res.status(400).json({ error: error.message }); return; }
    res.status(201).json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    res.status(400).json({ error: msg });
  }
});

// PATCH /tasks/:id
router.patch('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const patch = UpdateTaskSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);

    // If task is being completed, log it
    if (patch.completed === true) {
      const { data: task } = await sb.from('tasks').select('title').eq('id', req.params.id).single();
      if (task) {
        await sb.from('completed_tasks').insert({
          user_id: req.userId,
          task_title: task.title,
        });
      }
    }

    const { data, error } = await sb
      .from('tasks')
      .update(patch)
      .eq('id', req.params.id)
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

// DELETE /tasks/:id
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);
  await sb.from('tasks').delete().eq('id', req.params.id).eq('user_id', req.userId!);
  res.json({ ok: true });
});

// POST /tasks/reorder — persist drag & drop sort order
router.post('/reorder', async (req: AuthenticatedRequest, res) => {
  try {
    const { task_ids } = ReorderSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);

    const updates = task_ids.map((id, idx) =>
      sb.from('tasks').update({ sort_order: idx }).eq('id', id).eq('user_id', req.userId!),
    );
    await Promise.all(updates);
    res.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Bad request';
    res.status(400).json({ error: msg });
  }
});

export default router;
