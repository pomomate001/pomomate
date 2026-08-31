-- PomoMate — M07 Social Features Migration
-- Tags, User Tags, User Blocks, Buddy Sessions, Buddy Emojis

-- ─── TAGS (200 önceden tanımlı etiket) ───
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'language', 'hobby', 'game', 'music', 'subject',
    'lifestyle', 'tech', 'creative', 'sport', 'entertainment'
  )),
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_tags_category ON tags(category);
CREATE INDEX idx_tags_slug ON tags(slug);

-- ─── USER TAGS (kullanıcıların seçtiği etiketler, maks 8) ───
CREATE TABLE IF NOT EXISTS user_tags (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tag_id)
);

CREATE INDEX idx_user_tags_user ON user_tags(user_id);
CREATE INDEX idx_user_tags_tag ON user_tags(tag_id);

-- Enforce max 8 tags per user
CREATE OR REPLACE FUNCTION check_max_user_tags()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM user_tags WHERE user_id = NEW.user_id) >= 8 THEN
    RAISE EXCEPTION 'A user can have at most 8 tags';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_max_user_tags
  BEFORE INSERT ON user_tags
  FOR EACH ROW EXECUTE FUNCTION check_max_user_tags();

-- ─── USERS — Add country_code column ───
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT NULL;

CREATE INDEX idx_users_country ON users(country_code);

-- ─── USER BLOCKS ───
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);

-- ─── FRIENDSHIP REQUESTS — Add request_count ───
ALTER TABLE friendship_requests ADD COLUMN IF NOT EXISTS request_count INT NOT NULL DEFAULT 1;

-- ─── BUDDY SESSIONS ───
CREATE TABLE IF NOT EXISTS buddy_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'ended')),
  timer_mode TEXT NOT NULL DEFAULT 'work'
    CHECK (timer_mode IN ('work', 'shortBreak', 'longBreak')),
  timer_remaining_seconds INT NOT NULL DEFAULT 1500,
  timer_is_running BOOLEAN NOT NULL DEFAULT false,
  current_cycle INT NOT NULL DEFAULT 1,
  active_task_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_buddy_sessions_host ON buddy_sessions(host_id);
CREATE INDEX idx_buddy_sessions_guest ON buddy_sessions(guest_id);
CREATE INDEX idx_buddy_sessions_status ON buddy_sessions(status);

CREATE TRIGGER trg_buddy_sessions_updated_at
  BEFORE UPDATE ON buddy_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── BUDDY EMOJIS ───
CREATE TABLE IF NOT EXISTS buddy_emojis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES buddy_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji_code TEXT NOT NULL CHECK (emoji_code IN ('wave', 'start', 'hello', 'break', 'focus', 'cheer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_buddy_emojis_session ON buddy_emojis(session_id, created_at);

-- ─── RLS POLICIES ───

-- Tags: Everyone can read
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tags" ON tags FOR SELECT USING (true);

-- User Tags
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own user tags full access" ON user_tags
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Friends can view user tags" ON user_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_a = auth.uid() AND user_b = user_tags.user_id)
         OR (user_b = auth.uid() AND user_a = user_tags.user_id)
    )
  );
-- Users in same country can view tags (for discovery)
CREATE POLICY "Same country users can view tags" ON user_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u1
      JOIN users u2 ON u1.country_code = u2.country_code
      WHERE u1.id = auth.uid() AND u2.id = user_tags.user_id
        AND u1.country_code IS NOT NULL
    )
  );

-- User Blocks
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own blocks full access" ON user_blocks
  FOR ALL USING (auth.uid() = blocker_id);

-- Buddy Sessions
ALTER TABLE buddy_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants can view" ON buddy_sessions
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id);
CREATE POLICY "Host can create sessions" ON buddy_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Participants can update sessions" ON buddy_sessions
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Buddy Emojis
ALTER TABLE buddy_emojis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants can view emojis" ON buddy_emojis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM buddy_sessions
      WHERE id = buddy_emojis.session_id
        AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );
CREATE POLICY "Participants can send emojis" ON buddy_emojis
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM buddy_sessions
      WHERE id = buddy_emojis.session_id
        AND (host_id = auth.uid() OR guest_id = auth.uid())
    )
  );

-- Helper function to avoid RLS infinite recursion when looking up country code
CREATE OR REPLACE FUNCTION public.get_my_country_code()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT country_code FROM public.users WHERE id = auth.uid();
$$;

-- Users: allow same-country users to see basic profile for discovery
CREATE POLICY "Same country users can view basic profile" ON users
  FOR SELECT USING (
    country_code IS NOT NULL 
    AND country_code = public.get_my_country_code()
  );

