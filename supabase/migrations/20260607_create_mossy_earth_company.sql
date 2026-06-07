INSERT INTO public.companies (
  name,
  website,
  slug,
  description,
  logo_url,
  is_invite_only,
  invite_code,
  theme_color,
  impact_mode,
  payout_recipient_name,
  payout_recipient_url,
  payout_notes,
  payout_rate_cents_per_1000_points
)
VALUES (
  'Mossy Earth',
  'https://www.mossy.earth/',
  'mossy-earth',
  'Mossy Earth is a team of biologists running conservation and rewilding projects across degraded ecosystems. IdleForest support from this company forest is reserved for Mossy Earth conservation work.',
  '/partner/mossy-earth/logo-mark.svg',
  false,
  NULL,
  '#347d67',
  'partner_payout',
  'Mossy Earth',
  'https://www.mossy.earth/',
  'Send generated company forest funds to Mossy Earth for conservation and rewilding projects.',
  55
)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  is_invite_only = false,
  theme_color = EXCLUDED.theme_color,
  impact_mode = EXCLUDED.impact_mode,
  payout_recipient_name = EXCLUDED.payout_recipient_name,
  payout_recipient_url = EXCLUDED.payout_recipient_url,
  payout_notes = EXCLUDED.payout_notes,
  payout_rate_cents_per_1000_points = EXCLUDED.payout_rate_cents_per_1000_points;
