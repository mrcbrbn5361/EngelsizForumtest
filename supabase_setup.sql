-- SUPABASE SETUP SCRIPT FOR ENGELSIZFORUM
-- This script sets up the necessary tables, policies, and triggers.

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'user',
  is_verified boolean default false,
  xp_points integer default 0,
  bio text,
  accessibility_settings jsonb default '{"highContrast": false, "bionicText": false, "dyslexicFont": false}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  parent_id uuid references public.categories(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TOPICS (DISCUSSIONS) TABLE
create table if not exists public.topics (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  is_pinned boolean default false,
  is_locked boolean default false,
  is_solved boolean default false,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. COMMENTS TABLE
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  topic_id uuid references public.topics(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  is_solution boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ROW LEVEL SECURITY (RLS) Policies

-- Profiles: Public can view, owner can update
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Categories: Public can view, only staff/admin can modify (simulated for now)
alter table public.categories enable row level security;
create policy "Categories are viewable by everyone." on public.categories for select using (true);

-- Topics: Public can view, auth users can create, owner can update/delete
alter table public.topics enable row level security;
create policy "Topics are viewable by everyone." on public.topics for select using (true);
create policy "Authenticated users can insert topics." on public.topics for insert with check (auth.role() = 'authenticated');
create policy "Users can update own topics." on public.topics for update using (auth.uid() = author_id);
create policy "Users can delete own topics." on public.topics for delete using (auth.uid() = author_id);

-- Comments: Public can view, auth users can create, owner can update/delete
alter table public.comments enable row level security;
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can insert comments." on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can update own comments." on public.comments for update using (auth.uid() = author_id);
create policy "Users can delete own comments." on public.comments for delete using (auth.uid() = author_id);

-- 6. FUNCTIONS & TRIGGERS

-- Automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. SEED DATA (Initial Categories)
insert into public.categories (name, slug, description, icon)
values 
  ('Erişilebilirlik', 'erisilebilirlik', 'Web ve fiziksel dünyada erişilebilirlik standartları.', 'accessibility'),
  ('Yardımcı Teknolojiler', 'yardimci-teknolojiler', 'Ekran okuyucular, bionik gözler ve diğer cihazlar.', 'cpu'),
  ('Engelli Hakları', 'engelli-haklari', 'Hukuki haklar ve güncel mevzuat tartışmaları.', 'shield'),
  ('Sosyal Yaşam', 'sosyal-yasam', 'Günlük hayat, seyahat ve etkinlik paylaşımları.', 'users'),
  ('İş & Eğitim', 'is-ve-egitim', 'Kariyer fırsatları ve eğitim kaynakları.', 'book')
on conflict (slug) do nothing;
