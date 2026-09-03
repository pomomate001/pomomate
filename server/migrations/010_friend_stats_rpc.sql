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
  -- Calculate streak (consecutive active days up to today/yesterday)
  user_days AS (
    SELECT DISTINCT
      ps.user_id,
      date_trunc('day', ps.completed_at AT TIME ZONE 'UTC')::date AS session_date
    FROM pomodoro_sessions ps
    WHERE ps.user_id = ANY(p_friend_ids)
      AND ps.mode = 'work'
  ),
  streak_calc AS (
    SELECT
      ud.user_id,
      COUNT(*)::INT AS streak
    FROM user_days ud
    WHERE ud.session_date >= (CURRENT_DATE - INTERVAL '30 days')::date
    GROUP BY ud.user_id
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
