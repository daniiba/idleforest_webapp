-- Referral loop, part 3: double-sided reward and one referral system for
-- every client.
--
-- Reward: when an invited user has contributed on enough distinct days, both
-- the inviter and the invitee get trees planted (via the same 1ClickImpact
-- flow as the desktop install bonus). Waiting for sustained activity keeps
-- the reward tied to real participation instead of throwaway accounts.
--
-- One system: the desktop app and the old extension used a separate
-- referral_codes table and shared https://www.idleforest.com/?ref=CODE links,
-- which the website stripped without attributing anything. Those codes now
-- resolve like any other invite code, and the desktop app gets RPCs to use
-- the canonical /r/CODE links.

-- ---------------------------------------------------------------------------
-- 1. Program settings (single row, readable by every client)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referral_reward_settings (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    trees_per_person INTEGER NOT NULL DEFAULT 3 CHECK (trees_per_person BETWEEN 1 AND 50),
    min_active_days INTEGER NOT NULL DEFAULT 3 CHECK (min_active_days BETWEEN 1 AND 60),
    inviter_monthly_cap INTEGER NOT NULL DEFAULT 10 CHECK (inviter_monthly_cap >= 0),
    -- Only people who sign up after launch were promised the reward; this
    -- also keeps historical and backfilled referrals from being paid out.
    program_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.referral_reward_settings
    ADD COLUMN IF NOT EXISTS program_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

COMMENT ON TABLE public.referral_reward_settings IS
    'Double-sided referral reward: trees for inviter and invitee once the invitee has contributed on min_active_days distinct days. Applies to invitees who signed up after program_started_at. inviter_monthly_cap limits inviter rewards per rolling 30 days; invitees are always rewarded.';

INSERT INTO public.referral_reward_settings (id) VALUES (TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.referral_reward_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Referral reward settings are public" ON public.referral_reward_settings;
CREATE POLICY "Referral reward settings are public"
    ON public.referral_reward_settings
    FOR SELECT
    USING (TRUE);

GRANT SELECT ON public.referral_reward_settings TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Reward bookkeeping
-- ---------------------------------------------------------------------------

-- No foreign key on purpose: reward history must survive account deletion,
-- and a SET NULL cascade would collide with the per-user uniqueness below.
ALTER TABLE public.user_rewards
    ADD COLUMN IF NOT EXISTS referral_attribution_id UUID;

-- An inviter can earn one reward per invited person, so (user_id,
-- reward_type) can no longer be unique for referral rewards. One-time
-- rewards (desktop bonus, ...) keep their per-user uniqueness.
ALTER TABLE public.user_rewards
    DROP CONSTRAINT IF EXISTS user_rewards_user_id_reward_type_key;

CREATE UNIQUE INDEX IF NOT EXISTS user_rewards_user_reward_type_unique
    ON public.user_rewards (user_id, reward_type)
    WHERE referral_attribution_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_rewards_referral_reward_unique
    ON public.user_rewards (referral_attribution_id, reward_type)
    WHERE referral_attribution_id IS NOT NULL;

ALTER TABLE public.referral_attributions
    ADD COLUMN IF NOT EXISTS inviter_reward_skipped TEXT;

CREATE INDEX IF NOT EXISTS referral_attributions_reward_due_idx
    ON public.referral_attributions (activated_at)
    WHERE activated_at IS NOT NULL AND rewarded_at IS NULL;

-- ---------------------------------------------------------------------------
-- 3. Legacy code resolution (desktop / extension referral_codes table)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.resolve_referral_code_owner(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_code TEXT := regexp_replace(UPPER(TRIM(COALESCE(p_code, ''))), '[^A-Z0-9]', '', 'g');
    v_owner UUID;
BEGIN
    IF v_code = '' OR LENGTH(v_code) > 64 THEN
        RETURN NULL;
    END IF;

    SELECT profile.user_id INTO v_owner
    FROM public.profiles AS profile
    WHERE UPPER(profile.referral_code) = v_code
    LIMIT 1;

    IF v_owner IS NULL THEN
        SELECT claim.user_id INTO v_owner
        FROM public.pending_tree_claims AS claim
        WHERE UPPER(claim.referral_code) = v_code
          AND claim.user_id IS NOT NULL
        LIMIT 1;
    END IF;

    IF v_owner IS NULL AND to_regclass('public.referral_codes') IS NOT NULL THEN
        EXECUTE 'SELECT user_id FROM public.referral_codes WHERE UPPER(code) = $1 AND user_id IS NOT NULL LIMIT 1'
            INTO v_owner
            USING v_code;
    END IF;

    RETURN v_owner;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_referral_code_owner(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_referral_code_owner(TEXT) TO service_role;

-- Same trigger as before, now resolving legacy codes too.
CREATE OR REPLACE FUNCTION public.attribute_referral_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_code TEXT;
    v_referrer_id UUID;
    v_attribution_id UUID;
BEGIN
    v_code := regexp_replace(
        UPPER(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'referral_code', ''))),
        '[^A-Z0-9]',
        '',
        'g'
    );

    IF v_code = '' OR LENGTH(v_code) > 64 THEN
        RETURN NEW;
    END IF;

    v_referrer_id := public.resolve_referral_code_owner(v_code);

    IF v_referrer_id IS NULL OR v_referrer_id = NEW.id THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.referral_attributions (
        referrer_id,
        referred_user_id,
        referral_code,
        source
    )
    VALUES (v_referrer_id, NEW.id, v_code, 'personal_link')
    ON CONFLICT (referred_user_id) DO NOTHING
    RETURNING id INTO v_attribution_id;

    IF v_attribution_id IS NOT NULL THEN
        INSERT INTO public.referral_events (
            event_name,
            referral_code,
            referrer_id,
            actor_user_id,
            channel
        )
        VALUES ('signup_completed', v_code, v_referrer_id, NEW.id, 'personal_link');
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'attribute_referral_on_signup failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Canonical invite code for any client
-- ---------------------------------------------------------------------------
-- Keeps a member's existing code when there is one (profile, tree-claim or
-- legacy desktop code, so links already shared keep working); otherwise
-- generates one. Authenticated users may only ensure their own code.

CREATE OR REPLACE FUNCTION public.ensure_referral_code(
    p_user_id UUID DEFAULT NULL,
    p_channel TEXT DEFAULT 'dashboard'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := COALESCE(p_user_id, auth.uid());
    v_code TEXT;
    v_candidates TEXT[] := ARRAY[]::TEXT[];
    v_candidate TEXT;
    v_legacy TEXT;
    v_attempt INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'authentication is required';
    END IF;

    IF auth.role() IS DISTINCT FROM 'service_role' AND v_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'cannot manage another member''s invite code';
    END IF;

    SELECT UPPER(profile.referral_code) INTO v_code
    FROM public.profiles AS profile
    WHERE profile.user_id = v_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'profile not found';
    END IF;

    IF v_code IS NOT NULL AND v_code <> '' THEN
        RETURN v_code;
    END IF;

    SELECT UPPER(claim.referral_code) INTO v_legacy
    FROM public.pending_tree_claims AS claim
    WHERE claim.user_id = v_user_id AND claim.referral_code IS NOT NULL
    LIMIT 1;
    IF v_legacy IS NOT NULL THEN
        v_candidates := v_candidates || v_legacy;
    END IF;

    IF to_regclass('public.referral_codes') IS NOT NULL THEN
        EXECUTE 'SELECT UPPER(code) FROM public.referral_codes WHERE user_id = $1 AND code IS NOT NULL LIMIT 1'
            INTO v_legacy
            USING v_user_id;
        IF v_legacy IS NOT NULL THEN
            v_candidates := v_candidates || v_legacy;
        END IF;
    END IF;

    FOR v_attempt IN 1..8 LOOP
        v_candidates := v_candidates || (
            SELECT string_agg(substr('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 1 + floor(random() * 32)::INTEGER, 1), '')
            FROM generate_series(1, 8)
        );
    END LOOP;

    FOREACH v_candidate IN ARRAY v_candidates LOOP
        v_candidate := regexp_replace(v_candidate, '[^A-Z0-9]', '', 'g');
        CONTINUE WHEN v_candidate = '' OR LENGTH(v_candidate) > 64;

        -- A legacy code must not already belong to someone else.
        CONTINUE WHEN COALESCE(public.resolve_referral_code_owner(v_candidate), v_user_id) <> v_user_id;

        BEGIN
            UPDATE public.profiles
            SET referral_code = v_candidate
            WHERE user_id = v_user_id AND referral_code IS NULL
            RETURNING UPPER(referral_code) INTO v_code;
        EXCEPTION WHEN unique_violation THEN
            CONTINUE;
        END;

        IF v_code IS NULL THEN
            -- A concurrent call assigned a code first.
            SELECT UPPER(referral_code) INTO v_code FROM public.profiles WHERE user_id = v_user_id;
            RETURN v_code;
        END IF;

        INSERT INTO public.referral_events (event_name, referral_code, referrer_id, actor_user_id, channel)
        VALUES ('link_created', v_code, v_user_id, v_user_id, LEFT(COALESCE(p_channel, 'dashboard'), 50));

        RETURN v_code;
    END LOOP;

    RAISE EXCEPTION 'could not assign an invite code';
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_referral_code(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ensure_referral_code(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.ensure_referral_code(UUID, TEXT) TO authenticated, service_role;

-- Share tracking for clients that talk to Supabase directly (desktop app).
CREATE OR REPLACE FUNCTION public.record_referral_share(
    p_event TEXT,
    p_channel TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_code TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'authentication is required';
    END IF;

    IF p_event NOT IN ('link_copied', 'native_share_opened', 'share_opened') THEN
        RAISE EXCEPTION 'unsupported referral event';
    END IF;

    SELECT UPPER(referral_code) INTO v_code FROM public.profiles WHERE user_id = v_user_id;
    IF v_code IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO public.referral_events (event_name, referral_code, referrer_id, actor_user_id, channel)
    VALUES (p_event, v_code, v_user_id, v_user_id, LEFT(COALESCE(p_channel, 'desktop'), 50));
END;
$$;

REVOKE ALL ON FUNCTION public.record_referral_share(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_referral_share(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_referral_share(TEXT, TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. Rewards that are due (read by the server with the service role)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_referral_rewards_due(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    attribution_id UUID,
    referrer_id UUID,
    referrer_email TEXT,
    referrer_name TEXT,
    referrer_code TEXT,
    referred_user_id UUID,
    referred_email TEXT,
    referred_name TEXT,
    active_days BIGINT,
    inviter_rewards_last_30_days BIGINT,
    trees_per_person INTEGER,
    min_active_days INTEGER,
    inviter_monthly_cap INTEGER
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH settings AS (
        SELECT * FROM public.referral_reward_settings WHERE id AND enabled
    ),
    candidates AS (
        SELECT attribution.*
        FROM public.referral_attributions AS attribution
        CROSS JOIN settings
        WHERE attribution.activated_at IS NOT NULL
          AND attribution.rewarded_at IS NULL
          AND attribution.source = 'personal_link'
          AND attribution.signed_up_at >= settings.program_started_at
        ORDER BY attribution.activated_at
        LIMIT 2000
    ),
    activity AS (
        SELECT candidate.id, COUNT(DISTINCT stats.date) AS active_days
        FROM candidates AS candidate
        JOIN public.user_daily_stats AS stats
            ON stats.user_id = candidate.referred_user_id
           AND stats.date >= candidate.signed_up_at::DATE
           AND COALESCE(stats.points_gained_that_day, 0) > 0
        GROUP BY candidate.id
    )
    SELECT
        candidate.id,
        candidate.referrer_id,
        referrer.email::TEXT,
        referrer_profile.display_name,
        referrer_profile.referral_code,
        candidate.referred_user_id,
        referred.email::TEXT,
        referred_profile.display_name,
        activity.active_days,
        (
            SELECT COUNT(*)
            FROM public.user_rewards AS reward
            WHERE reward.user_id = candidate.referrer_id
              AND reward.reward_type = 'referral_inviter'
              AND reward.status IN ('processing', 'awarded')
              AND reward.created_at > NOW() - INTERVAL '30 days'
        ),
        settings.trees_per_person,
        settings.min_active_days,
        settings.inviter_monthly_cap
    FROM candidates AS candidate
    CROSS JOIN settings
    JOIN activity ON activity.id = candidate.id
    JOIN auth.users AS referrer ON referrer.id = candidate.referrer_id
    JOIN auth.users AS referred ON referred.id = candidate.referred_user_id
    LEFT JOIN public.profiles AS referrer_profile ON referrer_profile.user_id = candidate.referrer_id
    LEFT JOIN public.profiles AS referred_profile ON referred_profile.user_id = candidate.referred_user_id
    WHERE activity.active_days >= settings.min_active_days
    ORDER BY candidate.activated_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500);
$$;

REVOKE ALL ON FUNCTION public.get_referral_rewards_due(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_referral_rewards_due(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_referral_rewards_due(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_rewards_due(INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- 6. Email templates
-- ---------------------------------------------------------------------------
-- New placeholders: {{{REWARD_TREES}}}, {{{MIN_DAYS}}}, {{{TOTAL_TREES}}}.

DO $$
DECLARE
    header TEXT := $html$
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #0B101F; margin: 0; padding: 40px 20px; background-color: #D9D9D9;">

    <div style="max-width: 580px; margin: 0 auto;">

        <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
        </div>

        <div style="background-color: #ffffff; padding: 32px; border: 2px solid #000000;">
$html$;
    footer TEXT := $html$
            <p style="margin: 0 0 0 0; font-size: 16px;">Thanks for growing the forest,</p>

            <div style="margin-top: 28px; padding-top: 20px; border-top: 3px solid #E0F146;">
                <p
                    style="margin: 0; font-weight: 700; color: #0B101F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Daniel Ibanez Becker</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Founder & CEO, IdleForest</p>
            </div>
        </div>

        <div
            style="background-color: #0B101F; padding: 20px 24px; border: 2px solid #000000; border-top: none; text-align: center;">
            <p
                style="margin: 0 0 6px 0; font-size: 12px; color: #E0F146; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                Turn your idle internet into real trees</p>
            <p style="margin: 0 0 16px 0;"><a href="https://idleforest.com"
                    style="color: #E0F146; text-decoration: none; font-size: 13px;">idleforest.com</a></p>
            <a href="{{UNSUBSCRIBE_URL}}" style="color: #888;">Unsubscribe from emails</a>
        </div>

    </div>

</body>

</html>
$html$;
    invite_block TEXT := $html$
            <p style="margin: 0 0 12px 0; font-size: 16px;">Your personal invite link:</p>

            <p style="margin: 0 0 20px 0; font-size: 14px; font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background-color: #F4F7DC; border: 2px solid #000000; padding: 12px 14px; word-break: break-all;"><a href="{{{INVITE_URL}}}" style="color: #0B101F;">{{{INVITE_URL}}}</a></p>

            <div style="text-align: center; margin: 28px 0;">
                <a href="{{{REFERRALS_URL}}}"
                    style="display: inline-block; padding: 14px 32px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #000000;">Invite
                    someone</a>
            </div>
$html$;
    inviter_body TEXT := $html$
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hey {{{REFERRER_NAME}}},</p>

            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">You and {{{FRIEND_NAMES}}} just planted {{{TOTAL_TREES}}} trees.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">{{{FRIEND_NAMES}}} has now contributed to IdleForest on {{{MIN_DAYS}}} different days. As a thank-you for bringing them in, we planted <strong>{{{REWARD_TREES}}} trees for you</strong> and {{{REWARD_TREES}}} for them.</p>

            <div style="background-color: #0B101F; border: 2px solid #000000; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 40px; font-weight: 800; color: #E0F146; line-height: 1;">+{{{REWARD_TREES}}}</p>
                <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">Trees added to your forest</p>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 16px;">Every person you invite who sticks with it earns the same: {{{REWARD_TREES}}} trees for you, {{{REWARD_TREES}}} for them.</p>
$html$;
    invitee_body TEXT := $html$
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hey {{{FRIEND_NAMES}}},</p>

            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">We just planted {{{REWARD_TREES}}} trees for you.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">You joined IdleForest through {{{REFERRER_NAME}}}'s invite and have now contributed on {{{MIN_DAYS}}} different days. That is exactly what keeps the forest growing, so these trees are our thank-you.</p>

            <div style="background-color: #F4F7DC; border: 2px solid #000000; padding: 18px 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; font-weight: 700;">Now it's your turn</p>
                <p style="margin: 8px 0 0 0; font-size: 15px;">Invite someone you know. Once they have contributed on {{{MIN_DAYS}}} days, you both get {{{REWARD_TREES}}} trees planted, just like you and {{{REFERRER_NAME}}}.</p>
            </div>
$html$;
BEGIN
    IF to_regclass('public.email_templates') IS NULL THEN
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral: trees planted (inviter)') THEN
        UPDATE public.email_templates
        SET subject = 'You and {{{FRIEND_NAMES}}} just planted {{{TOTAL_TREES}}} trees',
            content = header || inviter_body || invite_block || footer,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral: trees planted (inviter)';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral: trees planted (inviter)',
            'You and {{{FRIEND_NAMES}}} just planted {{{TOTAL_TREES}}} trees',
            header || inviter_body || invite_block || footer,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral: trees planted (invitee)') THEN
        UPDATE public.email_templates
        SET subject = '{{{REWARD_TREES}}} trees planted for you, thanks to {{{REFERRER_NAME}}}',
            content = header || invitee_body || invite_block || footer,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral: trees planted (invitee)';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral: trees planted (invitee)',
            '{{{REWARD_TREES}}} trees planted for you, thanks to {{{REFERRER_NAME}}}',
            header || invitee_body || invite_block || footer,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;

    -- Tell inviters about the reward in the earlier emails too. replace()
    -- only touches the original sentences, so copy edited in the admin
    -- dashboard is left alone.
    UPDATE public.email_templates
    SET content = replace(
            content,
            '<p style="margin: 0 0 20px 0; font-size: 16px;">We will let you know as soon as their computer starts contributing to your forest.</p>',
            '<p style="margin: 0 0 20px 0; font-size: 16px;">Once their computer has contributed on {{{MIN_DAYS}}} different days, we will plant <strong>{{{REWARD_TREES}}} trees for each of you</strong>.</p>'
        ),
        updated_at = NOW()
    WHERE name = 'Referral: friend joined';

    UPDATE public.email_templates
    SET content = replace(
            content,
            '<p style="margin: 0 0 20px 0; font-size: 16px;">Their computer is now helping fund real tree planting, and it started with your introduction. Everything they contribute from here on shows up in your forest.</p>',
            '<p style="margin: 0 0 20px 0; font-size: 16px;">Their computer is now helping fund real tree planting, and it started with your introduction. Once they have contributed on {{{MIN_DAYS}}} different days, we will plant <strong>{{{REWARD_TREES}}} trees for each of you</strong>.</p>'
        ),
        updated_at = NOW()
    WHERE name = 'Referral: friend contributing';
END $$;
