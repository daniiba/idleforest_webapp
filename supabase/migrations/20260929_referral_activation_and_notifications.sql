-- Referral loop, part 2: make attribution and activation server-authoritative
-- and give referrers timely feedback.
--
-- Why: activation used to be recorded only when the invited user loaded a web
-- page that called /api/user/node-status. Desktop and extension users rarely do
-- that after onboarding, so most activations were never recorded and referrers
-- never saw their invite pay off. Nodes report through sync_node(), so a
-- trigger on nodes records activation for every client, including extension
-- builds that can no longer be updated.

-- ---------------------------------------------------------------------------
-- 1. Notification bookkeeping
-- ---------------------------------------------------------------------------

ALTER TABLE public.referral_attributions
    ADD COLUMN IF NOT EXISTS joined_notified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS activated_notified_at TIMESTAMPTZ;

-- Everything that exists before this migration is history: never email
-- referrers about signups or activations from the backfill.
UPDATE public.referral_attributions
SET joined_notified_at = COALESCE(joined_notified_at, NOW()),
    activated_notified_at = CASE
        WHEN activated_at IS NOT NULL THEN COALESCE(activated_notified_at, NOW())
        ELSE activated_notified_at
    END;

CREATE INDEX IF NOT EXISTS referral_attributions_pending_joined_idx
    ON public.referral_attributions (referrer_id)
    WHERE joined_notified_at IS NULL;

CREATE INDEX IF NOT EXISTS referral_attributions_pending_activated_idx
    ON public.referral_attributions (referrer_id)
    WHERE activated_at IS NOT NULL AND activated_notified_at IS NULL;

-- ---------------------------------------------------------------------------
-- 2. Track channel-specific share buttons (WhatsApp, email, X, LinkedIn, ...)
-- ---------------------------------------------------------------------------

ALTER TABLE public.referral_events
    DROP CONSTRAINT IF EXISTS referral_events_event_name_check;

ALTER TABLE public.referral_events
    ADD CONSTRAINT referral_events_event_name_check CHECK (
        event_name IN (
            'landing_viewed',
            'link_created',
            'link_copied',
            'native_share_opened',
            'share_opened',
            'signup_completed',
            'activated',
            'rewarded'
        )
    );

