-- Kingdom Dating — fantasy onboarding (no signup form)
-- Run in Supabase SQL Editor.
-- ALSO: Authentication -> Providers (or Sign In / Providers) -> enable "Allow anonymous sign-ins".

-- Age is no longer typed in; users swear an 18+ oath instead.
ALTER TABLE profiles ALTER COLUMN age DROP NOT NULL;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_age_check;

-- Name is auto-generated in-world, so it can start out as a placeholder.
ALTER TABLE profiles ALTER COLUMN name SET DEFAULT 'Wanderer';

-- Record when the 18+ oath was taken.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oath_taken_at TIMESTAMPTZ;
