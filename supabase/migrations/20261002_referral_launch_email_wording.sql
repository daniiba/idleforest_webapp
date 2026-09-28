-- Wording: "set in motion" -> "grown" in the stored launch announcement.
-- replace() only touches the original sentence, so edits made in the admin
-- dashboard are kept.

DO $$
BEGIN
    IF to_regclass('public.email_templates') IS NULL THEN
        RETURN;
    END IF;

    UPDATE public.email_templates
    SET content = replace(content,
            'One view of everything you have set in motion:',
            'One view of everything you have grown:'),
        updated_at = NOW()
    WHERE name = 'Referral launch: plant a tree with a friend'
      AND content LIKE '%everything you have set in motion:%';
END $$;
