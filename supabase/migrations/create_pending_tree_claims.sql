CREATE TABLE pending_tree_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    user_name TEXT,
    claim_token TEXT NOT NULL UNIQUE,
    trees_earned INT DEFAULT 0,
    claim_method TEXT DEFAULT NULL, -- 'quick', 'team_join', 'team_create', 'referral'
    claimed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_pending_tree_claims_token ON pending_tree_claims(claim_token);

-- Enable RLS
ALTER TABLE pending_tree_claims ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own claims
CREATE POLICY "Users can view own pending claims" 
ON pending_tree_claims FOR SELECT 
USING (auth.uid() = user_id);

-- Allow server-side operations (Edge Functions/admin) to manage all
-- Note: Service role bypasses RLS, but explicit policy for admin client can be useful
