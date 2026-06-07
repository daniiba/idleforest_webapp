ALTER TABLE public.companies
  ALTER COLUMN payout_rate_cents_per_1000_points SET DEFAULT 27;

UPDATE public.companies
SET payout_rate_cents_per_1000_points = 27;
