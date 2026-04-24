create table if not exists public.carbon_apps (
  slug text not null,
  app_name text not null,
  category text not null,
  co2_per_hour_grams numeric not null,
  avg_usage_hours_day text null,
  idleforest_pitch text null,
  human_equivalent_comparison text null,
  seo_content jsonb null,
  constraint carbon_apps_pkey primary key (slug)
) tablespace pg_default;
