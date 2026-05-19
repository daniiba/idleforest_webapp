ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_rewards_company_id ON public.user_rewards(company_id);

UPDATE public.user_rewards AS reward
SET company_id = profile.company_id,
    updated_at = NOW()
FROM public.profiles AS profile
WHERE reward.user_id = profile.user_id
    AND reward.company_id IS NULL
    AND profile.company_id IS NOT NULL;
