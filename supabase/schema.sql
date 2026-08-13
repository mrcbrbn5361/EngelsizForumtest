-- ==============================================================================
-- ENGELSİZFORUM - COMPREHENSIVE ALL-IN-ONE SUPABASE DATABASE SCHEMA & INITIAL SEED
-- Features: 
--  - WCAG 2.1 AAA & Accessibility Preferences
--  - Multi-Role Support (Admin, Moderator, Member, System)
--  - 5 Main Categories + 20 Subcategories Hierarchical Structure
--  - Topics, Comments, Reactions, Bookmarks, Tags, Communities
--  - Visitor Analytics, Notifications, Direct Messaging (Conversations)
--  - Gamification (XP, Levels, Badges, Reputation)
--  - Mastodon / ActivityPub API Integration Helpers
--  - Complete RLS Policies for Security
--  - Automatic Admin & Moderator Privilege Assignments
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. HELPER FUNCTIONS
-- ==============================================================================

-- Staff Check Helper Function
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'system')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic updated_at Handler
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. PROFILES TABLE & AUTH TRIGGERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'system')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 100,
  reputation_points INTEGER DEFAULT 10,
  is_verified BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  accessibility_prefs JSONB DEFAULT '{
    "fontSize": "md",
    "highContrast": false,
    "dyslexicFont": false,
    "reducedMotion": false,
    "bionicReading": false,
    "focusMode": false,
    "voiceMode": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist even if profiles table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reputation_points INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accessibility_prefs JSONB DEFAULT '{
  "fontSize": "md",
  "highContrast": false,
  "dyslexicFont": false,
  "reducedMotion": false,
  "bionicReading": false,
  "focusMode": false,
  "voiceMode": false
}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen);

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Automatic Profile Creation Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    full_name,
    avatar_url, 
    role,
    level,
    xp
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(md5(random()::text) FROM 1 FOR 4)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'full_name', 
      'Engelsiz Üye'
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id::text
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    1,
    100
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update last seen timestamp function
CREATE OR REPLACE FUNCTION public.update_user_last_seen(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NOW(),
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. CATEGORIES TABLE (5 MAIN CATEGORIES + 20 SUBCATEGORIES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE DEFAULT NULL,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'FolderTree',
  icon_name TEXT DEFAULT 'FolderTree',
  color TEXT DEFAULT '#2563EB',
  color_code TEXT DEFAULT '#2563EB',
  is_main BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'FolderTree';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'FolderTree';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#2563EB';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color_code TEXT DEFAULT '#2563EB';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

DROP TRIGGER IF EXISTS tr_categories_updated_at ON public.categories;
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. TOPICS / THREADS TABLE
-- ==============================================================================

-- Safely cleanup 'topics', 'comments', 'threads', 'posts' regardless of whether they exist as TABLES or VIEWS
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  -- Drop 'threads' and 'posts' if they exist as either a table or a view so they can be recreated as compatibility views
  FOR r IN (
    SELECT c.relname, c.relkind 
    FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname IN ('threads', 'posts')
  ) LOOP
    IF r.relkind = 'v' THEN
      EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.relname) || ' CASCADE';
    ELSIF r.relkind = 'r' THEN
      EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.relname) || ' CASCADE';
    END IF;
  END LOOP;

  -- Drop 'topics' or 'comments' ONLY if they were accidentally created as views in a previous run
  FOR r IN (
    SELECT c.relname, c.relkind 
    FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname IN ('topics', 'comments') AND c.relkind = 'v'
  ) LOOP
    EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.relname) || ' CASCADE';
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_solved BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created ON public.topics(created_at DESC);

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'topics' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE public.topics ADD COLUMN search_vector TSVECTOR 
      GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_topics_search ON public.topics USING gin(search_vector);

