-- Normalize partner research into queryable dimensions while retaining concise display text.
ALTER TABLE partner_leads
    ADD COLUMN IF NOT EXISTS organization_type TEXT NOT NULL DEFAULT 'other'
        CHECK (organization_type IN ('ngo', 'company', 'foundation', 'university', 'government', 'individual', 'network', 'other')),
    ADD COLUMN IF NOT EXISTS country_code TEXT NOT NULL DEFAULT 'XX'
        CHECK (country_code ~ '^[A-Z]{2}$'),
    ADD COLUMN IF NOT EXISTS team_type TEXT NOT NULL DEFAULT 'unknown'
        CHECK (team_type IN ('paid_staff', 'volunteer_led', 'hybrid', 'unknown')),
    ADD COLUMN IF NOT EXISTS delivery_model TEXT NOT NULL DEFAULT 'unknown'
        CHECK (delivery_model IN ('direct_operator', 'land_owner_manager', 'project_network', 'grantmaker_funder', 'research_education', 'advocacy', 'mixed', 'unknown')),
    ADD COLUMN IF NOT EXISTS annual_revenue_amount NUMERIC,
    ADD COLUMN IF NOT EXISTS annual_revenue_currency TEXT
        CHECK (annual_revenue_currency IS NULL OR annual_revenue_currency ~ '^[A-Z]{3}$'),
    ADD COLUMN IF NOT EXISTS annual_revenue_year INTEGER
        CHECK (annual_revenue_year IS NULL OR annual_revenue_year BETWEEN 1900 AND 2100),
    ADD COLUMN IF NOT EXISTS revenue_band TEXT NOT NULL DEFAULT 'unknown'
        CHECK (revenue_band IN ('under_100k', '100k_1m', '1m_10m', '10m_plus', 'unknown')),
    ADD COLUMN IF NOT EXISTS funding_status TEXT NOT NULL DEFAULT 'unknown'
        CHECK (funding_status IN ('stable', 'growing', 'fundraising', 'constrained', 'unknown')),
    ADD COLUMN IF NOT EXISTS community_max INTEGER,
    ADD COLUMN IF NOT EXISTS community_band TEXT NOT NULL DEFAULT 'unknown'
        CHECK (community_band IN ('under_4k', '4k_25k', '25k_100k', '100k_500k', 'over_500k', 'unknown')),
    ADD COLUMN IF NOT EXISTS activity_status TEXT NOT NULL DEFAULT 'unknown'
        CHECK (activity_status IN ('active', 'irregular', 'inactive', 'unknown'));

UPDATE partner_leads
SET
    organization_type = CASE
        WHEN structure ILIKE '%university%' THEN 'university'
        WHEN structure ILIKE '%foundation%' THEN 'foundation'
        WHEN structure ILIKE '%company%' OR structure ILIKE '%business%' THEN 'company'
        WHEN structure ILIKE '%government%' OR structure ILIKE '%public body%' THEN 'government'
        WHEN structure ILIKE '%individual%' THEN 'individual'
        WHEN structure ILIKE '%network%' OR structure ILIKE '%coalition%' THEN 'network'
        WHEN structure ILIKE '%ngo%' OR structure ILIKE '%nonprofit%' OR structure ILIKE '%non-profit%' THEN 'ngo'
        ELSE organization_type
    END,
    team_type = CASE
        WHEN team_model ILIKE '%volunteer%' AND (team_model ILIKE '%staff%' OR team_model ILIKE '%employee%') THEN 'hybrid'
        WHEN team_model ILIKE '%volunteer%' THEN 'volunteer_led'
        WHEN team_model ILIKE '%staff%' OR team_model ILIKE '%employee%' THEN 'paid_staff'
        ELSE team_type
    END,
    delivery_model = CASE
        WHEN operator_type ILIKE '%direct%' OR operator_type ILIKE '%operator%' THEN 'direct_operator'
        WHEN operator_type ILIKE '%land owner%' OR operator_type ILIKE '%land manager%' OR operator_type ILIKE '%acquisition%' THEN 'land_owner_manager'
        WHEN operator_type ILIKE '%network%' OR operator_type ILIKE '%manager%' THEN 'project_network'
        WHEN operator_type ILIKE '%fund%' OR operator_type ILIKE '%grant%' THEN 'grantmaker_funder'
        WHEN operator_type ILIKE '%research%' OR operator_type ILIKE '%education%' THEN 'research_education'
        WHEN operator_type ILIKE '%advocacy%' THEN 'advocacy'
        ELSE delivery_model
    END,
    community_max = (
        SELECT MAX((community->>'followers')::INTEGER)
        FROM jsonb_array_elements(communities) AS community
        WHERE community->>'followers' ~ '^[0-9]+$'
    );

UPDATE partner_leads
SET community_band = CASE
    WHEN community_max IS NULL THEN 'unknown'
    WHEN community_max < 4000 THEN 'under_4k'
    WHEN community_max < 25000 THEN '4k_25k'
    WHEN community_max < 100000 THEN '25k_100k'
    WHEN community_max <= 500000 THEN '100k_500k'
    ELSE 'over_500k'
END;

CREATE INDEX IF NOT EXISTS partner_leads_organization_type_idx ON partner_leads(organization_type);
CREATE INDEX IF NOT EXISTS partner_leads_delivery_model_idx ON partner_leads(delivery_model);
CREATE INDEX IF NOT EXISTS partner_leads_team_type_idx ON partner_leads(team_type);
CREATE INDEX IF NOT EXISTS partner_leads_country_code_idx ON partner_leads(country_code);
CREATE INDEX IF NOT EXISTS partner_leads_community_max_idx ON partner_leads(community_max);
CREATE INDEX IF NOT EXISTS partner_leads_community_band_idx ON partner_leads(community_band);
CREATE INDEX IF NOT EXISTS partner_leads_annual_revenue_idx ON partner_leads(annual_revenue_amount);
CREATE INDEX IF NOT EXISTS partner_leads_revenue_band_idx ON partner_leads(revenue_band);
CREATE INDEX IF NOT EXISTS partner_leads_funding_status_idx ON partner_leads(funding_status);
CREATE INDEX IF NOT EXISTS partner_leads_activity_status_idx ON partner_leads(activity_status);
CREATE INDEX IF NOT EXISTS partner_leads_category_gin_idx ON partner_leads USING GIN(category);
CREATE INDEX IF NOT EXISTS partner_leads_financial_model_gin_idx ON partner_leads USING GIN(financial_model);
