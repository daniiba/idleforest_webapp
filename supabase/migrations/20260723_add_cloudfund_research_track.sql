-- Keep IdleForest conservation research and CloudFund fundraising research
-- independent while reusing the existing qualification and outreach workflow.
ALTER TABLE partner_leads
    ADD COLUMN IF NOT EXISTS research_track TEXT NOT NULL DEFAULT 'idleforest'
        CHECK (research_track IN ('idleforest', 'cloudfund')),
    ADD COLUMN IF NOT EXISTS fundraising_platform TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS fundraising_model TEXT NOT NULL DEFAULT 'unknown'
        CHECK (fundraising_model IN ('recurring_membership', 'long_running_campaign', 'open_ended_campaign', 'fixed_term_campaign', 'unknown')),
    ADD COLUMN IF NOT EXISTS fundraising_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS funding_goal_amount NUMERIC
        CHECK (funding_goal_amount IS NULL OR funding_goal_amount >= 0),
    ADD COLUMN IF NOT EXISTS amount_raised NUMERIC
        CHECK (amount_raised IS NULL OR amount_raised >= 0),
    ADD COLUMN IF NOT EXISTS funding_currency TEXT
        CHECK (funding_currency IS NULL OR funding_currency ~ '^[A-Z]{3}$'),
    ADD COLUMN IF NOT EXISTS campaign_started_at DATE,
    ADD COLUMN IF NOT EXISTS fundraising_signal TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS is_environmental BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE partner_leads
    DROP CONSTRAINT IF EXISTS partner_leads_url_key;

CREATE UNIQUE INDEX IF NOT EXISTS partner_leads_track_url_unique
    ON partner_leads(research_track, url);
CREATE INDEX IF NOT EXISTS partner_leads_research_track_idx
    ON partner_leads(research_track, updated_at DESC);
CREATE INDEX IF NOT EXISTS partner_leads_fundraising_model_idx
    ON partner_leads(fundraising_model);

ALTER TABLE partner_discoveries
    ADD COLUMN IF NOT EXISTS research_track TEXT NOT NULL DEFAULT 'idleforest'
        CHECK (research_track IN ('idleforest', 'cloudfund')),
    ADD COLUMN IF NOT EXISTS fundraising_platform TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS fundraising_model TEXT NOT NULL DEFAULT 'unknown'
        CHECK (fundraising_model IN ('recurring_membership', 'long_running_campaign', 'open_ended_campaign', 'fixed_term_campaign', 'unknown')),
    ADD COLUMN IF NOT EXISTS fundraising_url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS funding_goal_amount NUMERIC
        CHECK (funding_goal_amount IS NULL OR funding_goal_amount >= 0),
    ADD COLUMN IF NOT EXISTS amount_raised NUMERIC
        CHECK (amount_raised IS NULL OR amount_raised >= 0),
    ADD COLUMN IF NOT EXISTS funding_currency TEXT
        CHECK (funding_currency IS NULL OR funding_currency ~ '^[A-Z]{3}$'),
    ADD COLUMN IF NOT EXISTS campaign_started_at DATE,
    ADD COLUMN IF NOT EXISTS fundraising_signal TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS is_environmental BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE partner_discoveries
    DROP CONSTRAINT IF EXISTS partner_discoveries_domain_key;

CREATE UNIQUE INDEX IF NOT EXISTS partner_discoveries_track_domain_unique
    ON partner_discoveries(research_track, domain);
CREATE INDEX IF NOT EXISTS partner_discoveries_research_track_idx
    ON partner_discoveries(research_track, last_discovered_at DESC);
CREATE INDEX IF NOT EXISTS partner_discoveries_fundraising_model_idx
    ON partner_discoveries(fundraising_model);
