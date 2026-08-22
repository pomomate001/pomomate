-- PomoMate — Initial database schema
-- Run against Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ───
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── USER PREFERENCES ───
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL DEFAULT 'light',
  timer_design_id TEXT NOT NULL DEFAULT 'circle',
  background_effect_id TEXT NOT NULL DEFAULT 'none',
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_id TEXT NOT NULL DEFAULT 'default',
  work_duration_seconds INT NOT NULL DEFAULT 1500,
  short_break_duration_seconds INT NOT NULL DEFAULT 300,
  long_break_duration_seconds INT NOT NULL DEFAULT 900,
  cycles_before_long_break INT NOT NULL DEFAULT 4,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ROOMS ───
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES users(id),
  invite_code TEXT UNIQUE NOT NULL,
  max_members INT NOT NULL DEFAULT 8 CHECK (max_members <= 8),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rooms_invite_code ON rooms(invite_code);
CREATE INDEX idx_rooms_host ON rooms(host_id);

-- ─── ROOM MEMBERS ───
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('host', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id)
);

CREATE INDEX idx_room_members_room ON room_members(room_id);

-- ─── ROOM STATE (host-authoritative timer & metadata) ───
CREATE TABLE IF NOT EXISTS room_state (
  room_id UUID PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE,
  timer_mode TEXT NOT NULL DEFAULT 'work' CHECK (timer_mode IN ('work', 'shortBreak', 'longBreak')),
  timer_remaining_seconds INT NOT NULL DEFAULT 1500,
  timer_is_running BOOLEAN NOT NULL DEFAULT false,
  current_cycle INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── TASKS ───
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  pomodoro_count INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_room ON tasks(room_id);

-- ─── MESSAGES ───
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_room ON messages(room_id, created_at);

-- ─── POMODORO SESSIONS ───
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  duration_seconds INT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'work' CHECK (mode IN ('work', 'shortBreak', 'longBreak')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pomodoro_sessions_user ON pomodoro_sessions(user_id, completed_at);

-- ─── COMPLETED TASKS (historical log) ───
CREATE TABLE IF NOT EXISTS completed_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_completed_tasks_user ON completed_tasks(user_id, completed_at);

-- ─── FRIENDSHIPS ───
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE INDEX idx_friendships_a ON friendships(user_a);
CREATE INDEX idx_friendships_b ON friendships(user_b);

-- ─── FRIENDSHIP REQUESTS ───
CREATE TABLE IF NOT EXISTS friendship_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

-- ─── STATISTICS PREFERENCES (sharing permissions) ───
CREATE TABLE IF NOT EXISTS statistics_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  share_with_friends BOOLEAN NOT NULL DEFAULT true,
  share_total_time BOOLEAN NOT NULL DEFAULT true,
  share_pomodoro_count BOOLEAN NOT NULL DEFAULT true,
  share_streak BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── REFERRALS ───
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);

-- ─── ROOM ASSETS (files, images, PDFs) ───
CREATE TABLE IF NOT EXISTS room_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- MIME type
  file_size INT NOT NULL,   -- bytes
  storage_path TEXT NOT NULL, -- Supabase Storage path
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_room_assets_room ON room_assets(room_id);

-- ─── UPDATED_AT TRIGGER ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_room_state_updated_at
  BEFORE UPDATE ON room_state FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_statistics_preferences_updated_at
  BEFORE UPDATE ON statistics_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
