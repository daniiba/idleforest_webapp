-- Referral loop, part 4:
--   * the double-sided reward becomes one tree for each person
--   * email copy uses pre-pluralised placeholders ("1 tree", "3 trees")
--   * the hourly referral job runs from Supabase (pg_cron + pg_net) instead
--     of Vercel cron
--   * the launch announcement is seeded as a broadcast template

-- ---------------------------------------------------------------------------
-- 1. One tree each
-- ---------------------------------------------------------------------------

ALTER TABLE public.referral_reward_settings
    ALTER COLUMN trees_per_person SET DEFAULT 1;

UPDATE public.referral_reward_settings
SET trees_per_person = 1,
    updated_at = NOW()
WHERE id;

-- ---------------------------------------------------------------------------
-- 2. Plural-safe email copy
-- ---------------------------------------------------------------------------
-- The app now fills {{{REWARD_TREES_TEXT}}} / {{{TOTAL_TREES_TEXT}}} with
-- "1 tree" / "2 trees". Only the original phrases are rewritten, so copy
-- edited in the admin dashboard is left alone.

DO $$
BEGIN
    IF to_regclass('public.email_templates') IS NULL THEN
        RETURN;
    END IF;

    UPDATE public.email_templates
    SET subject = replace(replace(subject,
            '{{{REWARD_TREES}}} trees', '{{{REWARD_TREES_TEXT}}}'),
            '{{{TOTAL_TREES}}} trees', '{{{TOTAL_TREES_TEXT}}}'),
        content = replace(replace(replace(replace(content,
            '{{{REWARD_TREES}}} trees', '{{{REWARD_TREES_TEXT}}}'),
            '{{{TOTAL_TREES}}} trees', '{{{TOTAL_TREES_TEXT}}}'),
            'Trees added to your forest', 'Added to your forest'),
            'and {{{REWARD_TREES}}} for them', 'and {{{REWARD_TREES_TEXT}}} for them'),
        updated_at = NOW()
    WHERE name IN (
        'Referral: friend joined',
        'Referral: friend contributing',
        'Referral: trees planted (inviter)',
        'Referral: trees planted (invitee)'
    );

    -- "1 tree for you, 1 for them" reads better than "1 tree for you, 1 tree for them".
    UPDATE public.email_templates
    SET content = replace(content,
            '{{{REWARD_TREES_TEXT}}} for you, {{{REWARD_TREES}}} for them',
            '{{{REWARD_TREES_TEXT}}} for you and {{{REWARD_TREES_TEXT}}} for them'),
        updated_at = NOW()
    WHERE name = 'Referral: trees planted (inviter)';
END $$;

-- ---------------------------------------------------------------------------
-- 3. Hourly referral job from Supabase
-- ---------------------------------------------------------------------------
-- pg_cron calls public.run_referral_cron() every hour; it POSTs to the
-- website's /api/cron/referrals with a bearer secret kept in Supabase Vault.
--
-- One-time setup (SQL editor), using the same value as CRON_SECRET (or
-- REFERRAL_CRON_SECRET) in Vercel:
--   select vault.create_secret('<secret>', 'referral_cron_secret');
-- Optional, for staging:
--   select vault.create_secret('https://staging.example.com/api/cron/referrals', 'referral_cron_url');

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_net') THEN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions';
    ELSE
        RAISE NOTICE 'pg_net is not available; referral cron will not be scheduled';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
        EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_cron';
    ELSE
        RAISE NOTICE 'pg_cron is not available; referral cron will not be scheduled';
    END IF;
EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'Enable pg_cron and pg_net under Database > Extensions, then re-run this migration';
END $$;

CREATE OR REPLACE FUNCTION public.run_referral_cron()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_secret TEXT;
    v_url TEXT;
    v_request_id BIGINT;
BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets
    WHERE name = 'referral_cron_secret'
    LIMIT 1;

    IF v_secret IS NULL OR v_secret = '' THEN
        RAISE WARNING 'referral cron skipped: add the vault secret "referral_cron_secret"';
        RETURN NULL;
    END IF;

    SELECT decrypted_secret INTO v_url
    FROM vault.decrypted_secrets
    WHERE name = 'referral_cron_url'
    LIMIT 1;

    -- pg_net is asynchronous: this only queues the request. The generous
    -- timeout keeps the connection open while the route plants rewards.
    SELECT net.http_post(
        url := COALESCE(NULLIF(v_url, ''), 'https://www.idleforest.com/api/cron/referrals'),
        headers := jsonb_build_object(
            'Authorization', 'Bearer ' || v_secret,
            'Content-Type', 'application/json'
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 60000
    ) INTO v_request_id;

    RETURN v_request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.run_referral_cron() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.run_referral_cron() FROM anon;
REVOKE ALL ON FUNCTION public.run_referral_cron() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.run_referral_cron() TO service_role;

DO $$
BEGIN
    IF to_regnamespace('cron') IS NULL OR to_regnamespace('net') IS NULL THEN
        RAISE NOTICE 'pg_cron/pg_net not installed; skipping referral cron schedule';
        RETURN;
    END IF;

    -- Named jobs are upserted, so re-running keeps a single schedule.
    PERFORM cron.schedule(
        'referral-rewards-and-notifications',
        '17 * * * *',
        'select public.run_referral_cron()'
    );
END $$;

-- ---------------------------------------------------------------------------
-- 4. Launch announcement (send from the admin dashboard as a broadcast)
-- ---------------------------------------------------------------------------
-- Same content as emails/referral-launch.html.

DO $$
DECLARE
    launch_content TEXT := $html$
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plant a tree with a friend</title>
</head>

<body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #0B101F; margin: 0; padding: 40px 20px; background-color: #D9D9D9;">

    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Invite someone to IdleForest and we'll plant a tree for each of you.</div>

    <div style="max-width: 580px; margin: 0 auto;">

        <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://www.idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
        </div>

        <a href="https://www.idleforest.com/referrals?utm_source=resend&amp;utm_medium=broadcast&amp;utm_campaign=referral_launch_hero"
            style="display: block; border: 2px solid #000000; border-bottom: none; background-color: #0B101F;">
            <img src="https://www.idleforest.com/api/og/forest?demo=1" width="580" alt="An island forest: your trees, the trees your invites earned, and your friends' forests around it"
                style="display: block; width: 100%; height: auto; border: 0;">
        </a>

        <div style="background-color: #ffffff; padding: 32px; border: 2px solid #000000;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hey {{{FIRST_NAME|there}}},</p>

            <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: 800; line-height: 1.2;">Plant a tree with a friend.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">Starting today, every person you bring to IdleForest grows your forest twice. Their computer starts funding tree planting, and once it has contributed on 3 different days, <strong>we plant a tree for you and a tree for them</strong>.</p>

            <div style="background-color: #F4F7DC; border: 2px solid #000000; padding: 18px 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>1.</strong> Open your personal invite link.</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>2.</strong> Send it to one person who would like this: a friend, a colleague, your family chat.</p>
                <p style="margin: 0; font-size: 15px;"><strong>3.</strong> When they have been contributing for 3 days, you both get a tree.</p>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 16px;">We also built something new: <strong>your forest</strong>. One view of everything you have set in motion: the trees you planted, the trees your invites earned, and the forests the people you invited are growing.</p>

            <div style="text-align: center; margin: 28px 0;">
                <a href="https://www.idleforest.com/referrals?utm_source=resend&amp;utm_medium=broadcast&amp;utm_campaign=referral_launch"
                    style="display: inline-block; padding: 14px 32px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #000000;">See
                    your forest &amp; invite</a>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 14px; color: #444;">Using the desktop app? Update to the latest version and open the <strong>Invite</strong> tab, or right-click the tray icon and choose <strong>Invite a friend</strong>.</p>

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
            <p style="margin: 0 0 16px 0;"><a href="https://www.idleforest.com"
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

    IF EXISTS (SELECT 1 FROM public.email_templates WHERE name = 'Referral launch: plant a tree with a friend') THEN
        UPDATE public.email_templates
        SET subject = 'Plant a tree with a friend 🌳',
            content = launch_content,
            from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
            updated_at = NOW()
        WHERE name = 'Referral launch: plant a tree with a friend';
    ELSE
        INSERT INTO public.email_templates (name, subject, content, from_email)
        VALUES (
            'Referral launch: plant a tree with a friend',
            'Plant a tree with a friend 🌳',
            launch_content,
            'Daniel from IdleForest <daniel@idleforest.com>'
        );
    END IF;
END $$;
