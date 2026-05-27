CREATE TABLE IF NOT EXISTS public.company_node_points_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  node_identifier TEXT NOT NULL,
  baseline_total_requests BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, user_id, node_identifier)
);

CREATE INDEX IF NOT EXISTS idx_company_node_points_baselines_company_id
  ON public.company_node_points_baselines(company_id);

CREATE INDEX IF NOT EXISTS idx_company_node_points_baselines_user_id
  ON public.company_node_points_baselines(user_id);

ALTER TABLE public.company_node_points_baselines ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.sync_node(
  p_node_identifier text,
  p_total_requests integer,
  p_platform text default null,
  p_opt_in boolean default false
)
returns public.nodes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_node public.nodes%rowtype;
  v_existing_node public.nodes%rowtype;
  v_company_id uuid;
begin
  if p_node_identifier is null or length(trim(p_node_identifier)) = 0 then
    raise exception 'node_identifier is required';
  end if;

  select *
    into v_existing_node
    from public.nodes
    where node_identifier = p_node_identifier;

  insert into public.nodes (
    node_identifier,
    total_requests,
    previous_requests,
    platform,
    opt_in,
    user_id
  )
  values (
    p_node_identifier,
    greatest(coalesce(p_total_requests, 0), 0),
    0,
    p_platform,
    coalesce(p_opt_in, false),
    v_user_id
  )
  on conflict (node_identifier) do update
    set
      total_requests = greatest(
        coalesce(public.nodes.total_requests, 0),
        greatest(coalesce(excluded.total_requests, 0), 0)
      ),
      platform = excluded.platform,
      opt_in = excluded.opt_in,
      user_id = case
        when public.nodes.user_id is null then excluded.user_id
        else public.nodes.user_id
      end
  returning * into v_node;

  if v_node.user_id is not null then
    select company_id
      into v_company_id
      from public.profiles
      where user_id = v_node.user_id;

    if v_company_id is not null
      and (
        v_existing_node.node_identifier is null
        or v_existing_node.user_id is null
      )
    then
      insert into public.company_node_points_baselines (
        company_id,
        user_id,
        node_identifier,
        baseline_total_requests
      )
      values (
        v_company_id,
        v_node.user_id,
        v_node.node_identifier,
        greatest(coalesce(v_node.total_requests, 0), 0)
      )
      on conflict (company_id, user_id, node_identifier) do nothing;
    end if;
  end if;

  return v_node;
end;
$$;

REVOKE ALL ON FUNCTION public.sync_node(text, integer, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.sync_node(text, integer, text, boolean) TO anon, authenticated;
