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
  'Waste Free Planet',
  'https://www.wastefreeplanet.org/',
  'wastefree-planet',
  'Waste Free Planet makes sustainability practical with waste-reduction education, a workbook, and everyday guides. IdleForest support from this company forest funds plastic removal in Waste Free Planet''s name through 1ClickImpact and Plastic Bank.',
  '/partner/wastefree/wfp-logo-white.webp',
  false,
  NULL,
  '#67d7d1',
  'company_named_donation',
  'Waste Free Planet',
  'https://www.wastefreeplanet.org/',
  'Donate generated company forest funds through 1ClickImpact clean-ocean projects with Plastic Bank in Waste Free Planet''s name.',
  27
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
