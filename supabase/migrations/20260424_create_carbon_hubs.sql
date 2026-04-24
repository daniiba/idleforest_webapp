create table if not exists public.carbon_hubs (
  slug text not null,
  content jsonb not null,
  constraint carbon_hubs_pkey primary key (slug)
) tablespace pg_default;
