-- Track whether a conservation organization is realistically approachable by IdleForest now.
ALTER TABLE partner_leads
    ADD COLUMN IF NOT EXISTS accessibility_score INTEGER
        CHECK (accessibility_score IS NULL OR accessibility_score BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS accessibility_tier TEXT NOT NULL DEFAULT 'unknown'
        CHECK (accessibility_tier IN ('ready_now', 'nurture', 'unlikely_now', 'unknown')),
    ADD COLUMN IF NOT EXISTS accessibility_summary TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS state_dependency TEXT NOT NULL DEFAULT 'unknown'
        CHECK (state_dependency IN ('low', 'medium', 'high', 'unknown')),
    ADD COLUMN IF NOT EXISTS small_company_signal TEXT NOT NULL DEFAULT 'unknown'
        CHECK (small_company_signal IN ('positive', 'negative', 'unknown'));

CREATE INDEX IF NOT EXISTS partner_leads_accessibility_score_idx ON partner_leads(accessibility_score DESC);
CREATE INDEX IF NOT EXISTS partner_leads_accessibility_tier_idx ON partner_leads(accessibility_tier);
CREATE INDEX IF NOT EXISTS partner_leads_state_dependency_idx ON partner_leads(state_dependency);
CREATE INDEX IF NOT EXISTS partner_leads_small_company_signal_idx ON partner_leads(small_company_signal);

-- Keep every lightweight discovery result, even when it is not promoted to the
-- full outreach pipeline yet. This doubles as the permanent deduplication set.
CREATE TABLE IF NOT EXISTS partner_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT 'Unknown',
    country_code TEXT NOT NULL DEFAULT 'XX',
    category TEXT[] NOT NULL DEFAULT '{}',
    delivery_model TEXT NOT NULL DEFAULT 'unknown'
        CHECK (delivery_model IN ('direct_operator', 'land_owner_manager', 'project_network', 'grantmaker_funder', 'research_education', 'advocacy', 'mixed', 'unknown')),
    discovery_score INTEGER NOT NULL DEFAULT 0 CHECK (discovery_score BETWEEN 0 AND 100),
    accessibility_score INTEGER NOT NULL DEFAULT 0 CHECK (accessibility_score BETWEEN 0 AND 100),
    accessibility_tier TEXT NOT NULL DEFAULT 'unknown'
        CHECK (accessibility_tier IN ('ready_now', 'nurture', 'unlikely_now', 'unknown')),
    accessibility_summary TEXT NOT NULL DEFAULT '',
    state_dependency TEXT NOT NULL DEFAULT 'unknown'
        CHECK (state_dependency IN ('low', 'medium', 'high', 'unknown')),
    small_company_signal TEXT NOT NULL DEFAULT 'unknown'
        CHECK (small_company_signal IN ('positive', 'negative', 'unknown')),
    community_platform TEXT NOT NULL DEFAULT 'Unknown',
    community_size INTEGER CHECK (community_size IS NULL OR community_size >= 0),
    community_source_url TEXT NOT NULL DEFAULT '',
    activity_status TEXT NOT NULL DEFAULT 'unknown'
        CHECK (activity_status IN ('active', 'irregular', 'inactive', 'unknown')),
    activity_signal TEXT NOT NULL DEFAULT '',
    why_fit TEXT NOT NULL DEFAULT '',
    verification_gaps TEXT[] NOT NULL DEFAULT '{}',
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    focus TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'discovered'
        CHECK (status IN ('discovered', 'researched', 'dismissed')),
    first_discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_discoveries_status_idx ON partner_discoveries(status);
CREATE INDEX IF NOT EXISTS partner_discoveries_score_idx ON partner_discoveries(discovery_score DESC);
CREATE INDEX IF NOT EXISTS partner_discoveries_accessibility_idx ON partner_discoveries(accessibility_tier, accessibility_score DESC);
CREATE INDEX IF NOT EXISTS partner_discoveries_delivery_model_idx ON partner_discoveries(delivery_model);
CREATE INDEX IF NOT EXISTS partner_discoveries_community_size_idx ON partner_discoveries(community_size);
CREATE INDEX IF NOT EXISTS partner_discoveries_country_code_idx ON partner_discoveries(country_code);
CREATE INDEX IF NOT EXISTS partner_discoveries_category_gin_idx ON partner_discoveries USING GIN(category);

ALTER TABLE partner_discoveries ENABLE ROW LEVEL SECURITY;
-- No policies: admin-session-protected server routes use the service role.
