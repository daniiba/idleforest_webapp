-- Complete the node-transfer flow:
-- - transfer requests are idempotent per target account while pending
-- - support/admin can approve a pending request through service-role execution
-- - approval only moves ownership; it does not rewrite historical daily stats

create unique index if not exists node_transfer_requests_one_pending_per_target_idx
  on public.node_transfer_requests (node_identifier, to_user_id)
  where status = 'pending';

create or replace function public.request_node_transfer(
  p_node_identifier text,
  p_reason text default null
)
returns public.node_transfer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owner uuid;
  v_request public.node_transfer_requests%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication is required';
  end if;

  if p_node_identifier is null or length(trim(p_node_identifier)) = 0 then
    raise exception 'node_identifier is required';
  end if;

  select user_id
    into v_owner
    from public.nodes
    where node_identifier = p_node_identifier;

  if v_owner is null then
    raise exception 'node is not claimed';
  end if;

  if v_owner = v_user_id then
    raise exception 'node is already linked to this account';
  end if;

  select *
    into v_request
    from public.node_transfer_requests
    where node_identifier = p_node_identifier
      and to_user_id = v_user_id
      and status = 'pending'
    order by created_at desc
    limit 1;

  if found then
    return v_request;
  end if;

  insert into public.node_transfer_requests (
    node_identifier,
    from_user_id,
    to_user_id,
    reason
  )
  values (
    p_node_identifier,
    v_owner,
    v_user_id,
    p_reason
  )
  returning * into v_request;

  return v_request;
end;
$$;

revoke all on function public.request_node_transfer(text, text) from public;
grant execute on function public.request_node_transfer(text, text) to authenticated;

create or replace function public.approve_node_transfer(
  p_request_id uuid
)
returns public.node_transfer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.node_transfer_requests%rowtype;
begin
  select *
    into v_request
    from public.node_transfer_requests
    where id = p_request_id
    for update;

  if not found then
    raise exception 'transfer request not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'transfer request is not pending';
  end if;

  update public.nodes
    set user_id = v_request.to_user_id
    where node_identifier = v_request.node_identifier
      and user_id = v_request.from_user_id;

  if not found then
    raise exception 'node ownership changed; transfer request is stale';
  end if;

  update public.node_transfer_requests
    set
      status = 'approved',
      resolved_at = now(),
      resolved_by = auth.uid()
    where id = p_request_id
    returning * into v_request;

  update public.node_transfer_requests
    set
      status = 'cancelled',
      resolved_at = now(),
      resolved_by = auth.uid()
    where node_identifier = v_request.node_identifier
      and status = 'pending'
      and id <> v_request.id;

  return v_request;
end;
$$;

revoke all on function public.approve_node_transfer(uuid) from public;
grant execute on function public.approve_node_transfer(uuid) to service_role;

create or replace function public.reject_node_transfer(
  p_request_id uuid
)
returns public.node_transfer_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.node_transfer_requests%rowtype;
begin
  update public.node_transfer_requests
    set
      status = 'rejected',
      resolved_at = now(),
      resolved_by = auth.uid()
    where id = p_request_id
      and status = 'pending'
    returning * into v_request;

  if not found then
    raise exception 'pending transfer request not found';
  end if;

  return v_request;
end;
$$;

revoke all on function public.reject_node_transfer(uuid) from public;
grant execute on function public.reject_node_transfer(uuid) to service_role;
