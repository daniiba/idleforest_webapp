DO $$
DECLARE
    template_content TEXT := $html$
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Waste Free Planet is live on IdleForest</title>
</head>

<body
    style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #0B101F; margin: 0; padding: 40px 20px; background-color: #D9D9D9;">

    <div style="max-width: 580px; margin: 0 auto;">

        <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
        </div>

        <div style="background-color: #ffffff; padding: 32px; border: 2px solid #000000;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hey {{{FIRST_NAME}}},</p>

            <p style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Waste Free Planet is now live on IdleForest.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">Quick update from me: we added a new company forest for Waste Free Planet.</p>

            <p style="margin: 0 0 20px 0; font-size: 16px;">I like their work because it is practical. Less perfection, more useful habits: reduce what you can, reuse what you can, and make the rest count.</p>

            <img src="https://idleforest.com/partner/wastefree/email-impact-hero.jpg" alt="IdleForest and Waste Free Planet cleanup impact update"
                style="display: block; width: 100%; height: auto; margin: 8px 0 24px 0;">

            <p style="margin: 0 0 20px 0; font-size: 16px;">For IdleForest, this partnership is focused on cleanup funding. When you join the Waste Free Planet forest, future support from your IdleForest activity can go toward ocean-bound plastic recovery through 1ClickImpact and Plastic Bank, in Waste Free Planet's name.</p>

            <div style="background-color: #F4F7DC; border: 2px solid #000000; padding: 18px 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 15px; font-weight: 700;">What changes for you?</p>
                <p style="margin: 8px 0 0 0; font-size: 15px;">No subscription, no extra donation, no new habit to learn. Joining just connects your future IdleForest support to the Waste Free Planet cleanup fund.</p>
            </div>

            <div style="text-align: center; margin: 28px 0;">
                <a href="https://idleforest.com/c/wastefree-planet?utm_source=resend&amp;utm_medium=broadcast&amp;utm_campaign=wastefree_planet_partnership"
                    style="display: inline-block; padding: 14px 32px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #000000;">Join
                    Waste Free Planet</a>
            </div>

            <p style="margin: 0 0 20px 0; font-size: 16px;">If you already use IdleForest, this only takes a moment. If you are new, the page will walk you through setup.</p>

            <p style="margin: 0 0 0 0; font-size: 16px;">See you in the forest,</p>

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
                Turn your idle internet into real impact</p>
            <p style="margin: 0 0 16px 0;"><a href="https://idleforest.com"
                    style="color: #E0F146; text-decoration: none; font-size: 13px;">idleforest.com</a></p>
            <a href="{{UNSUBSCRIBE_URL}}" style="color: #888;">Unsubscribe from emails</a>
        </div>

    </div>

</body>

</html>
$html$;
BEGIN
    IF to_regclass('public.email_templates') IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.email_templates
            WHERE name = 'Waste Free Planet partnership announcement'
        ) THEN
            UPDATE public.email_templates
            SET
                subject = 'Waste Free Planet is live on IdleForest',
                content = template_content,
                from_email = 'Daniel from IdleForest <daniel@idleforest.com>',
                updated_at = NOW()
            WHERE name = 'Waste Free Planet partnership announcement';
        ELSE
            INSERT INTO public.email_templates (name, subject, content, from_email)
            VALUES (
                'Waste Free Planet partnership announcement',
                'Waste Free Planet is live on IdleForest',
                template_content,
                'Daniel from IdleForest <daniel@idleforest.com>'
            );
        END IF;
    END IF;
END $$;
