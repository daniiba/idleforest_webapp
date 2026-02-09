-- Marketing Entries table for tracking posts, partnerships, costs, and analytics
-- Used for generating monthly reports
-- NOTE: Admin-only access via service role (no RLS policies)

CREATE TABLE IF NOT EXISTS marketing_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image_url TEXT,
    platform TEXT DEFAULT 'other' CHECK (platform IN ('instagram', 'youtube', 'linkedin', 'twitter', 'other')),
    cost NUMERIC(10, 2),
    impressions INTEGER,
    clicks INTEGER,
    engagement INTEGER,
    notes TEXT,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient month/year queries
CREATE INDEX idx_marketing_entries_period ON marketing_entries(year, month);

-- Enable RLS and block all direct access (only service role can access)
ALTER TABLE marketing_entries ENABLE ROW LEVEL SECURITY;

-- No policies = no access except via service role (admin client)
-- All operations will go through admin-protected server actions

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_marketing_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER marketing_entries_updated_at
    BEFORE UPDATE ON marketing_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_marketing_entries_updated_at();
