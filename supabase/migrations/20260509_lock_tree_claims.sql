-- Prevent multiple welcome-tree claim tokens for the same user.
-- If production already has duplicates, keep the earliest row per user before applying.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_tree_claims_user_id_unique
ON pending_tree_claims(user_id);
