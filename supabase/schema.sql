create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_id text unique,
  email text unique,
  avatar_url text,
  role text not null default 'guest' check (role in ('guest','subscriber','admin','owner')),
  stripe_customer_id text,
  subscription_status text not null default 'inactive' check (subscription_status in ('active','inactive','past_due','canceled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text not null,
  video_url text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.videos enable row level security;

create policy "profiles_select_self"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_update_self"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_owner_manage_roles"
  on public.profiles
  for update
  using ((auth.jwt()->>'role')::text = 'owner')
  with check ((auth.jwt()->>'role')::text = 'owner');

create policy "profiles_insert_service"
  on public.profiles
  for insert
  with check (true);

create policy "videos_read_published"
  on public.videos
  for select
  using (is_published = true);

create policy "videos_admin_insert"
  on public.videos
  for insert
  with check (((auth.jwt()->>'role')::text) in ('admin','owner'));

create policy "videos_admin_update"
  on public.videos
  for update
  using (((auth.jwt()->>'role')::text) in ('admin','owner'))
  with check (((auth.jwt()->>'role')::text) in ('admin','owner'));

create view public.videos_public
with (security_barrier = true)
as
select
  v.id,
  v.title,
  v.description,
  v.thumbnail_url,
  case
    when ((auth.jwt()->>'role')::text) in ('subscriber','admin','owner') then v.video_url
    else null
  end as video_url,
  v.is_published,
  v.created_at,
  v.updated_at
from public.videos v
where v.is_published = true;

grant select on public.videos_public to anon, authenticated;
