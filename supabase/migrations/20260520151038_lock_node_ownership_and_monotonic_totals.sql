-- Make node sync server-authoritative:
-- - a node can be claimed only while unowned
-- - logging into another account cannot silently transfer ownership
-- - request totals are monotonic and never move backward
-- - explicit transfer intent is audit logged for a separate admin/support flow

create table if not exists public.node_transfer_requests (
  id uuid primary key default gen_random_uuid(),
  node_identifier text not null,
  from_user_id uuid,
  to_user_id uuid not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid
);

create index if not exists node_transfer_requests_node_identifier_idx
  on public.node_transfer_requests (node_identifier);

create index if not exists node_transfer_requests_to_user_status_idx
  on public.node_transfer_requests (to_user_id, status);

alter table public.node_transfer_requests enable row level security;

drop policy if exists "Users can view their node transfer requests" on public.node_transfer_requests;
create policy "Users can view their node transfer requests"
  on public.node_transfer_requests
  for select
  using (auth.uid() = to_user_id or auth.uid() = from_user_id);

drop policy if exists "Users can request node transfers to themselves" on public.node_transfer_requests;
create policy "Users can request node transfers to themselves"
  on public.node_transfer_requests
  for insert
  with check (auth.uid() = to_user_id);

create or replace function public.sync_node(
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
begin
  if p_node_identifier is null or length(trim(p_node_identifier)) = 0 then
    raise exception 'node_identifier is required';
  end if;

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

  return v_node;
end;
$$;

revoke all on function public.sync_node(text, integer, text, boolean) from public;
grant execute on function public.sync_node(text, integer, text, boolean) to anon, authenticated;

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

-- Existing negative daily stats are invalid contribution records. Clamp them once
-- so historical profile/team views and leaderboards do not carry negative credit.
update public.user_daily_stats
  set points_gained_that_day = 0
  where points_gained_that_day < 0;

update public.team_daily_stats
  set points_gained_that_day = 0
  where points_gained_that_day < 0;
