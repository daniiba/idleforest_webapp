DELETE FROM public.company_node_points_baselines AS baseline
USING public.companies AS company
WHERE baseline.company_id = company.id
  AND company.slug <> 'silveira';

INSERT INTO public.company_node_points_baselines (
  company_id,
  user_id,
  node_identifier,
  baseline_total_requests
)
SELECT
  company.id,
  profile.user_id,
  node.node_identifier,
  GREATEST(COALESCE(node.total_requests, 0), 0)
FROM public.companies AS company
JOIN public.profiles AS profile
  ON profile.company_id = company.id
JOIN public.nodes AS node
  ON node.user_id = profile.user_id
WHERE company.slug = 'silveira'
  AND node.node_identifier IS NOT NULL
ON CONFLICT (company_id, user_id, node_identifier) DO UPDATE
SET
  baseline_total_requests = EXCLUDED.baseline_total_requests,
  created_at = NOW();
