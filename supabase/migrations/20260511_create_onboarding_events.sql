CREATE TABLE IF NOT EXISTS onboarding_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL,
    source TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_user_id ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_name ON onboarding_events(event_name);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_at ON onboarding_events(created_at);

ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding events"
ON onboarding_events FOR SELECT
USING (auth.uid() = user_id);

COMMENT ON TABLE onboarding_events IS 'Tracks onboarding funnel events such as signup, desktop download clicks, and desktop sync';
