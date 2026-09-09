-- 010_friend_stats_rpc.sql
-- Function to retrieve aggregated Pomodoro statistics for a list of friend user IDs

DROP FUNCTION IF EXISTS public.get_friends_stats(UUID[]);

CREATE OR REPLACE FUNCTION public.get_friends_stats(p_friend_ids UUID[])
RETURNS TABLE (
  user_id UUID,
  total_work_seconds BIGINT,
  total_pomodoros BIGINT,
  streak INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH friend_sessions AS (
    SELECT 
      ps.user_id,
      COALESCE(SUM(ps.duration_seconds), 0)::BIGINT AS total_work_seconds,
      COUNT(ps.id)::BIGINT AS total_pomodoros
    FROM pomodoro_sessions ps
    WHERE ps.user_id = ANY(p_friend_ids)
      AND ps.mode = 'work'
    GROUP BY ps.user_id
  ),
  -- Get distinct active dates per user
  user_days AS (
    SELECT DISTINCT
      ps.user_id,
      (ps.completed_at AT TIME ZONE 'UTC')::date AS session_date
    FROM pomodoro_sessions ps
    WHERE ps.user_id = ANY(p_friend_ids)
      AND ps.mode = 'work'
  ),
  -- Calculate true consecutive-day streak counting backwards from today/yesterday
  ranked_days AS (
    SELECT
      ud.user_id,
      ud.session_date,
      -- gap = how many days between this session_date and the reference date (today)
      -- row_number gives the position when sorted descending
      -- If gap == row_number - 1, the day is part of a consecutive run from today
      (CURRENT_DATE - ud.session_date) AS gap,
      ROW_NUMBER() OVER (PARTITION BY ud.user_id ORDER BY ud.session_date DESC) AS rn
    FROM user_days ud
    -- Only consider recent dates for performance
    WHERE ud.session_date >= (CURRENT_DATE - INTERVAL '90 days')::date
  ),
  -- A day is consecutive from today if gap == rn - 1 (starting from today)
  -- or gap == rn (starting from yesterday, if today has no activity yet)
  streak_calc AS (
    SELECT
      rd.user_id,
      COUNT(*)::INT AS streak
    FROM ranked_days rd
    WHERE
      -- Case 1: streak includes today (gap starts at 0)
      (rd.gap = rd.rn - 1 AND EXISTS (
        SELECT 1 FROM ranked_days r2 WHERE r2.user_id = rd.user_id AND r2.gap = 0
      ))
      OR
      -- Case 2: streak starts from yesterday (gap starts at 1, no activity today)
      (rd.gap = rd.rn AND NOT EXISTS (
        SELECT 1 FROM ranked_days r2 WHERE r2.user_id = rd.user_id AND r2.gap = 0
      ) AND rd.gap >= 1)
    GROUP BY rd.user_id
  )
  SELECT 
    f_id AS user_id,
    COALESCE(fs.total_work_seconds, 0)::BIGINT AS total_work_seconds,
    COALESCE(fs.total_pomodoros, 0)::BIGINT AS total_pomodoros,
    COALESCE(sc.streak, 0)::INT AS streak
  FROM unnest(p_friend_ids) AS f_id
  LEFT JOIN friend_sessions fs ON fs.user_id = f_id
  LEFT JOIN streak_calc sc ON sc.user_id = f_id;
END;
$$;

-- Grant execute to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.get_friends_stats(UUID[]) TO authenticated, anon;

