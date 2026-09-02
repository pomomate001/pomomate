-- 008: Convert subscription_tier to PostgreSQL ENUM type for Table Editor dropdown support

-- 1. Drop existing CHECK constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

-- 2. Drop existing default
ALTER TABLE public.users ALTER COLUMN subscription_tier DROP DEFAULT;

-- 3. Create ENUM type if not exists
DO 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium');
  END IF;
END ;

-- 4. Alter column to use ENUM type
ALTER TABLE public.users 
  ALTER COLUMN subscription_tier TYPE subscription_tier 
  USING subscription_tier::subscription_tier;

-- 5. Restore default value
ALTER TABLE public.users ALTER COLUMN subscription_tier SET DEFAULT 'free'::subscription_tier;