DROP TRIGGER IF EXISTS tr_topics_updated_at ON public.topics;
CREATE TRIGGER tr_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Alias view for threads compatibility
CREATE OR REPLACE VIEW public.threads AS 
SELECT 
  id, category_id, author_id, title, slug, content, 
  is_pinned, is_locked, is_solved, views_count, 
  comments_count AS replies_count, likes_count, tags, 
  created_at, updated_at, last_activity_at
FROM public.topics;

-- ==============================================================================
-- 6. COMMENTS / POSTS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Alias view for posts compatibility
CREATE OR REPLACE VIEW public.posts AS
SELECT 
  id, topic_id AS thread_id, author_id, content, 
  is_solution, likes_count, parent_id, created_at, updated_at
FROM public.comments;

CREATE INDEX IF NOT EXISTS idx_comments_topic ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);

DROP TRIGGER IF EXISTS tr_comments_updated_at ON public.comments;
CREATE TRIGGER tr_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 7. REACTIONS & LIKES TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_reaction_per_user_topic UNIQUE(user_id, topic_id, reaction_type)
);

ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'like';
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sync topic likes trigger
CREATE OR REPLACE FUNCTION public.sync_topic_likes() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.topic_id IS NOT NULL THEN
      UPDATE public.topics SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.topic_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.topic_id IS NOT NULL THEN
      UPDATE public.topics SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.topic_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_change ON public.reactions;
CREATE TRIGGER on_reaction_change 
AFTER INSERT OR DELETE ON public.reactions 
FOR EACH ROW EXECUTE FUNCTION public.sync_topic_likes();

-- ==============================================================================
-- 8. BOOKMARKS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE;
ALTER TABLE public.bookmarks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 9. COMMUNITIES & COMMUNITY MEMBERS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  cover_url TEXT,
  avatar_url TEXT,
  members_count INTEGER DEFAULT 1,
  topics_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS members_count INTEGER DEFAULT 1;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS topics_count INTEGER DEFAULT 0;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.community_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 10. TAGS & TOPIC TAGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.topic_tags (
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (topic_id, tag_id)
);

ALTER TABLE public.topic_tags ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE;
ALTER TABLE public.topic_tags ADD COLUMN IF NOT EXISTS tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE;

-- ==============================================================================
-- 11. BADGES & GAMIFICATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS criteria JSONB;
ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.user_badges ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_badges ADD COLUMN IF NOT EXISTS badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE;
ALTER TABLE public.user_badges ADD COLUMN IF NOT EXISTS awarded_at TIMESTAMPTZ DEFAULT NOW();

-- XP Increment Function
CREATE OR REPLACE FUNCTION public.increment_user_xp(user_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  SELECT COALESCE(xp, 0) INTO current_xp FROM public.profiles WHERE id = user_id;
  new_xp := current_xp + xp_amount;
  new_level := 1 + (new_xp / 200);
  
  UPDATE public.profiles
  SET xp = new_xp,
      level = new_level,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_user_xp(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_xp(UUID, INTEGER) TO service_role;

-- ==============================================================================
-- 12. FOLLOWS & DIRECT MESSAGING (CONVERSATIONS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.follows ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_members ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.conversation_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.conversation_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 13. VISITORS & ANALYTICS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  path TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON public.visitors(last_seen DESC);

-- ==============================================================================
-- 14. REPORTS, NOTIFICATIONS & MASTODON OAUTH
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'like', 'solution', 'reaction', 'system')),
  title TEXT,
  message TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);

CREATE TABLE IF NOT EXISTS public.mastodon_apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  redirect_uris TEXT NOT NULL,
  scopes TEXT DEFAULT 'read write follow',
  website TEXT,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS redirect_uris TEXT;
ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS scopes TEXT DEFAULT 'read write follow';
ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS client_secret TEXT;
ALTER TABLE public.mastodon_apps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.oauth_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS redirect_uri TEXT;
ALTER TABLE public.oauth_codes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_type TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS target_id UUID;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================================================================
-- 15. COUNTERS & RPC PROCEDURES
-- ==============================================================================

