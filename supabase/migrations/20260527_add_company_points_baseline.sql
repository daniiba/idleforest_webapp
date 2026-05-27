ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS company_points_baseline BIGINT NOT NULL DEFAULT 0;
