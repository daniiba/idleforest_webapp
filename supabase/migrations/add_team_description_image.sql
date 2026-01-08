-- Add description and image_url columns to teams table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN teams.description IS 'Optional team description';
COMMENT ON COLUMN teams.image_url IS 'Optional team image/logo URL';
