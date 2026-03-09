-- Migration to introduce Company Portals/Widget lock-in

-- 1. Add fields to `companies` table to support custom landing pages and invites
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS video_url text, -- For their custom explainer video
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS is_invite_only boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS invite_code text UNIQUE, -- Primary gateway for widgets/portals
  ADD COLUMN IF NOT EXISTS theme_color text DEFAULT '#10B981'; -- Let them customize the button colors

-- 2. Add foreign key to `profiles` to strictly lock users to ONE company
-- Setting ON DELETE SET NULL so if a company is deleted, profiles remain but lose association
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- 3. Create indexes to keep DB lookups blazingly fast when fetching the portal by slug or code
CREATE INDEX IF NOT EXISTS idx_companies_invite_code ON public.companies(invite_code);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
