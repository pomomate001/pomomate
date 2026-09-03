-- 011: Referral and Free 1-Month Pro Reward System
-- Enables 3 friend invites -> 1 month free Premium

-- 1. Users table modifications
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_reward_claimed_count INT NOT NULL DEFAULT 0;

-- Backfill referral_code for existing users
UPDATE public.users 
SET referral_code = UPPER(SUBSTRING(id::text, 1, 8))
WHERE referral_code IS NULL OR referral_code = '';

-- Add unique constraint & index on referral_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON public.users(referred_by);

-- Trigger to set referral_code on new user insert if not specified
CREATE OR REPLACE FUNCTION public.set_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := UPPER(SUBSTRING(NEW.id::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_user_referral_code ON public.users;
CREATE TRIGGER trg_set_user_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_user_referral_code();

-- 2. Referrals table constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_status ON public.referrals(referrer_id, status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referrer can view own referrals" ON public.referrals;
CREATE POLICY "Referrer can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Referred can view own" ON public.referrals;
CREATE POLICY "Referred can view own" ON public.referrals
  FOR SELECT USING (auth.uid() = referred_id);


-- 3. RPC: Apply referral code (Called when a new/existing user enters a referral code)
CREATE OR REPLACE FUNCTION public.apply_referral_code(code_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cleaned_code TEXT;
  v_referrer_id UUID;
  v_referrer_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized', 'message', 'Oturum açmanız gerekiyor.');
  END IF;

  v_cleaned_code := UPPER(TRIM(COALESCE(code_input, '')));
  IF v_cleaned_code = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'empty_code', 'message', 'Lütfen geçerli bir davet kodu girin.');
  END IF;

  -- Check if current user already has a referrer
  IF EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id AND referred_by IS NOT NULL) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_referred', 'message', 'Daha önce bir davet kodu kullandınız.');
  END IF;

  -- Find the referrer by referral_code or uuid prefix
  SELECT id, display_name INTO v_referrer_id, v_referrer_name
  FROM public.users
  WHERE UPPER(referral_code) = v_cleaned_code OR UPPER(SUBSTRING(id::text, 1, 8)) = v_cleaned_code
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_code', 'message', 'Geçersiz davet kodu. Lütfen kontrol edin.');
  END IF;

  -- Cannot refer yourself
  IF v_referrer_id = v_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'self_referral', 'message', 'Kendi davet kodunuzu kullanamazsınız.');
  END IF;

  -- Cannot have cyclic referral (A referred B, so B cannot refer A)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = v_referrer_id AND referred_by = v_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'cyclic_referral', 'message', 'Karşılıklı referans kullanılamaz.');
  END IF;

  -- Insert referral record
  INSERT INTO public.referrals (referrer_id, referred_id, status)
  VALUES (v_referrer_id, v_user_id, 'completed')
  ON CONFLICT (referred_id) DO UPDATE SET status = 'completed';

  -- Update user record
  UPDATE public.users
  SET referred_by = v_referrer_id, updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'referrerName', COALESCE(v_referrer_name, 'Arkadaşın'),
    'message', 'Davet kodu başarıyla uygulandı!'
  );
END;
$$;


-- 4. RPC: Get referral statistics
CREATE OR REPLACE FUNCTION public.get_referral_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_my_code TEXT;
  v_referred_by UUID;
  v_premium_until TIMESTAMPTZ;
  v_tier TEXT;
  v_claimed_count INT;
  v_completed_count INT;
  v_friends JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized', 'message', 'Oturum açmanız gerekiyor.');
  END IF;

  SELECT referral_code, referred_by, premium_until, subscription_tier::text, referral_reward_claimed_count
  INTO v_my_code, v_referred_by, v_premium_until, v_tier, v_claimed_count
  FROM public.users WHERE id = v_user_id;

  -- Ensure user has a referral code
  IF v_my_code IS NULL OR v_my_code = '' THEN
    v_my_code := UPPER(SUBSTRING(v_user_id::text, 1, 8));
    UPDATE public.users SET referral_code = v_my_code WHERE id = v_user_id;
  END IF;

  -- Count completed referrals
  SELECT COUNT(*) INTO v_completed_count
  FROM public.referrals
  WHERE referrer_id = v_user_id AND status = 'completed';

  -- List referred friends
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'displayName', COALESCE(u.display_name, 'PomoMate Kullanıcısı'),
      'createdAt', r.created_at
    ) ORDER BY r.created_at DESC
  ) INTO v_friends
  FROM public.referrals r
  JOIN public.users u ON u.id = r.referred_id
  WHERE r.referrer_id = v_user_id AND r.status = 'completed';

  RETURN jsonb_build_object(
    'success', true,
    'myCode', v_my_code,
    'completedCount', COALESCE(v_completed_count, 0),
    'requiredCount', 3,
    'claimedCount', COALESCE(v_claimed_count, 0),
    'canClaim', (COALESCE(v_completed_count, 0) >= (COALESCE(v_claimed_count, 0) + 1) * 3),
    'hasUsedReferral', (v_referred_by IS NOT NULL),
    'premiumUntil', v_premium_until,
    'subscriptionTier', v_tier,
    'friends', COALESCE(v_friends, '[]'::jsonb)
  );
END;
$$;


-- 5. RPC: Claim 1 month premium reward
CREATE OR REPLACE FUNCTION public.claim_referral_reward()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_claimed_count INT;
  v_current_premium_until TIMESTAMPTZ;
  v_completed_count INT;
  v_new_premium_until TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized', 'message', 'Oturum açmanız gerekiyor.');
  END IF;

  SELECT referral_reward_claimed_count, premium_until
  INTO v_claimed_count, v_current_premium_until
  FROM public.users WHERE id = v_user_id;

  SELECT COUNT(*) INTO v_completed_count
  FROM public.referrals
  WHERE referrer_id = v_user_id AND status = 'completed';

  IF COALESCE(v_completed_count, 0) < (COALESCE(v_claimed_count, 0) + 1) * 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_referrals',
      'message', '1 ay ücretsiz Pro kazanmak için en az 3 arkadaşının kaydolması gerekir.'
    );
  END IF;

  -- Add 30 days of premium from now or extend existing premium
  v_new_premium_until := COALESCE(GREATEST(v_current_premium_until, now()), now()) + INTERVAL '30 days';

  UPDATE public.users
  SET subscription_tier = 'premium',
      premium_until = v_new_premium_until,
      referral_reward_claimed_count = COALESCE(v_claimed_count, 0) + 1,
      updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'expiresAt', v_new_premium_until,
    'message', '1 Aylık Ücretsiz PomoMate Pro üyeliğiniz aktif edildi!'
  );
END;
$$;
