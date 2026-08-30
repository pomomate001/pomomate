/**
 * PomoMate — Backend server entry point.
 *
 * Express REST API + WebSocket signaling server.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { env } from './config/env.js';
import { authMiddleware } from './middleware/auth.js';
import { setupSignaling } from './websocket/signaling.js';

// Routes
import roomsRouter from './routes/rooms.js';
import tasksRouter from './routes/tasks.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';
import friendsRouter from './routes/friends.js';
import assetsRouter from './routes/assets.js';
import messagesRouter from './routes/messages.js';
import referralsRouter from './routes/referrals.js';

import rateLimit from 'express-rate-limit';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Health check — no auth required
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// All API routes require auth
app.use('/api/rooms', authMiddleware, roomsRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/stats', authMiddleware, statsRouter);
app.use('/api/friends', authMiddleware, friendsRouter);
app.use('/api/assets', authMiddleware, assetsRouter);
app.use('/api/messages', authMiddleware, messagesRouter);
app.use('/api/referrals', authMiddleware, referralsRouter);

// Create HTTP server & attach WebSocket signaling
const server = createServer(app);
setupSignaling(server);

server.listen(env.port, () => {
  console.log(`PomoMate server running on port ${env.port}`);
  console.log(`WebSocket signaling at ws://localhost:${env.port}/ws/signaling`);
});

export default app;
