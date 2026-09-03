-- 012_discover_country_filter.sql
-- Add country filter support to discover_users RPC

DROP FUNCTION IF EXISTS public.discover_users(INT, INT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.discover_users(INT, INT, TEXT, TEXT, BOOLEAN);

CREATE OR REPLACE FUNCTION public.discover_users(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_category TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_same_country_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  country_code TEXT,
  match_score INT,
  matching_tag_count INT,
  tags JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_my_country TEXT;
  v_my_tag_ids UUID[];
  v_my_categories TEXT[];
BEGIN
  -- Get current user's country code
  SELECT u.country_code INTO v_my_country
  FROM users u WHERE u.id = v_user_id;

  -- Get current user's tag IDs and categories
  SELECT
    COALESCE(array_agg(DISTINCT ut.tag_id), '{}'),
    COALESCE(array_agg(DISTINCT t.category), '{}')
  INTO v_my_tag_ids, v_my_categories
  FROM user_tags ut
  JOIN tags t ON t.id = ut.tag_id
  WHERE ut.user_id = v_user_id;

  RETURN QUERY
  WITH candidates AS (
    SELECT u.id, u.display_name, u.avatar_url, u.country_code
    FROM users u
    WHERE u.id != v_user_id
      -- Exclude existing friends
      AND NOT EXISTS (
        SELECT 1 FROM friendships f
        WHERE (f.user_a = v_user_id AND f.user_b = u.id)
           OR (f.user_b = v_user_id AND f.user_a = u.id)
      )
      -- Exclude blocked users (both directions)
      AND NOT EXISTS (
        SELECT 1 FROM user_blocks ub
        WHERE (ub.blocker_id = v_user_id AND ub.blocked_id = u.id)
           OR (ub.blocker_id = u.id AND ub.blocked_id = v_user_id)
      )
      -- Exclude pending outgoing friend requests
      AND NOT EXISTS (
        SELECT 1 FROM friendship_requests fr
        WHERE fr.from_user_id = v_user_id
          AND fr.to_user_id = u.id
          AND fr.status = 'pending'
      )
      -- Optional: name search filter
      AND (p_search IS NULL OR u.display_name ILIKE '%' || p_search || '%')
      -- Optional: category filter (user must have at least one tag in this category)
      AND (p_category IS NULL OR EXISTS (
        SELECT 1 FROM user_tags ut2
        JOIN tags t2 ON t2.id = ut2.tag_id
        WHERE ut2.user_id = u.id AND t2.category = p_category
      ))
      -- Country filter: if p_same_country_only is TRUE and user has a country, match same country
      AND (
        NOT p_same_country_only
        OR v_my_country IS NULL
        OR u.country_code = v_my_country
      )
  ),
  -- Aggregate all tags for each candidate user
  user_tags_agg AS (
    SELECT
      ut.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'slug', t.slug,
          'nameTr', t.name_tr,
          'nameEn', t.name_en,
          'category', t.category,
          'icon', t.icon
        ) ORDER BY t.category, t.sort_order
      ) AS tags_json,
      COUNT(*) FILTER (WHERE ut.tag_id = ANY(v_my_tag_ids))::INT AS exact_match_count,
      COUNT(*) FILTER (
        WHERE t.category = ANY(v_my_categories)
          AND NOT (ut.tag_id = ANY(v_my_tag_ids))
      )::INT AS cat_match_count
    FROM user_tags ut
    JOIN tags t ON t.id = ut.tag_id
    WHERE ut.user_id IN (SELECT c.id FROM candidates c)
    GROUP BY ut.user_id
  )
  SELECT
    c.id AS user_id,
    c.display_name,
    c.avatar_url,
    c.country_code,
    -- Multi-factor score: exact tag ×10, category ×3, same country +5
    (
      COALESCE(uta.exact_match_count, 0) * 10 +
      COALESCE(uta.cat_match_count, 0) * 3 +
      CASE
        WHEN v_my_country IS NOT NULL
          AND c.country_code IS NOT NULL
          AND c.country_code = v_my_country
        THEN 5
        ELSE 0
      END
    )::INT AS match_score,
    COALESCE(uta.exact_match_count, 0)::INT AS matching_tag_count,
    COALESCE(uta.tags_json, '[]'::JSONB) AS tags
  FROM candidates c
  LEFT JOIN user_tags_agg uta ON uta.user_id = c.id
  ORDER BY match_score DESC, random()
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.discover_users(INT, INT, TEXT, TEXT, BOOLEAN) TO authenticated;
