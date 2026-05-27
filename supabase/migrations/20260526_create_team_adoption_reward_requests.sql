create table if not exists public.team_adoption_reward_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  milestone_id text not null,
  threshold integer not null,
  provider text not null default 'Fahlo',
  animal text not null,
  reward_url text not null,
  partner_name text not null,
  partner_url text,
  active_desktop_members integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'fulfilled')),
  approved_at timestamptz,
  rejected_at timestamptz,
  fulfilled_at timestamptz,
  animal_name text,
  tracking_url text,
  certificate_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, milestone_id)
);

create index if not exists idx_team_adoption_reward_requests_team_id
  on public.team_adoption_reward_requests(team_id);

create index if not exists idx_team_adoption_reward_requests_status
  on public.team_adoption_reward_requests(status);

alter table public.team_adoption_reward_requests enable row level security;

comment on table public.team_adoption_reward_requests is 'Admin-approved tracked animal rewards unlocked by team active desktop milestones.';
comment on column public.team_adoption_reward_requests.status is 'pending means the team qualified but IdleForest has not approved purchase/fulfillment yet.';
