create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null,
  photo_url text,
  mood text not null default 'community',
  created_at timestamptz not null default now()
);

create table if not exists public.post_votes (
  id uuid not null primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null check (vote_type in ('love','pass')),
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.comments (
  id uuid not null primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_votes_post_id on public.post_votes(post_id);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.comments enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Anyone can read posts" on public.posts
  for select using (true);

create policy "Users can insert own posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "Users can delete own posts" on public.posts
  for delete using (auth.uid() = user_id);

create policy "Anyone can read votes" on public.post_votes
  for select using (true);

create policy "Users can insert own votes" on public.post_votes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own votes" on public.post_votes
  for update using (auth.uid() = user_id);

create policy "Users can delete own votes" on public.post_votes
  for delete using (auth.uid() = user_id);

create policy "Anyone can read comments" on public.comments
  for select using (true);

create policy "Users can insert comments" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "Users can update own comments" on public.comments
  for update using (auth.uid() = user_id);

create policy "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

create policy "Users can upload to their own path" on storage.objects
  for insert with check (bucket_id = 'outfit-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can read outfit photos" on storage.objects
  for select using (bucket_id = 'outfit-photos');
