ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS provider TEXT;

ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS provider_response JSONB;

ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS error_message TEXT;

ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.user_rewards
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_rewards_status_check'
            AND conrelid = 'public.user_rewards'::regclass
    ) THEN
        ALTER TABLE public.user_rewards
        ADD CONSTRAINT user_rewards_status_check
        CHECK (status IN ('pending', 'processing', 'awarded', 'failed'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_rewards_user_id_reward_type_key'
            AND conrelid = 'public.user_rewards'::regclass
    ) THEN
        ALTER TABLE public.user_rewards
        ADD CONSTRAINT user_rewards_user_id_reward_type_key
        UNIQUE (user_id, reward_type);
    END IF;
END $$;

UPDATE public.user_rewards
SET
    trees_awarded = 5,
    updated_at = NOW()
WHERE reward_type = 'desktop_first_connect'
    AND status IN ('pending', 'failed')
    AND trees_awarded < 5;

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_type ON public.user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON public.user_rewards(status);
