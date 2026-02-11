-- Add SERP (Search Engine Results Page) tracking columns to marketing_entries
-- Used to track Google ranking position for guest blog articles

ALTER TABLE marketing_entries
ADD COLUMN IF NOT EXISTS serp_keyword TEXT,
ADD COLUMN IF NOT EXISTS serp_position INTEGER,
ADD COLUMN IF NOT EXISTS serp_snippet TEXT,
ADD COLUMN IF NOT EXISTS serp_last_checked TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN marketing_entries.serp_keyword IS 'Target keyword to check Google ranking for';
COMMENT ON COLUMN marketing_entries.serp_position IS 'Position in Google organic search results (1-100, null if not found)';
COMMENT ON COLUMN marketing_entries.serp_snippet IS 'Google snippet shown for this result';
COMMENT ON COLUMN marketing_entries.serp_last_checked IS 'Timestamp of last SERP check';
