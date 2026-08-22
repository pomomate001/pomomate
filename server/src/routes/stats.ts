/**
 * Statistics routes — pomodoro sessions, daily/weekly/monthly aggregation, streak.
 */
import { Router } from 'express';
import { z } from 'zod';
import { createUserClient } from '../supabase.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const RecordSessionSchema = z.object({
  duration_seconds: z.number().int().min(1),
  mode: z.enum(['work', 'shortBreak', 'longBreak']),
  room_id: z.string().uuid().optional(),
});

// POST /stats/sessions — record a completed pomodoro
router.post('/sessions', async (req: AuthenticatedRequest, res) => {
  try {
    const body = RecordSessionSchema.parse(req.body);
    const sb = createUserClient(req.accessToken!);
    const { data, error } = await sb
      .from('pomodoro_sessions')
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

// GET /stats/summary — aggregated stats
router.get('/summary', async (req: AuthenticatedRequest, res) => {
  const sb = createUserClient(req.accessToken!);

  // Total pomodoros + work seconds
  const { data: sessions } = await sb
    .from('pomodoro_sessions')
    .select('duration_seconds, completed_at')
    .eq('user_id', req.userId!)
    .eq('mode', 'work');

  const totalPomodoros = sessions?.length ?? 0;
  const totalWorkSeconds = sessions?.reduce((sum, s) => sum + (s.duration_seconds as number), 0) ?? 0;

  // Total completed tasks
  const { count: totalTasks } = await sb
    .from('completed_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.userId!);

  // Streak calculation — consecutive days with at least 1 work session
  const streak = calculateStreak(sessions ?? []);

  res.json({
    totalPomodoros,
    totalWorkSeconds,
    totalTasksCompleted: totalTasks ?? 0,
    streak,
  });
});

// GET /stats/daily?days=7 — daily breakdown
router.get('/daily', async (req: AuthenticatedRequest, res) => {
  const days = parseInt(req.query.days as string) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sb = createUserClient(req.accessToken!);

  const { data: sessions } = await sb
    .from('pomodoro_sessions')
    .select('duration_seconds, completed_at')
    .eq('user_id', req.userId!)
    .eq('mode', 'work')
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: true });

  const { data: tasks } = await sb
    .from('completed_tasks')
    .select('completed_at')
    .eq('user_id', req.userId!)
    .gte('completed_at', since.toISOString());

  // Group by date
  const dailyMap = new Map<string, { totalSeconds: number; pomodoros: number; tasks: number }>();

  for (const s of sessions ?? []) {
    const date = (s.completed_at as string).slice(0, 10);
    const entry = dailyMap.get(date) ?? { totalSeconds: 0, pomodoros: 0, tasks: 0 };
    entry.totalSeconds += s.duration_seconds as number;
    entry.pomodoros += 1;
    dailyMap.set(date, entry);
  }

  for (const t of tasks ?? []) {
    const date = (t.completed_at as string).slice(0, 10);
    const entry = dailyMap.get(date) ?? { totalSeconds: 0, pomodoros: 0, tasks: 0 };
    entry.tasks += 1;
    dailyMap.set(date, entry);
  }

  const result = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json(result);
});

function calculateStreak(sessions: Array<{ completed_at: unknown }>): number {
  if (sessions.length === 0) return 0;

  const dates = new Set(sessions.map((s) => (s.completed_at as string).slice(0, 10)));
  const sortedDates = Array.from(dates).sort().reverse();

  // Check if today or yesterday has a session
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) return 0;

  let streak = 0;
  let checkDate = new Date(sortedDates[0]);

  for (const d of sortedDates) {
    const expected = checkDate.toISOString().slice(0, 10);
    if (d === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export default router;