CREATE INDEX IF NOT EXISTS referral_events_name_created_at_idx
    ON public.referral_events (event_name, created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. Activation from node sync
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mark_referral_activated_from_node()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_attribution public.referral_attributions%ROWTYPE;
BEGIN
    -- The WHEN clause already guarantees a productive, owned node. The update
    -- is a single unique-index lookup and matches nothing for users who are
    -- not referred or are already activated, so it is cheap on every sync.
    UPDATE public.referral_attributions
    SET activated_at = NOW()
    WHERE referred_user_id = NEW.user_id
      AND activated_at IS NULL
    RETURNING * INTO v_attribution;

    IF FOUND THEN
        INSERT INTO public.referral_events (
            event_name,
            referral_code,
            referrer_id,
            actor_user_id,
            channel
        )
        VALUES (
            'activated',
            v_attribution.referral_code,
            v_attribution.referrer_id,
            NEW.user_id,
            'node_sync'
        );
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Referral bookkeeping must never block a node from syncing.
    RAISE WARNING 'mark_referral_activated_from_node failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nodes_mark_referral_activated ON public.nodes;
CREATE TRIGGER nodes_mark_referral_activated
    AFTER INSERT OR UPDATE OF total_requests, opt_in, user_id ON public.nodes
    FOR EACH ROW
    WHEN (
        NEW.user_id IS NOT NULL
        AND COALESCE(NEW.total_requests, 0) > 0
        AND NEW.opt_in IS DISTINCT FROM FALSE
    )
    EXECUTE FUNCTION public.mark_referral_activated_from_node();

-- Catch up anyone who became productive before this trigger existed.
WITH activated AS (
    UPDATE public.referral_attributions AS attribution
    SET activated_at = NOW(),
        -- Silent catch-up: these activations predate the notification loop.
        activated_notified_at = NOW()
    WHERE attribution.activated_at IS NULL
      AND EXISTS (
          SELECT 1
          FROM public.nodes AS node
          WHERE node.user_id = attribution.referred_user_id
            AND node.opt_in IS DISTINCT FROM FALSE
            AND COALESCE(node.total_requests, 0) > 0
      )
    RETURNING attribution.*
)
INSERT INTO public.referral_events (event_name, referral_code, referrer_id, actor_user_id, channel)
SELECT 'activated', referral_code, referrer_id, referred_user_id, 'backfill'
FROM activated;

-- ---------------------------------------------------------------------------
-- 4. Attribution at account creation
-- ---------------------------------------------------------------------------
-- The signup page only stores a server-validated referral code in auth
-- metadata. Previously the attribution row was created by a follow-up API call
-- that needs a session, so signups that required email confirmation were only
-- attributed if the person later opened a dashboard page. Creating it here
-- makes attribution independent of which page the new user lands on.

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

    SELECT profile.user_id
    INTO v_referrer_id
    FROM public.profiles AS profile
    WHERE UPPER(profile.referral_code) = v_code
    LIMIT 1;

    IF v_referrer_id IS NULL THEN
        SELECT claim.user_id
        INTO v_referrer_id
        FROM public.pending_tree_claims AS claim
        WHERE UPPER(claim.referral_code) = v_code
          AND claim.user_id IS NOT NULL
        LIMIT 1;
    END IF;

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
    -- Never block account creation because of referral bookkeeping. The
    -- /api/referrals/complete endpoint remains as the client-side fallback.
    RAISE WARNING 'attribute_referral_on_signup failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_attribute_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_attribute_referral
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.attribute_referral_on_signup();

-- ---------------------------------------------------------------------------
-- 5. Pending referrer notifications (read by the server with the service role)
-- ---------------------------------------------------------------------------
-- One row per attribution that still owes the referrer an email. A signup
-- that activated before we emailed about it produces only the activation
-- email. "joined" waits for email confirmation so we never celebrate an
-- account that was never used.

CREATE OR REPLACE FUNCTION public.get_pending_referral_notifications(
    p_referrer_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 200
)
RETURNS TABLE (
    attribution_id UUID,
    kind TEXT,
    referrer_id UUID,
    referrer_email TEXT,
    referrer_name TEXT,
    referrer_code TEXT,
    friend_name TEXT,
    contributing_count BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        attribution.id AS attribution_id,
        CASE WHEN attribution.activated_at IS NOT NULL THEN 'activated' ELSE 'joined' END AS kind,
        attribution.referrer_id,
        referrer.email::TEXT AS referrer_email,
        referrer_profile.display_name AS referrer_name,
        referrer_profile.referral_code AS referrer_code,
        referred_profile.display_name AS friend_name,
        (
            SELECT COUNT(*)
            FROM public.referral_attributions AS contributing
            WHERE contributing.referrer_id = attribution.referrer_id
              AND contributing.activated_at IS NOT NULL
        ) AS contributing_count
    FROM public.referral_attributions AS attribution
    JOIN auth.users AS referrer
        ON referrer.id = attribution.referrer_id
    JOIN auth.users AS referred
        ON referred.id = attribution.referred_user_id
    LEFT JOIN public.profiles AS referrer_profile
        ON referrer_profile.user_id = attribution.referrer_id
    LEFT JOIN public.profiles AS referred_profile
        ON referred_profile.user_id = attribution.referred_user_id
    WHERE (p_referrer_id IS NULL OR attribution.referrer_id = p_referrer_id)
      AND referrer.email IS NOT NULL
      AND (
          (attribution.activated_at IS NOT NULL AND attribution.activated_notified_at IS NULL)
          OR (
              attribution.activated_at IS NULL
              AND attribution.joined_notified_at IS NULL
              AND referred.email_confirmed_at IS NOT NULL
          )
      )
    ORDER BY attribution.referrer_id, attribution.signed_up_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 1000);
$$;

REVOKE ALL ON FUNCTION public.get_pending_referral_notifications(UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_pending_referral_notifications(UUID, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_pending_referral_notifications(UUID, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_referral_notifications(UUID, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- 6. Weekly funnel for measuring the K-factor
-- ---------------------------------------------------------------------------
-- K ~= (invites that turn into contributing users) / (contributing users).
-- viral_share = referral activations / all new contributing users that week.
-- activations_per_sharer is the per-referrer yield of people who shared.

CREATE OR REPLACE FUNCTION public.get_referral_funnel(p_weeks INTEGER DEFAULT 12)
RETURNS TABLE (
    week_start DATE,
    sharers BIGINT,
    landing_views BIGINT,
    signups BIGINT,
    activations BIGINT,
    new_contributors BIGINT,
    viral_share NUMERIC,
    activations_per_sharer NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH bounds AS (
        SELECT (DATE_TRUNC('week', CURRENT_DATE) - (LEAST(GREATEST(COALESCE(p_weeks, 12), 1), 52) - 1) * INTERVAL '1 week')::DATE AS first_week
    ),
    weeks AS (
        SELECT generate_series(bounds.first_week, DATE_TRUNC('week', CURRENT_DATE)::DATE, INTERVAL '1 week')::DATE AS week_start
        FROM bounds
    ),
    events AS (
        SELECT
            DATE_TRUNC('week', event.created_at)::DATE AS week_start,
            COUNT(DISTINCT event.referrer_id) FILTER (
                WHERE event.event_name IN ('link_copied', 'native_share_opened', 'share_opened')
            ) AS sharers,
            COUNT(*) FILTER (WHERE event.event_name = 'landing_viewed') AS landing_views
        FROM public.referral_events AS event, bounds
        WHERE event.created_at >= bounds.first_week
        GROUP BY 1
    ),
    signups AS (
        SELECT DATE_TRUNC('week', attribution.signed_up_at)::DATE AS week_start, COUNT(*) AS signups
        FROM public.referral_attributions AS attribution, bounds
        WHERE attribution.source = 'personal_link'
          AND attribution.signed_up_at >= bounds.first_week
        GROUP BY 1
    ),
    activations AS (
        SELECT DATE_TRUNC('week', event.created_at)::DATE AS week_start, COUNT(DISTINCT event.actor_user_id) AS activations
        FROM public.referral_events AS event, bounds
        WHERE event.event_name = 'activated'
          AND event.channel IS DISTINCT FROM 'backfill'
          AND event.created_at >= bounds.first_week
        GROUP BY 1
    ),
    first_contribution AS (
        SELECT stats.user_id, MIN(stats.date) AS first_date
        FROM public.user_daily_stats AS stats
        WHERE COALESCE(stats.points_gained_that_day, 0) > 0
        GROUP BY stats.user_id
    ),
    contributors AS (
        SELECT DATE_TRUNC('week', first_contribution.first_date)::DATE AS week_start, COUNT(*) AS new_contributors
        FROM first_contribution, bounds
        WHERE first_contribution.first_date >= bounds.first_week
        GROUP BY 1
    )
    SELECT
        weeks.week_start,
        COALESCE(events.sharers, 0),
        COALESCE(events.landing_views, 0),
        COALESCE(signups.signups, 0),
        COALESCE(activations.activations, 0),
        COALESCE(contributors.new_contributors, 0),
        ROUND(COALESCE(activations.activations, 0)::NUMERIC / NULLIF(contributors.new_contributors, 0), 3),
        ROUND(COALESCE(activations.activations, 0)::NUMERIC / NULLIF(events.sharers, 0), 3)
    FROM weeks
    LEFT JOIN events USING (week_start)
    LEFT JOIN signups USING (week_start)
    LEFT JOIN activations USING (week_start)
    LEFT JOIN contributors USING (week_start)
    ORDER BY weeks.week_start;
$$;

REVOKE ALL ON FUNCTION public.get_referral_funnel(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_referral_funnel(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_referral_funnel(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_funnel(INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- 7. Email templates (editable in the admin email template manager)
-- ---------------------------------------------------------------------------
-- Placeholders filled by lib/referral-notifications.ts:
--   {{{REFERRER_NAME}}}, {{{FRIEND_NAMES}}}, {{{CONTRIBUTING_COUNT}}},
--   {{{INVITE_URL}}}, {{{REFERRALS_URL}}}, {{UNSUBSCRIBE_URL}}

DO $$
DECLARE
    joined_content TEXT := $html$
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
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hey {{{REFERRER_NAME}}},</p>

            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">{{{FRIEND_NAMES}}} just joined IdleForest through your invite.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">Their account is ready. The last step is connecting the desktop app, because that is what actually starts funding trees. It is also where most people stall.</p>

            <div style="background-color: #F4F7DC; border: 2px solid #000000; padding: 18px 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; font-weight: 700;">The one thing that helps most</p>
                <p style="margin: 8px 0 0 0; font-size: 15px;">A short message from you, like <em>"Did you get the desktop app running?"</em> People finish setup far more often when the person who invited them checks in.</p>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 16px;">We will let you know as soon as their computer starts contributing to your forest.</p>

            <div style="text-align: center; margin: 28px 0;">
                <a href="{{{REFERRALS_URL}}}"
                    style="display: inline-block; padding: 14px 32px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #000000;">See
                    your forest</a>
            </div>

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
    activated_content TEXT := $html$
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
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hey {{{REFERRER_NAME}}},</p>

            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Your invite is growing: {{{FRIEND_NAMES}}} started contributing.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">Their computer is now helping fund real tree planting, and it started with your introduction. Everything they contribute from here on shows up in your forest.</p>

            <div style="background-color: #0B101F; border: 2px solid #000000; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 40px; font-weight: 800; color: #E0F146; line-height: 1;">{{{CONTRIBUTING_COUNT}}}</p>
                <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">People you invited are contributing</p>
            </div>

            <p style="margin: 0 0 12px 0; font-size: 16px;">Know one more person who would like this? Your personal invite link:</p>

            <p style="margin: 0 0 20px 0; font-size: 14px; font-family: 'SFMono-Regular', Menlo, Consolas, monospace; background-color: #F4F7DC; border: 2px solid #000000; padding: 12px 14px; word-break: break-all;"><a href="{{{INVITE_URL}}}" style="color: #0B101F;">{{{INVITE_URL}}}</a></p>

            <div style="text-align: center; margin: 28px 0;">
                <a href="{{{REFERRALS_URL}}}"
                    style="display: inline-block; padding: 14px 32px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #000000;">Invite
                    one more person</a>
            </div>

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
BEGIN
    IF to_regclass('public.email_templates') IS NULL THEN
        RETURN;
    END IF;

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral: friend joined') THEN
        UPDATE public.email_templates
        SET subject = '{{{FRIEND_NAMES}}} joined IdleForest through your invite',
            content = joined_content,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral: friend joined';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral: friend joined',
            '{{{FRIEND_NAMES}}} joined IdleForest through your invite',
            joined_content,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral: friend contributing') THEN
        UPDATE public.email_templates
        SET subject = 'Your invite is growing: {{{FRIEND_NAMES}}} started contributing',
            content = activated_content,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral: friend contributing';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral: friend contributing',
            'Your invite is growing: {{{FRIEND_NAMES}}} started contributing',
            activated_content,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;
END $$;
