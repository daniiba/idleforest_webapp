-- Add UPDATE policy for teams table
-- Allows team owners to update their team

-- First ensure RLS is enabled on teams table (may already be enabled)
ALTER TABLE IF EXISTS teams ENABLE ROW LEVEL SECURITY;

-- Create policy for team owners to update their teams
CREATE POLICY "Team owners can update their teams" ON teams
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);
