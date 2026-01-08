-- Create team_invite_uses table to track every invite usage
-- This allows analytics on which invites brought new users vs existing users

CREATE TABLE IF NOT EXISTS team_invite_uses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_id UUID NOT NULL REFERENCES team_invites(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    is_new_signup BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Prevent duplicate entries for same user/invite combo
    UNIQUE(invite_id, user_id)
);

-- Create indexes for common queries
CREATE INDEX idx_team_invite_uses_invite_id ON team_invite_uses(invite_id);
CREATE INDEX idx_team_invite_uses_user_id ON team_invite_uses(user_id);
CREATE INDEX idx_team_invite_uses_team_id ON team_invite_uses(team_id);
CREATE INDEX idx_team_invite_uses_is_new_signup ON team_invite_uses(is_new_signup);

-- Enable RLS
ALTER TABLE team_invite_uses ENABLE ROW LEVEL SECURITY;

-- NO INSERT POLICY - inserts are done server-side only via service role
-- This prevents users from faking invite usage data

-- Allow reading invite uses for team members (for analytics)
CREATE POLICY "Team members can view invite uses" ON team_invite_uses
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM team_members 
        WHERE team_members.team_id = team_invite_uses.team_id 
        AND team_members.user_id = auth.uid()
    )
);

-- Add comments
COMMENT ON TABLE team_invite_uses IS 'Tracks every use of a team invite for analytics';
COMMENT ON COLUMN team_invite_uses.is_new_signup IS 'True if this invite resulted in a new account creation';
