-- Admin-only partner qualification and outreach command center.
CREATE TABLE IF NOT EXISTS partner_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    logo_url TEXT,
    score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
    recommendation TEXT NOT NULL DEFAULT 'potential_fit'
        CHECK (recommendation IN ('strong_fit', 'potential_fit', 'not_a_fit')),
    category TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL DEFAULT '',
    structure TEXT NOT NULL DEFAULT 'Unknown',
    location TEXT NOT NULL DEFAULT 'Unknown',
    team_model TEXT NOT NULL DEFAULT 'Unknown',
    operator_type TEXT NOT NULL DEFAULT 'Unknown',
    financial_model TEXT[] NOT NULL DEFAULT '{}',
    financial_situation TEXT NOT NULL DEFAULT 'Unknown',
    sponsors TEXT[] NOT NULL DEFAULT '{}',
    communities JSONB NOT NULL DEFAULT '[]'::jsonb,
    contacts JSONB NOT NULL DEFAULT '[]'::jsonb,
    socials JSONB NOT NULL DEFAULT '[]'::jsonb,
    activity_summary TEXT NOT NULL DEFAULT '',
    last_activity TEXT NOT NULL DEFAULT 'Unknown',
    fit_reasons TEXT[] NOT NULL DEFAULT '{}',
    risks TEXT[] NOT NULL DEFAULT '{}',
    outreach_angle TEXT NOT NULL DEFAULT '',
    outreach_subject TEXT NOT NULL DEFAULT '',
    outreach_message TEXT NOT NULL DEFAULT '',
    sources JSONB NOT NULL DEFAULT '[]'::jsonb,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (confidence BETWEEN 0 AND 1),
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'qualified', 'contacted', 'follow_up', 'partner', 'rejected')),
    reminder_at TIMESTAMP WITH TIME ZONE,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS partner_leads_status_idx ON partner_leads(status);
CREATE INDEX IF NOT EXISTS partner_leads_score_idx ON partner_leads(score DESC);
CREATE INDEX IF NOT EXISTS partner_leads_reminder_idx ON partner_leads(reminder_at)
    WHERE reminder_at IS NOT NULL;

ALTER TABLE partner_leads ENABLE ROW LEVEL SECURITY;
-- No policies: all access goes through admin-session-protected server code using service role.

CREATE OR REPLACE FUNCTION update_partner_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS partner_leads_updated_at ON partner_leads;
CREATE TRIGGER partner_leads_updated_at
    BEFORE UPDATE ON partner_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_partner_leads_updated_at();
