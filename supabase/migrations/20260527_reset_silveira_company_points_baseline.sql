ALTER TABLE public.profiles
  ALTER COLUMN company_points_baseline TYPE BIGINT USING COALESCE(company_points_baseline, 0)::BIGINT,
  ALTER COLUMN company_points_baseline SET DEFAULT 0;

ALTER TABLE public.profiles
  ALTER COLUMN company_points_baseline SET NOT NULL;

UPDATE public.profiles AS profile
SET
  company_joined_at = NOW(),
  company_points_baseline = COALESCE(profile.total_points, 0)
FROM public.companies AS company
WHERE profile.company_id = company.id
  AND company.slug = 'silveira';
