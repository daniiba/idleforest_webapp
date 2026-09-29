-- The automatic "your friend has not started yet" email felt too much like
-- reporting on the friend. Members can still send a check-in themselves from
-- /referrals. This removes the email's template and query; harmless if
-- 20261003 never ran.

DROP FUNCTION IF EXISTS public.get_stalled_referrals(INTEGER, INTEGER, INTEGER);
DROP INDEX IF EXISTS public.referral_attributions_stalled_idx;
ALTER TABLE IF EXISTS public.referral_attributions DROP COLUMN IF EXISTS stalled_notified_at;

DO $$
BEGIN
    IF to_regclass('public.email_templates') IS NOT NULL THEN
        DELETE FROM public.email_templates WHERE name = 'Referral: friend not started yet';
    END IF;
END $$;
