-- Migration: unique_display_names
-- Purpose: Prevent duplicate display names (case-insensitive) and optionally prevent emails as names.

-- 1. Create a unique case-insensitive index on display_name
-- Note: This will fail if there are existing duplicates.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_display_name_lower 
ON profiles (LOWER(display_name));

-- 2. Add a constraint to prevent display_names from being emails
-- This helps avoid confusion between usernames (emails) and display names.
ALTER TABLE profiles 
ADD CONSTRAINT display_name_not_email 
CHECK (display_name !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
