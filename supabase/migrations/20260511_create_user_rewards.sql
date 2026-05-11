CREATE TABLE IF NOT EXISTS user_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL,
    trees_awarded INT NOT NULL DEFAULT 0,
    node_id TEXT,
    provider TEXT,
    provider_response JSONB,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'awarded', 'failed')),
    error_message TEXT,
    awarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, reward_type)
);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_type ON user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);

ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
ON user_rewards FOR SELECT
USING (auth.uid() = user_id);

COMMENT ON TABLE user_rewards IS 'Tracks one-time user rewards such as desktop app install bonuses';
COMMENT ON COLUMN user_rewards.reward_type IS 'Stable reward key, e.g. desktop_first_connect';
COMMENT ON COLUMN user_rewards.node_id IS 'Optional node id that qualified the user for the reward';
