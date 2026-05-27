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
  v_membership_id uuid;
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
      select id
        into v_membership_id
        from public.company_memberships
        where company_id = v_company_id
          and user_id = v_node.user_id
          and left_at is null
        order by joined_at desc
        limit 1;

      if v_membership_id is not null then
        insert into public.company_membership_node_baselines (
        membership_id,
        node_identifier,
        baseline_total_requests
      )
      values (
        v_membership_id,
        v_node.node_identifier,
        greatest(coalesce(v_node.total_requests, 0), 0)
      )
        on conflict (membership_id, node_identifier) do nothing;
      end if;
    end if;
  end if;

  return v_node;
end;
$$;

REVOKE ALL ON FUNCTION public.sync_node(text, integer, text, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.sync_node(text, integer, text, boolean) TO anon, authenticated;