-- Increment topic view count
CREATE OR REPLACE FUNCTION public.increment_views(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_thread_views(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments_count(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET comments_count = COALESCE(comments_count, 0) + 1,
      last_activity_at = NOW(),
      updated_at = NOW()
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic topic comment counter & XP reward trigger
CREATE OR REPLACE FUNCTION public.handle_comment_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.topics 
    SET comments_count = COALESCE(comments_count, 0) + 1,
        last_activity_at = NOW() 
    WHERE id = NEW.topic_id;
    
    IF NEW.author_id IS NOT NULL THEN
      PERFORM public.increment_user_xp(NEW.author_id, 15);
    END IF;
    
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.topics 
    SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) 
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_comment_changes ON public.comments;
CREATE TRIGGER trg_comment_changes
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_comment_changes();

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastodon_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;

-- Dynamic Cleanup of Old RLS Policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
  END LOOP;
END $$;

-- Clean Unified RLS Policies
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile or staff" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_staff());

CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.is_staff());

CREATE POLICY "Topics viewable by everyone" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users insert topics" ON public.topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors or staff update topics" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
CREATE POLICY "Authors or staff delete topics" ON public.topics FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users insert comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors or staff update comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
CREATE POLICY "Authors or staff delete comments" ON public.comments FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

CREATE POLICY "Reactions viewable by everyone" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users manage own reactions" ON public.reactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Bookmarks viewable by owner" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Communities viewable by everyone" ON public.communities FOR SELECT USING (true);
CREATE POLICY "Auth users create communities" ON public.communities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Creators or staff manage communities" ON public.communities FOR ALL USING (auth.uid() = creator_id OR public.is_staff());

CREATE POLICY "Community members viewable by everyone" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users manage own community membership" ON public.community_members FOR ALL USING (auth.uid() = user_id OR public.is_staff());

CREATE POLICY "Tags viewable by everyone" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Auth users insert tags" ON public.tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Topic tags viewable by everyone" ON public.topic_tags FOR SELECT USING (true);
CREATE POLICY "Topic authors manage topic tags" ON public.topic_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.topics WHERE id = topic_id AND (author_id = auth.uid() OR public.is_staff()))
);

CREATE POLICY "Badges viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "User badges viewable by everyone" ON public.user_badges FOR SELECT USING (true);

CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Conversation members view own conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
CREATE POLICY "Conversation members manage memberships" ON public.conversation_members FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Message members view messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Message senders insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Visitors insert & select public" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Visitors insert public" ON public.visitors FOR INSERT WITH CHECK (true);

CREATE POLICY "Reports insert by reporter" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reports viewable by reporter or staff" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR public.is_staff());

CREATE POLICY "Notifications viewable by owner" ON public.notifications FOR SELECT USING (
  auth.uid() = recipient_id OR auth.uid() = user_id
);
CREATE POLICY "Notifications update by owner" ON public.notifications FOR UPDATE USING (
  auth.uid() = recipient_id OR auth.uid() = user_id
);

CREATE POLICY "Mastodon apps public view" ON public.mastodon_apps FOR SELECT USING (true);
CREATE POLICY "OAuth codes managed by user" ON public.oauth_codes FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- 17. SEED DATA - 5 MAIN CATEGORIES & 20 SUBCATEGORIES
-- ==============================================================================

TRUNCATE TABLE public.categories CASCADE;

