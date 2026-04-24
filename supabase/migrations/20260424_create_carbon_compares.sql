create table if not exists public.carbon_compares (
  slug text not null,
  content jsonb not null,
  constraint carbon_compares_pkey primary key (slug)
) tablespace pg_default;
