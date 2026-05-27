CREATE TABLE IF NOT EXISTS public.company_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  generated_points_final BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('active', 'left', 'switched'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_memberships_one_active_user
  ON public.company_memberships(user_id)
  WHERE left_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_company_memberships_company_status
  ON public.company_memberships(company_id, status);

CREATE INDEX IF NOT EXISTS idx_company_memberships_user_id
  ON public.company_memberships(user_id);

CREATE TABLE IF NOT EXISTS public.company_membership_node_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES public.company_memberships(id) ON DELETE CASCADE,
  node_identifier TEXT NOT NULL,
  baseline_total_requests BIGINT NOT NULL DEFAULT 0,
  final_total_requests BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (membership_id, node_identifier)
);

CREATE INDEX IF NOT EXISTS idx_company_membership_node_baselines_membership
  ON public.company_membership_node_baselines(membership_id);

CREATE TABLE IF NOT EXISTS public.company_fund_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.company_memberships(id) ON DELETE SET NULL,
  user_id UUID,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  points BIGINT NOT NULL DEFAULT 0,
  amount_cents BIGINT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (type IN ('generated', 'payout', 'donation', 'adjustment')),
  CHECK (status IN ('pending', 'approved', 'paid', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_company_fund_ledger_company_status
  ON public.company_fund_ledger(company_id, status);

ALTER TABLE public.company_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_membership_node_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_fund_ledger ENABLE ROW LEVEL SECURITY;

INSERT INTO public.company_memberships (
  company_id,
  user_id,
  status,
  joined_at
)
SELECT
  profile.company_id,
  profile.user_id,
  'active',
  COALESCE(profile.company_joined_at, NOW())
FROM public.profiles AS profile
WHERE profile.company_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.company_memberships AS existing
    WHERE existing.user_id = profile.user_id
      AND existing.left_at IS NULL
  );

INSERT INTO public.company_membership_node_baselines (
  membership_id,
  node_identifier,
  baseline_total_requests
)
SELECT
  membership.id,
  node.node_identifier,
  CASE
    WHEN company.slug = 'silveira' THEN GREATEST(COALESCE(old_baseline.baseline_total_requests, node.total_requests, 0), 0)
    ELSE 0
  END
FROM public.company_memberships AS membership
JOIN public.companies AS company
  ON company.id = membership.company_id
JOIN public.nodes AS node
  ON node.user_id = membership.user_id
LEFT JOIN public.company_node_points_baselines AS old_baseline
  ON old_baseline.company_id = membership.company_id
  AND old_baseline.user_id = membership.user_id
  AND old_baseline.node_identifier = node.node_identifier
WHERE membership.left_at IS NULL
  AND node.node_identifier IS NOT NULL
ON CONFLICT (membership_id, node_identifier) DO NOTHING;