-- ANA KATEGORİ 1: Sağlık & Erişilebilirlik
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('10000000-0000-0000-0000-000000000001', NULL, 'Sağlık & Erişilebilirlik', 'Sağlık & Erişilebilirlik', 'saglik-ve-erisilebilirlik', 'Medikal süreçler, cihazlar, dijital ve fiziksel mimari erişilebilirlik çözümleri.', 'HeartPulse', 'HeartPulse', '#E11D48', '#E11D48', true, 10, 10);

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Medikal & Tedavi Rehberi', 'Medikal & Tedavi Rehberi', 'medikal-tedavi-rehberi', 'Sağlık kurulu raporları, doktor deneyimleri ve tedavi rehberleri.', 'Stethoscope', 'Stethoscope', '#E11D48', '#E11D48', false, 11, 11),
('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Medikal Cihazlar & Protez-Ortez', 'Medikal Cihazlar & Protez-Ortez', 'medikal-cihazlar-protez', 'Tekerlekli sandalye, işitme cihazı, protez ve SGK geri ödeme süreçleri.', 'Shield', 'Shield', '#E11D48', '#E11D48', false, 12, 12),
('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Dijital Erişilebilirlik & Yazılımlar', 'Dijital Erişilebilirlik & Yazılımlar', 'dijital-erisilebilirlik-yazilim', 'WCAG standartları, ekran okuyucu uyumluluğu ve erişilebilir mobil uygulamalar.', 'Code', 'Code', '#E11D48', '#E11D48', false, 13, 13),
('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Fiziksel Erişilebilirlik & Mimari', 'Fiziksel Erişilebilirlik & Mimari', 'fiziksel-erisilebilirlik-mimari', 'Rampalar, asansörler, sarı çizgiler ve kamusal alan mimari standartları.', 'Eye', 'Eye', '#E11D48', '#E11D48', false, 14, 14);

