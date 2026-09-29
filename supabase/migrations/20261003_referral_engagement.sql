-- Referral engagement: nudge inviters whose friends stalled, and a one-off
-- launch email that shows every active member their own forest.
--
-- 1. referral_attributions.stalled_notified_at + get_stalled_referrals()
--    Friends who joined 3 to 21 days ago but never started contributing.
--    The hourly referral cron emails the inviter once per friend.
-- 2. email_campaigns: a start/pause switch for batched campaigns, sent by the
--    same hourly cron so a large audience never hits Resend all at once.
-- 3. get_forest_launch_recipients(): members with a productive node who have
--    not received the forest launch email yet and have not unsubscribed.
-- 4. Email templates for both, editable later in the admin dashboard.

-- ---------------------------------------------------------------------------
-- 1. Stalled friends
-- ---------------------------------------------------------------------------
ALTER TABLE public.referral_attributions
    ADD COLUMN IF NOT EXISTS stalled_notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS referral_attributions_stalled_idx
    ON public.referral_attributions (signed_up_at)
    WHERE activated_at IS NULL AND stalled_notified_at IS NULL;

CREATE OR REPLACE FUNCTION public.get_stalled_referrals(
    p_limit INTEGER DEFAULT 200,
    p_min_days INTEGER DEFAULT 3,
    p_max_days INTEGER DEFAULT 21
)
RETURNS TABLE (
    attribution_id UUID,
    referrer_id UUID,
    referrer_email TEXT,
    referrer_name TEXT,
    referrer_code TEXT,
    friend_name TEXT,
    signed_up_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        attribution.id AS attribution_id,
        attribution.referrer_id,
        referrer.email::TEXT AS referrer_email,
        referrer_profile.display_name AS referrer_name,
        referrer_profile.referral_code AS referrer_code,
        referred_profile.display_name AS friend_name,
        attribution.signed_up_at
    FROM public.referral_attributions AS attribution
    JOIN auth.users AS referrer
        ON referrer.id = attribution.referrer_id
    JOIN auth.users AS referred
        ON referred.id = attribution.referred_user_id
    LEFT JOIN public.profiles AS referrer_profile
        ON referrer_profile.user_id = attribution.referrer_id
    LEFT JOIN public.profiles AS referred_profile
        ON referred_profile.user_id = attribution.referred_user_id
    WHERE attribution.activated_at IS NULL
      AND attribution.stalled_notified_at IS NULL
      AND attribution.signed_up_at <= NOW() - make_interval(days => GREATEST(COALESCE(p_min_days, 3), 1))
      AND attribution.signed_up_at >= NOW() - make_interval(days => GREATEST(COALESCE(p_max_days, 21), 2))
      AND referred.email_confirmed_at IS NOT NULL
      AND referrer.email IS NOT NULL
    ORDER BY attribution.referrer_id, attribution.signed_up_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 200), 1), 1000);
$$;

REVOKE ALL ON FUNCTION public.get_stalled_referrals(INTEGER, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_stalled_referrals(INTEGER, INTEGER, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_stalled_referrals(INTEGER, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_stalled_referrals(INTEGER, INTEGER, INTEGER) TO service_role;

-- ---------------------------------------------------------------------------
-- 2. Campaign switch
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    key TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'paused', 'done')),
    started_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
-- No policies: only the service role (cron, admin actions) reads or writes it.

INSERT INTO public.email_campaigns (key) VALUES ('forest_launch')
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Forest launch audience
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_forest_launch_recipients(p_limit INTEGER DEFAULT 100)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    display_name TEXT,
    referral_code TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        member.id AS user_id,
        member.email::TEXT AS email,
        profile.display_name,
        profile.referral_code
    FROM auth.users AS member
    JOIN public.profiles AS profile
        ON profile.user_id = member.id
    WHERE member.email IS NOT NULL
      AND member.email_confirmed_at IS NOT NULL
      AND EXISTS (
          SELECT 1
          FROM public.nodes AS node
          WHERE node.user_id = member.id
            AND node.opt_in IS DISTINCT FROM FALSE
            AND COALESCE(node.total_requests, 0) > 0
      )
      AND NOT EXISTS (
          SELECT 1
          FROM public.email_logs AS log
          WHERE log.email = member.email
            AND log.status = 'unsubscribed'
      )
      AND NOT EXISTS (
          SELECT 1
          FROM public.email_logs AS log
          WHERE log.user_id = member.id
            AND log.segment = 'referral_forest_launch'
            AND log.status IN ('sent', 'skipped')
      )
    ORDER BY member.created_at
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 500);
$$;

