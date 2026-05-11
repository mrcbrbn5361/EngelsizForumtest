-- Supabase Database Setup for EngelsizForum
-- Run this in your Supabase SQL Editor

-- 1. Profiles Table (with roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  accessibility_prefs JSONB DEFAULT '{"fontSize": "md", "highContrast": false, "dyslexicFont": false, "reducedMotion": false}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to check if user is staff (admin or moderator) without recursion
CREATE OR REPLACE FUNCTION public.check_is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies - Radical Reset to stop recursion
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Explicitly drop known legacy names just in case
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Staff can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_v1_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_v1_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_v1_insert" ON public.profiles;

-- Final, ultra-simple policies for profiles
-- FOR SELECT: Anyone can see any profile (standard for forums)
CREATE POLICY "profiles_v2_select" 
ON public.profiles FOR SELECT 
USING (true);

-- FOR UPDATE: Only user can update their own profile
CREATE POLICY "profiles_v2_update" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- FOR INSERT: Only user can insert their own profile
CREATE POLICY "profiles_v2_insert" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- FOR DELETE: Only the user themselves (or admins, but keeping it simple for now)
CREATE POLICY "profiles_v2_delete"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- 2. Categories Table (with parent_id for hierarchy)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Consolidate drops to prevent errors
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
    DROP POLICY IF EXISTS "categories_v1_select" ON public.categories;
END $$;

CREATE POLICY "categories_v1_select" ON public.categories FOR SELECT USING (true);

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  author_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_solved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author_id ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_is_pinned ON public.topics(is_pinned) WHERE is_pinned = true;

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id),
  author_id UUID REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);

-- 3. Topics Policies
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Anyone can view topics" ON public.topics;
    DROP POLICY IF EXISTS "topics_v1_select" ON public.topics;
    DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.topics;
    DROP POLICY IF EXISTS "topics_v1_insert" ON public.topics;
    DROP POLICY IF EXISTS "topics_v1_update" ON public.topics;
    DROP POLICY IF EXISTS "topics_v1_delete" ON public.topics;
END $$;

CREATE POLICY "topics_v1_select" ON public.topics FOR SELECT USING (true);
CREATE POLICY "topics_v1_insert" ON public.topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "topics_v1_update" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR public.check_is_staff());
CREATE POLICY "topics_v1_delete" ON public.topics FOR DELETE USING (public.check_is_staff());

-- 4. Comments Policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
    DROP POLICY IF EXISTS "comments_v1_select" ON public.comments;
    DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
    DROP POLICY IF EXISTS "comments_v1_insert" ON public.comments;
    DROP POLICY IF EXISTS "comments_v1_update" ON public.comments;
    DROP POLICY IF EXISTS "comments_v1_delete" ON public.comments;
END $$;

CREATE POLICY "comments_v1_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_v1_insert" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "comments_v1_update" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.check_is_staff());
CREATE POLICY "comments_v1_delete" ON public.comments FOR DELETE USING (public.check_is_staff());

-- 5. Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID REFERENCES public.profiles(id),
  badge_id UUID REFERENCES public.badges(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- 7. Reactions Table
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Trigger for XP calculation
CREATE OR REPLACE FUNCTION public.update_user_xp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET xp = xp + 10
  WHERE id = NEW.author_id;

  -- Level up logic (simple)
  UPDATE public.profiles
  SET level = (xp / 100) + 1
  WHERE id = NEW.author_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_xp();

-- 10. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 11. Custom Role Assignments
UPDATE public.profiles 
SET role = 'moderator' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('brtapardi@gmail.com', 'yigitfirat3405@gmail.com')
);