-- ANA KATEGORİ 2: Yasal Haklar & Mevzuat
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('20000000-0000-0000-0000-000000000001', NULL, 'Yasal Haklar & Mevzuat', 'Yasal Haklar & Mevzuat', 'yasal-haklar-ve-mevzuat', 'ÖTV muafiyeti, engelli maaşları, erken emeklilik ve hukuki danışmanlık.', 'Scale', 'Scale', '#2563EB', '#2563EB', true, 20, 20);

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Engelli Emekliliği & ÖTV-KDV Muafiyeti', 'Engelli Emekliliği & ÖTV-KDV Muafiyeti', 'engelli-emekliligi-otv-muafiyeti', '2026 ÖTV araç üst sınırı, vergi indirimi ve emeklilik prim gün hesaplama.', 'Car', 'Car', '#2563EB', '#2563EB', false, 21, 21),
('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'İstihdam & EKPSS Hazırlık', 'İstihdam & EKPSS Hazırlık', 'istihdam-ekpss-hazirlik', 'EKPSS kılavuzları, sınav soruları, memur kontenjanları ve kura çekimleri.', 'GraduationCap', 'GraduationCap', '#2563EB', '#2563EB', false, 22, 22),
('20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Evde Bakım & Engelli Maaşları', 'Evde Bakım & Engelli Maaşları', 'evde-bakim-engelli-maaslari', '2022 engelli yardımları, muhtaçlık aylığı, kişi başı gelir kriterleri.', 'HeartPulse', 'HeartPulse', '#2563EB', '#2563EB', false, 23, 23),
('20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'Hukuki Danışmanlık & Hak Arama', 'Hukuki Danışmanlık & Hak Arama', 'hukuki-danismanlik-hak-arama', 'Emsal mahkeme kararları, idari itiraz dilekçeleri ve kanun maddeleri.', 'BookOpen', 'BookOpen', '#2563EB', '#2563EB', false, 24, 24);

-- ANA KATEGORİ 3: Eğitim & Kariyer
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('30000000-0000-0000-0000-000000000001', NULL, 'Eğitim & Kariyer', 'Eğitim & Kariyer', 'egitim-ve-kariyer', 'Özel eğitim merkezleri, akademik burslar, uzaktan çalışma ve yetenek geliştirme.', 'GraduationCap', 'GraduationCap', '#7C3AED', '#7C3AED', true, 30, 30);

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Özel Eğitim & Rehabilitasyon', 'Özel Eğitim & Rehabilitasyon', 'ozel-egitim-rehabilitasyon', 'RAM raporları, bireysel eğitim planları (BEP) ve rehabilitasyon merkezi seçimi.', 'BookOpen', 'BookOpen', '#7C3AED', '#7C3AED', false, 31, 31),
('30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Üniversite & Akademik Yaşam', 'Üniversite & Akademik Yaşam', 'universite-akademik-yasam', 'YÖK engelli öğrenci birimleri, kampüs erişilebilirliği ve burs imkanları.', 'GraduationCap', 'GraduationCap', '#7C3AED', '#7C3AED', false, 32, 32),
('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'İş İlanları & İş Deneyimleri', 'İş İlanları & İş Deneyimleri', 'is-ilanlari-is-deneyimleri', 'Engelli personel ilanları, evden/uzaktan çalışma fırsatları ve mülakat tüyoları.', 'Briefcase', 'Briefcase', '#7C3AED', '#7C3AED', false, 33, 33),
('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'Beceri Geliştirme & Kurslar', 'Beceri Geliştirme & Kurslar', 'beceri-gelistirme-kurslar', 'Yazılım, grafik, içerik üreticiliği ve İŞKUR meslek edindirme kursları.', 'Cpu', 'Cpu', '#7C3AED', '#7C3AED', false, 34, 34);

-- ANA KATEGORİ 4: Sosyal Yaşam & Yaşam Kalitesi
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('40000000-0000-0000-0000-000000000001', NULL, 'Sosyal Yaşam & Yaşam Kalitesi', 'Sosyal Yaşam & Yaşam Kalitesi', 'sosyal-yasam-kalitesi', 'Kültür, spor, seyahat, deneyim paylaşımı ve yardımlaşma kulüpleri.', 'Smile', 'Smile', '#059669', '#059669', true, 40, 40);

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Spor, Sanat & Hobiler', 'Spor, Sanat & Hobiler', 'spor-sanat-hobiler', 'Ampute futbol, tekerlekli sandalye basketbol, tiyatro ve hobi grupları.', 'Smile', 'Smile', '#059669', '#059669', false, 41, 41),
('40000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Engelsiz Turizm & Gezi', 'Engelsiz Turizm & Gezi', 'engelsiz-turizm-gezi', 'Erişilebilir oteller, engelsiz plajlar, seyahat tavsiyeleri ve rota önerileri.', 'Car', 'Car', '#059669', '#059669', false, 42, 42),
('40000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'Kişisel Hikayeler & Deneyimler', 'Kişisel Hikayeler & Deneyimler', 'kisisel-hikayeler-deneyimler', 'Başarı hikayeleri, ilham veren yaşam tecrübeleri ve serbest sohbet.', 'User', 'User', '#059669', '#059669', false, 43, 43),
('40000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'İkinci El Cihaz & Ekipman Paylaşımı', 'İkinci El Cihaz & Ekipman Paylaşımı', 'ikinci-el-cihaz-ekipman', 'Temiz kullanılmış sandalye, hasta yatağı, işitme cihazı devir ve bağışları.', 'Shield', 'Shield', '#059669', '#059669', false, 44, 44);

-- ANA KATEGORİ 5: Teknoloji & Yapay Zeka
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('50000000-0000-0000-0000-000000000001', NULL, 'Teknoloji & Yapay Zeka', 'Teknoloji & Yapay Zeka', 'teknoloji-ve-yapay-zeka', 'Ekran okuyucular, sesli asistanlar, yapay zeka betimleme ve akıllı ev donanımları.', 'Cpu', 'Cpu', '#D97706', '#D97706', true, 50, 50);

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Ekran Okuyucular & Sesli Asistanlar', 'Ekran Okuyucular & Sesli Asistanlar', 'ekran-okuyucular-sesli-asistanlar', 'NVDA, JAWS, TalkBack, VoiceOver rehberleri ve kısayol ipuçları.', 'Volume2', 'Volume2', '#D97706', '#D97706', false, 51, 51),
('50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Akıllı Ev & Yardımcı Donanımlar', 'Akıllı Ev & Yardımcı Donanımlar', 'akilli-ev-yardimci-donanimlar', 'Sesle kumanda edilen prizler, akıllı kilitler ve ortam sensörleri.', 'Settings', 'Settings', '#D97706', '#D97706', false, 52, 52),
('50000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'Yapay Zeka & Betimleme Araçları', 'Yapay Zeka & Betimleme Araçları', 'yapay-zeka-betimleme-araclari', 'Gemini Vision, Be My AI, Yeterly AI ve yapay zeka ile görsel okuma.', 'Sparkles', 'Sparkles', '#D97706', '#D97706', false, 53, 53),
('50000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', 'Mobil Uygulamalar & İpuçları', 'Mobil Uygulamalar & İpuçları', 'mobil-uygulamalar-ipuclari', 'iOS ve Android erişilebilirlik ayarları, navigasyon uygulamaları.', 'Cpu', 'Cpu', '#D97706', '#D97706', false, 54, 54);

-- ==============================================================================
-- 18. INITIAL SAMPLE DISCUSSIONS (TOPICS SEED)
-- ==============================================================================

INSERT INTO public.topics (id, category_id, title, slug, content, is_pinned, is_solved, views_count, comments_count, likes_count, tags)
VALUES 
(
  '90000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '2026 Yılı ÖTV Muafiyetli Araç Üst Sınırı ve Bayi Deneyimleri',
  '2026-yili-otv-muafiyetli-arac-ust-siniri',
  'Değerli üyelerimiz, 2026 yılı yeniden değerleme oranı kapsamında ÖTV muafiyetli araç üst sınırı güncellenmiştir. Rapor oranı %90 üzeri olan veya tertibatlı araç alacak arkadaşlarımızın bayi süreçleri ve fatura limitleri hakkındaki sorularını bu başlık altında topluyoruz.',
  true,
  true,
  1420,
  38,
  95,
  ARRAY['ÖTV', 'Araç Alımı', 'Mevzuat', '2026']
),
(
  '90000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000002',
  'NVDA ve TalkBack İçin 2026 En İyi Erişilebilirlik Eklentileri',
  'nvda-ve-talkback-icin-2026-en-iyi-eklentiler',
  'Görme engelli kullanıcılarımız için bilgisayar ve akıllı telefonlarda hayatı kolaylaştıran, yapay zeka destekli ve sesli betimleme odaklı eklenti tavsiyelerinizi bu başlık altında paylaşabilirsiniz.',
  true,
  false,
  980,
  24,
  62,
  ARRAY['NVDA', 'TalkBack', 'Ekran Okuyucu', 'AI']
),
(
  '90000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000003',
  'EKPSS 2026 Tercih Kılavuzu ve Nitelik Kodları Açıklandı mı?',
  'ekpss-2026-tercih-kilavuzu-ve-nitelik-kodlari',
  'ÖSYM ve Aile ve Sosyal Hizmetler Bakanlığı tarafından EKPSS kura ve memur atamalarıyla ilgili yayımlanacak yeni kontenjanlar ile ilgili detaylı bilgileri takip ediyoruz.',
  false,
  false,
  750,
  19,
  44,
  ARRAY['EKPSS', 'ÖSYM', 'Atama', 'Memur']
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 19. ADMIN & MODERATOR PRIVILEGES ASSIGNMENT
-- ==============================================================================

-- Sync profiles from existing auth users if needed
INSERT INTO public.profiles (id, username, full_name, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1) || '_' || SUBSTRING(md5(random()::text) FROM 1 FOR 4)),
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Assign Admin & Moderator Roles
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('miracbirben@gmail.com')
);

UPDATE public.profiles 
SET role = 'moderator' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('brtapardi@gmail.com', 'yigitfirat3405@gmail.com')
);

-- Realtime Publications Registration
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.topics; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.comments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN OTHERS THEN NULL; END $$;

COMMENT ON TABLE public.profiles IS 'EngelsizForum Profiles with Admin/Mod Roles and WCAG Accessibility Preferences';
COMMENT ON TABLE public.categories IS 'EngelsizForum Categories (5 Main Categories & 20 Subcategories)';
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics & Discussions';