CREATE OR REPLACE FUNCTION public.get_forest_launch_progress()
RETURNS TABLE (
    remaining BIGINT,
    sent BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT
        (
            SELECT COUNT(*)
            FROM auth.users AS member
            WHERE member.email IS NOT NULL
              AND member.email_confirmed_at IS NOT NULL
              AND EXISTS (
                  SELECT 1 FROM public.nodes AS node
                  WHERE node.user_id = member.id
                    AND node.opt_in IS DISTINCT FROM FALSE
                    AND COALESCE(node.total_requests, 0) > 0
              )
              AND NOT EXISTS (
                  SELECT 1 FROM public.email_logs AS log
                  WHERE log.email = member.email AND log.status = 'unsubscribed'
              )
              AND NOT EXISTS (
                  SELECT 1 FROM public.email_logs AS log
                  WHERE log.user_id = member.id
                    AND log.segment = 'referral_forest_launch'
                    AND log.status IN ('sent', 'skipped')
              )
        ) AS remaining,
        (
            SELECT COUNT(DISTINCT log.user_id)
            FROM public.email_logs AS log
            WHERE log.segment = 'referral_forest_launch'
              AND log.status = 'sent'
        ) AS sent;
$$;

REVOKE ALL ON FUNCTION public.get_forest_launch_recipients(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_forest_launch_recipients(INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.get_forest_launch_recipients(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_forest_launch_recipients(INTEGER) TO service_role;
REVOKE ALL ON FUNCTION public.get_forest_launch_progress() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_forest_launch_progress() FROM anon;
REVOKE ALL ON FUNCTION public.get_forest_launch_progress() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_forest_launch_progress() TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Templates
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    stalled_content TEXT := $html$
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0B101F; margin: 0; padding: 40px 20px; background-color: #D9D9D9;">

    <div style="max-width: 580px; margin: 0 auto;">

        <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
        </div>

        <div style="background-color: #F4F6EE; padding: 32px; border: 2px solid #000000;">
            <p style="margin: 0 0 18px 0; font-size: 16px;">Hi {{{REFERRER_NAME}}},</p>

            <p style="margin: 0 0 18px 0; font-size: 22px; font-weight: 800; line-height: 1.3;">{{{FRIEND_NAMES}}} {{{HAS_NOT}}} started planting yet.</p>

            <p style="margin: 0 0 18px 0; font-size: 16px;">They made an account a few days ago, but the IdleForest app is not running on their computer yet. Setting it up takes about 2 minutes.</p>

            <p style="margin: 0 0 24px 0; font-size: 16px;">A short message from you is the best reminder. We wrote one for you:</p>

            <div style="background-color: #FFFFFF; border: 2px solid #000000; padding: 16px 18px; margin: 0 0 24px 0; font-size: 15px;">
                {{{REMINDER_TEXT}}}
            </div>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 12px 0;">
                <tr>
                    <td style="padding: 0 0 10px 0;">
                        <a href="{{{WHATSAPP_URL}}}"
                            style="display: block; padding: 14px 20px; background-color: #0B101F; color: #E0F146; text-decoration: none; font-weight: 800; font-size: 15px; text-align: center; border: 2px solid #000000;">Send it on WhatsApp</a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="{{{EMAIL_SHARE_URL}}}"
                            style="display: block; padding: 14px 20px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 800; font-size: 15px; text-align: center; border: 2px solid #000000;">Send it by email</a>
                    </td>
                </tr>
            </table>

            <p style="margin: 24px 0 0 0; font-size: 15px; color: #3A4150;">{{{REWARD_SENTENCE}}}</p>

            <p style="margin: 24px 0 0 0; font-size: 15px;"><a href="{{{REFERRALS_URL}}}" style="color: #0B101F; font-weight: 700;">See your forest</a></p>

            <div style="margin-top: 28px; padding-top: 20px; border-top: 3px solid #E0F146;">
                <p style="margin: 0; font-weight: 700; color: #0B101F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Daniel Ibanez Becker</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Founder, IdleForest</p>
            </div>
        </div>

        <div style="background-color: #0B101F; padding: 20px 24px; border: 2px solid #000000; border-top: none; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #E0F146; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Turn your idle internet into real trees</p>
            <p style="margin: 0 0 16px 0;"><a href="https://idleforest.com" style="color: #E0F146; text-decoration: none; font-size: 13px;">idleforest.com</a></p>
            <a href="{{UNSUBSCRIBE_URL}}" style="color: #888;">Unsubscribe from emails</a>
        </div>

    </div>

</body>

</html>
$html$;

    launch_content TEXT := $html$
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0B101F; margin: 0; padding: 40px 20px; background-color: #D9D9D9;">

    <div style="max-width: 580px; margin: 0 auto;">

        <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
        </div>

        <div style="background-color: #F4F6EE; padding: 32px 32px 8px 32px; border: 2px solid #000000; border-bottom: none;">
            <p style="margin: 0 0 12px 0; font-size: 16px;">Hi {{{DISPLAY_NAME}}},</p>
            <p style="margin: 0; font-size: 26px; font-weight: 800; line-height: 1.25;">This is your forest.</p>
            <p style="margin: 10px 0 0 0; font-size: 16px;">{{{TREES_SENTENCE}}}</p>
        </div>

        <a href="{{{FOREST_URL}}}" style="display: block; border-left: 2px solid #000000; border-right: 2px solid #000000; background-color: #DCE2CF;">
            <img src="{{{FOREST_IMAGE_URL}}}" alt="Your IdleForest forest" width="576" style="display: block; width: 100%; max-width: 576px; height: auto; border: 0;">
        </a>

        <div style="background-color: #F4F6EE; padding: 28px 32px 32px 32px; border: 2px solid #000000; border-top: none;">
            <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #3A4150;">New</p>
            <p style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; line-height: 1.3;">Plant a tree with a friend</p>
            <p style="margin: 0 0 12px 0; font-size: 16px;">{{{REWARD_SENTENCE}}}</p>
            <p style="margin: 0 0 24px 0; font-size: 16px;">Think of one person who would like this. A partner, a parent, or a friend whose laptop is on all day.</p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 16px 0;">
                <tr>
                    <td style="padding: 0 0 10px 0;">
                        <a href="{{{WHATSAPP_URL}}}"
                            style="display: block; padding: 15px 20px; background-color: #0B101F; color: #E0F146; text-decoration: none; font-weight: 800; font-size: 16px; text-align: center; border: 2px solid #000000;">Invite on WhatsApp</a>
                    </td>
                </tr>
                <tr>
                    <td>
                        <a href="{{{EMAIL_SHARE_URL}}}"
                            style="display: block; padding: 15px 20px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 800; font-size: 16px; text-align: center; border: 2px solid #000000;">Invite by email</a>
                    </td>
                </tr>
            </table>

            <p style="margin: 0; font-size: 14px; color: #3A4150;">Or share your own link:<br><a href="{{{INVITE_URL}}}" style="color: #0B101F; font-weight: 700; word-break: break-all;">{{{INVITE_LABEL}}}</a></p>

            <div style="margin-top: 28px; padding-top: 20px; border-top: 3px solid #E0F146;">
                <p style="margin: 0 0 12px 0; font-size: 15px;">Thank you for letting your computer plant trees.</p>
                <p style="margin: 0; font-weight: 700; color: #0B101F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Daniel Ibanez Becker</p>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Founder, IdleForest</p>
            </div>
        </div>

        <div style="background-color: #0B101F; padding: 20px 24px; border: 2px solid #000000; border-top: none; text-align: center;">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #E0F146; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Turn your idle internet into real trees</p>
            <p style="margin: 0 0 16px 0;"><a href="https://idleforest.com" style="color: #E0F146; text-decoration: none; font-size: 13px;">idleforest.com</a></p>
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

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral: friend not started yet') THEN
        UPDATE public.email_templates
        SET subject = 'A quick message could help {{{FRIEND_NAMES}}} get started',
            content = stalled_content,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral: friend not started yet';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral: friend not started yet',
            'A quick message could help {{{FRIEND_NAMES}}} get started',
            stalled_content,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral launch: your forest') THEN
        UPDATE public.email_templates
        SET subject = 'Your forest, and a tree for a friend',
            content = launch_content,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral launch: your forest';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral launch: your forest',
            'Your forest, and a tree for a friend',
            launch_content,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;
END $$;
