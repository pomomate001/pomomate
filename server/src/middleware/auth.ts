/**
 * Auth middleware — validates Supabase JWT and attaches user info to request.
 */
import type { Request, Response, NextFunction } from 'express';
import { adminClient } from '../supabase.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  accessToken?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = header.slice(7);

  try {
    const { data, error } = await adminClient.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = data.user.id;
    req.accessToken = token;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
