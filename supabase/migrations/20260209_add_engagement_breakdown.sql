-- Add separate columns for engagement breakdown
-- This allows tracking likes, comments, shares, and views separately
-- The existing 'engagement' column remains as a computed total for backwards compatibility

ALTER TABLE marketing_entries
ADD COLUMN IF NOT EXISTS likes INTEGER,
ADD COLUMN IF NOT EXISTS comments INTEGER,
ADD COLUMN IF NOT EXISTS shares INTEGER,
ADD COLUMN IF NOT EXISTS views INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN marketing_entries.likes IS 'Number of likes/reactions on the post';
COMMENT ON COLUMN marketing_entries.comments IS 'Number of comments on the post';
COMMENT ON COLUMN marketing_entries.shares IS 'Number of shares/reposts on the post';
COMMENT ON COLUMN marketing_entries.views IS 'Number of views (for videos/reels)';
COMMENT ON COLUMN marketing_entries.engagement IS 'Total engagement (likes + comments + shares), kept for backwards compatibility';
