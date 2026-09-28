-- Canonical personal-referral loop for web and email acquisition.
-- This migration is intentionally safe to run after the legacy referral tables:
-- it reuses existing personal codes where possible and backfills known attribution.

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS referral_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_unique
    ON public.profiles (UPPER(referral_code))
    WHERE referral_code IS NOT NULL;

COMMENT ON COLUMN public.profiles.referral_code IS
    'Stable personal invite code used by /r/:code links.';

-- Reuse codes already generated for the claim flow instead of invalidating links.
UPDATE public.profiles AS profile
SET referral_code = UPPER(claim.referral_code)
FROM public.pending_tree_claims AS claim
WHERE claim.user_id = profile.user_id
  AND claim.referral_code IS NOT NULL
  AND profile.referral_code IS NULL;

CREATE TABLE IF NOT EXISTS public.referral_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT,
    source TEXT NOT NULL DEFAULT 'personal_link'
        CHECK (source IN ('personal_link', 'team_invite', 'legacy_profile')),
    signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT referral_attributions_no_self_referral
        CHECK (referrer_id <> referred_user_id),
    CONSTRAINT referral_attributions_one_referrer_per_user
        UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS referral_attributions_referrer_id_idx
    ON public.referral_attributions (referrer_id);

CREATE INDEX IF NOT EXISTS referral_attributions_activated_at_idx
    ON public.referral_attributions (activated_at);

CREATE TABLE IF NOT EXISTS public.referral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_code TEXT,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL CHECK (
        event_name IN (
            'landing_viewed',
            'link_created',
            'link_copied',
            'native_share_opened',
            'signup_completed',
            'activated',
            'rewarded'
        )
    ),
    channel TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_events_code_created_at_idx
    ON public.referral_events (referral_code, created_at DESC);

CREATE INDEX IF NOT EXISTS referral_events_referrer_created_at_idx
    ON public.referral_events (referrer_id, created_at DESC);

ALTER TABLE public.referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their referral attributions"
    ON public.referral_attributions;
CREATE POLICY "Users can view their referral attributions"
    ON public.referral_attributions
    FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

DROP POLICY IF EXISTS "Users can view their referral events"
    ON public.referral_events;
CREATE POLICY "Users can view their referral events"
    ON public.referral_events
    FOR SELECT
    USING (auth.uid() = referrer_id OR auth.uid() = actor_user_id);

-- Preserve the eleven legacy profile attributions already present in production.
INSERT INTO public.referral_attributions (
    referrer_id,
    referred_user_id,
    source,
    signed_up_at
)
SELECT
    profile.referred_by,
    profile.user_id,
    'legacy_profile',
    profile.created_at
FROM public.profiles AS profile
WHERE profile.referred_by IS NOT NULL
  AND profile.referred_by <> profile.user_id
ON CONFLICT (referred_user_id) DO NOTHING;

-- Backfill team-invite signups, including accounts whose invite-use log failed.
INSERT INTO public.referral_attributions (
    referrer_id,
    referred_user_id,
    referral_code,
    source,
    signed_up_at
)
SELECT
    invite.created_by,
    invited_user.id,
    invite.invite_code,
    'team_invite',
    invited_user.created_at
FROM auth.users AS invited_user
JOIN public.team_invites AS invite
    ON UPPER(invite.invite_code) = UPPER(invited_user.raw_user_meta_data ->> 'invite_code')
WHERE invite.created_by <> invited_user.id
ON CONFLICT (referred_user_id) DO NOTHING;

-- Existing referred users may already have productive nodes. Mark them as
-- activated so the initial impact view reflects their real activity.
UPDATE public.referral_attributions AS attribution
SET activated_at = NOW()
WHERE attribution.activated_at IS NULL
  AND EXISTS (
      SELECT 1
      FROM public.nodes AS node
      WHERE node.user_id = attribution.referred_user_id
        AND node.opt_in IS DISTINCT FROM FALSE
        AND COALESCE(node.total_requests, 0) > 0
  );

-- Daily referral impact is derived from the existing per-user history. This
-- avoids a second snapshot table and keeps the cost proportional to the small
-- attribution set being viewed. The function fills missing dates with zeroes.
CREATE INDEX IF NOT EXISTS user_daily_stats_user_date_idx
    ON public.user_daily_stats (user_id, date);

CREATE OR REPLACE FUNCTION public.get_referral_daily_impact(
    p_referrer_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    own_requests BIGINT,
    referred_requests BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH requested_days AS (
        SELECT LEAST(GREATEST(COALESCE(p_days, 30), 1), 90) AS day_count
    ),
    days AS (
        SELECT generated_day::DATE AS date
        FROM requested_days,
        LATERAL generate_series(
            CURRENT_DATE - (requested_days.day_count - 1),
            CURRENT_DATE,
            INTERVAL '1 day'
        ) AS series(generated_day)
    ),
    own_daily AS (
        SELECT
            stats.date,
            SUM(GREATEST(COALESCE(stats.points_gained_that_day, 0), 0))::BIGINT AS requests
        FROM public.user_daily_stats AS stats
        CROSS JOIN requested_days
        WHERE stats.user_id = p_referrer_id
          AND stats.date >= CURRENT_DATE - (requested_days.day_count - 1)
        GROUP BY stats.date
    ),
    referred_daily AS (
        SELECT
            stats.date,
            SUM(GREATEST(COALESCE(stats.points_gained_that_day, 0), 0))::BIGINT AS requests
        FROM public.referral_attributions AS attribution
        JOIN public.user_daily_stats AS stats
          ON stats.user_id = attribution.referred_user_id
        CROSS JOIN requested_days
        WHERE attribution.referrer_id = p_referrer_id
          AND stats.date >= CURRENT_DATE - (requested_days.day_count - 1)
          AND stats.date >= attribution.signed_up_at::DATE
        GROUP BY stats.date
    )
    SELECT
        days.date,
        COALESCE(own_daily.requests, 0)::BIGINT AS own_requests,
        COALESCE(referred_daily.requests, 0)::BIGINT AS referred_requests
    FROM days
    LEFT JOIN own_daily USING (date)
    LEFT JOIN referred_daily USING (date)
    WHERE auth.uid() = p_referrer_id OR auth.role() = 'service_role'
    ORDER BY days.date;
$$;

REVOKE ALL ON FUNCTION public.get_referral_daily_impact(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_referral_daily_impact(UUID, INTEGER) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_referral_daily_impact(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_daily_impact(UUID, INTEGER) TO service_role;
