-- 1. TAGS TABLE
create table if not exists public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TOPIC TAGS
create table if not exists public.topic_tags (
  topic_id uuid references public.topics(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (topic_id, tag_id)
);

-- 3. REACTIONS
create table if not exists public.reactions (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references public.topics(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text not null check (reaction_type in ('like', 'dislike', 'heart', 'smile', 'sad')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure comment_id column exists on reactions table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reactions' AND column_name='comment_id') THEN
    ALTER TABLE public.reactions ADD COLUMN comment_id uuid references public.comments(id) on delete cascade;
  END IF;
END $$;

-- Reactions constraint (add safely)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'one_reaction_per_user_topic') THEN
    ALTER TABLE public.reactions ADD CONSTRAINT one_reaction_per_user_topic UNIQUE(user_id, topic_id, reaction_type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'one_reaction_per_user_comment') THEN
    ALTER TABLE public.reactions ADD CONSTRAINT one_reaction_per_user_comment UNIQUE(user_id, comment_id, reaction_type);
  END IF;
END $$;


-- 4. REPORTS
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  topic_id uuid references public.topics(id) on delete cascade,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure comment_id column exists on reports table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='reports' AND column_name='comment_id') THEN
    ALTER TABLE public.reports ADD COLUMN comment_id uuid references public.comments(id) on delete cascade;
  END IF;
END $$;


-- 5. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('reply', 'mention', 'reaction', 'system')),
  topic_id uuid references public.topics(id) on delete cascade,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure comment_id column exists on notifications table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='comment_id') THEN
    ALTER TABLE public.notifications ADD COLUMN comment_id uuid references public.comments(id) on delete cascade;
  END IF;
END $$;

-- RLS

-- Tags: public read, auth create
alter table public.tags enable row level security;
drop policy if exists "Tags viewable by everyone" on public.tags;
create policy "Tags viewable by everyone" on public.tags for select using (true);
drop policy if exists "Auth users insert tags" on public.tags;
create policy "Auth users insert tags" on public.tags for insert with check (auth.role() = 'authenticated');

-- Topic Tags: public read, owner of topic can insert/delete
alter table public.topic_tags enable row level security;
drop policy if exists "Topic tags viewable by everyone" on public.topic_tags;
create policy "Topic tags viewable by everyone" on public.topic_tags for select using (true);
drop policy if exists "Topic owners can manage topic tags" on public.topic_tags;
create policy "Topic owners can manage topic tags" on public.topic_tags for all using (
  exists (select 1 from public.topics where id = topic_id and author_id = auth.uid())
);

-- Reactions
alter table public.reactions enable row level security;
drop policy if exists "Reactions viewable by everyone" on public.reactions;
create policy "Reactions viewable by everyone" on public.reactions for select using (true);
drop policy if exists "Auth users insert reactions" on public.reactions;
create policy "Auth users insert reactions" on public.reactions for insert with check (auth.uid() = user_id);
drop policy if exists "Users delete own reactions" on public.reactions;
create policy "Users delete own reactions" on public.reactions for delete using (auth.uid() = user_id);

-- Reports
alter table public.reports enable row level security;
drop policy if exists "Auth users can insert reports" on public.reports;
create policy "Auth users can insert reports" on public.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists "Users view own reports" on public.reports;
create policy "Users view own reports" on public.reports for select using (auth.uid() = reporter_id);

-- Notifications
alter table public.notifications enable row level security;
drop policy if exists "Users view own notifications" on public.notifications;
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

