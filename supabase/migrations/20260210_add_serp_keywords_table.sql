-- SERP Keywords table: track multiple keywords per marketing entry
-- Each keyword independently tracks its Google ranking position

CREATE TABLE IF NOT EXISTS serp_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marketing_entry_id UUID NOT NULL REFERENCES marketing_entries(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    position INTEGER,  -- null = not ranked in top 100
    snippet TEXT,
    last_checked TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient lookups by entry
CREATE INDEX idx_serp_keywords_entry ON serp_keywords(marketing_entry_id);

-- Unique constraint: one keyword per entry (prevent duplicates)
CREATE UNIQUE INDEX idx_serp_keywords_unique ON serp_keywords(marketing_entry_id, keyword);

-- Enable RLS and block all direct access (only service role can access)
ALTER TABLE serp_keywords ENABLE ROW LEVEL SECURITY;

-- Migrate existing single-keyword data from marketing_entries to new table
INSERT INTO serp_keywords (marketing_entry_id, keyword, position, snippet, last_checked)
SELECT id, serp_keyword, serp_position, serp_snippet, serp_last_checked
FROM marketing_entries
WHERE serp_keyword IS NOT NULL AND serp_keyword != ''
ON CONFLICT (marketing_entry_id, keyword) DO NOTHING;
