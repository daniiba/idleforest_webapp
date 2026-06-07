ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS impact_mode TEXT NOT NULL DEFAULT 'idleforest_planting',
  ADD COLUMN IF NOT EXISTS payout_recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS payout_recipient_url TEXT,
  ADD COLUMN IF NOT EXISTS payout_notes TEXT,
  ADD COLUMN IF NOT EXISTS payout_rate_cents_per_1000_points INTEGER NOT NULL DEFAULT 27;

UPDATE public.companies
SET
  impact_mode = COALESCE(impact_mode, 'idleforest_planting'),
  payout_rate_cents_per_1000_points = COALESCE(payout_rate_cents_per_1000_points, 27);

ALTER TABLE public.companies
  ALTER COLUMN impact_mode SET DEFAULT 'idleforest_planting',
  ALTER COLUMN impact_mode SET NOT NULL,
  ALTER COLUMN payout_rate_cents_per_1000_points SET DEFAULT 27,
  ALTER COLUMN payout_rate_cents_per_1000_points SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'companies_impact_mode_check'
      AND conrelid = 'public.companies'::regclass
  ) THEN
    ALTER TABLE public.companies
      ADD CONSTRAINT companies_impact_mode_check
      CHECK (impact_mode IN ('idleforest_planting', 'company_named_donation', 'partner_payout'));
  END IF;
END $$;

UPDATE public.companies
SET
  impact_mode = 'partner_payout',
  payout_recipient_name = COALESCE(payout_recipient_name, 'Silveira Tech'),
  payout_recipient_url = COALESCE(payout_recipient_url, 'https://silveiratech.pt/'),
  payout_notes = COALESCE(payout_notes, 'Send generated company forest funds directly to Silveira Tech for regeneration work.'),
  payout_rate_cents_per_1000_points = COALESCE(payout_rate_cents_per_1000_points, 27)
WHERE slug = 'silveira';
