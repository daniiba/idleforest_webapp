-- Team Invites Table for IdleForest
-- Run this SQL in your Supabase SQL Editor

-- Create the team_invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  uses_remaining INT DEFAULT NULL, -- NULL = unlimited uses
  expires_at TIMESTAMPTZ DEFAULT NULL, -- NULL = never expires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by invite code
CREATE INDEX IF NOT EXISTS idx_team_invites_code ON team_invites(invite_code);

-- Index for fetching invites by team
CREATE INDEX IF NOT EXISTS idx_team_invites_team_id ON team_invites(team_id);

-- Enable Row Level Security
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read invites (needed for invite landing page)
CREATE POLICY "Anyone can read invites" ON team_invites 
  FOR SELECT 
  USING (true);

-- Policy: Team members can create invites
CREATE POLICY "Team members can create invites" ON team_invites 
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invites.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Policy: Invite creator can update their invites (for decrementing uses)
CREATE POLICY "Creator can update invites" ON team_invites 
  FOR UPDATE
  USING (created_by = auth.uid());

-- Policy: Invite creator can delete their invites
CREATE POLICY "Creator can delete invites" ON team_invites 
  FOR DELETE
  USING (created_by = auth.uid());

-- Comment explaining the table
COMMENT ON TABLE team_invites IS 'Stores team invitation links that can be shared to invite new members';
COMMENT ON COLUMN team_invites.uses_remaining IS 'Number of times this invite can still be used. NULL means unlimited.';
COMMENT ON COLUMN team_invites.expires_at IS 'When this invite expires. NULL means it never expires.';
