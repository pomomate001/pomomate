-- PomoMate — Row Level Security policies
-- Requires Supabase auth.uid()

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE statistics_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_assets ENABLE ROW LEVEL SECURITY;

-- ─── USERS ───
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);
-- Friends can see basic profile
CREATE POLICY "Friends can read profile"
  ON users FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE (user_a = auth.uid() AND user_b = id)
         OR (user_b = auth.uid() AND user_a = id)
    )
  );

-- ─── USER PREFERENCES ───
CREATE POLICY "Own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ─── ROOMS ───
CREATE POLICY "Room members can view rooms"
  ON rooms FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members WHERE room_id = id AND user_id = auth.uid())
    OR host_id = auth.uid()
  );
CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update room"
  ON rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Host can delete room"
  ON rooms FOR DELETE USING (auth.uid() = host_id);

-- ─── ROOM MEMBERS ───
CREATE POLICY "Members can view members"
  ON room_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members rm WHERE rm.room_id = room_id AND rm.user_id = auth.uid())
  );
CREATE POLICY "Users can join (insert self)"
  ON room_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave (delete self) or host can remove"
  ON room_members FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM rooms WHERE id = room_id AND host_id = auth.uid())
  );

-- ─── ROOM STATE ───
CREATE POLICY "Room members can view state"
  ON room_state FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members WHERE room_id = room_state.room_id AND user_id = auth.uid())
  );
CREATE POLICY "Host can update state"
  ON room_state FOR UPDATE USING (
    EXISTS (SELECT 1 FROM rooms WHERE id = room_state.room_id AND host_id = auth.uid())
  );

-- ─── TASKS ───
CREATE POLICY "Own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);
-- Room members can view room tasks
CREATE POLICY "Room tasks visible to members"
  ON tasks FOR SELECT USING (
    room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM room_members WHERE room_id = tasks.room_id AND user_id = auth.uid()
    )
  );

-- ─── MESSAGES ───
CREATE POLICY "Room members can view messages"
  ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members WHERE room_id = messages.room_id AND user_id = auth.uid())
  );
CREATE POLICY "Room members can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM room_members WHERE room_id = messages.room_id AND user_id = auth.uid())
  );

-- ─── POMODORO SESSIONS ───
CREATE POLICY "Own sessions" ON pomodoro_sessions
  FOR ALL USING (auth.uid() = user_id);

-- ─── COMPLETED TASKS ───
CREATE POLICY "Own completed tasks" ON completed_tasks
  FOR ALL USING (auth.uid() = user_id);

-- ─── FRIENDSHIPS ───
CREATE POLICY "Friendship parties can view"
  ON friendships FOR SELECT USING (
    auth.uid() = user_a OR auth.uid() = user_b
  );
CREATE POLICY "Friendship parties can delete"
  ON friendships FOR DELETE USING (
    auth.uid() = user_a OR auth.uid() = user_b
  );

-- ─── FRIENDSHIP REQUESTS ───
CREATE POLICY "Sender and receiver can view"
  ON friendship_requests FOR SELECT USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );
CREATE POLICY "Authenticated users can send requests"
  ON friendship_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Receiver can update status"
  ON friendship_requests FOR UPDATE USING (auth.uid() = to_user_id);

-- ─── STATISTICS PREFERENCES ───
CREATE POLICY "Own stats prefs" ON statistics_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ─── REFERRALS ───
CREATE POLICY "Referrer can view own referrals"
  ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Referred can view own"
  ON referrals FOR SELECT USING (auth.uid() = referred_id);

-- ─── ROOM ASSETS ───
CREATE POLICY "Room members can view assets"
  ON room_assets FOR SELECT USING (
    EXISTS (SELECT 1 FROM room_members WHERE room_id = room_assets.room_id AND user_id = auth.uid())
  );
CREATE POLICY "Room members can upload assets"
  ON room_assets FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (SELECT 1 FROM room_members WHERE room_id = room_assets.room_id AND user_id = auth.uid())
  );
CREATE POLICY "Uploader or host can delete assets"
  ON room_assets FOR DELETE USING (
    auth.uid() = uploaded_by
    OR EXISTS (SELECT 1 FROM rooms WHERE id = room_assets.room_id AND host_id = auth.uid())
  );
