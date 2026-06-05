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
  'Planet Wild',
  'https://planetwild.com/',
  'planetwild',
  'Planet Wild is a Berlin-based nature protection organisation funding monthly rewilding missions for endangered animals, oceans, forests, and wild landscapes. IdleForest support from this company forest is reserved for Planet Wild rewilding work.',
  '/partner/planetwild/pw-logo-black.png',
  false,
  NULL,
  '#E0F146',
  'partner_payout',
  'Planet Wild',
  'https://planetwild.com/',
  'Send generated company forest funds to Planet Wild for documented rewilding missions.',
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
