-- Backfill referral attribution for users who first joined through a team invite.
-- The application now writes this on signup, but older invite signups only had
-- team_invite_uses analytics rows.

WITH first_invite_signup AS (
    SELECT DISTINCT ON (invite_use.user_id)
        invite_use.user_id,
        invite.created_by AS referred_by
    FROM public.team_invite_uses AS invite_use
    JOIN public.team_invites AS invite
        ON invite.id = invite_use.invite_id
    WHERE invite_use.is_new_signup = true
      AND invite.created_by <> invite_use.user_id
    ORDER BY invite_use.user_id, invite_use.used_at ASC
)
UPDATE public.pending_tree_claims AS claim
SET referred_by = first_invite_signup.referred_by
FROM first_invite_signup
WHERE claim.user_id = first_invite_signup.user_id
  AND claim.referred_by IS NULL;
