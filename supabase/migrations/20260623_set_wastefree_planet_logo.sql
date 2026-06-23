UPDATE public.companies
SET logo_url = '/partner/wastefree/wfp-logo-white.webp'
WHERE slug = 'wastefree-planet'
  AND (logo_url IS NULL OR logo_url = '');
