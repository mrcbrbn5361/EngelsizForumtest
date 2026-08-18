-- ==============================================================================
-- ENGELSİZFORUM - PHASE 2 CORE DATA LAYER & RLS HARDENING MIGRATION
-- File: supabase/migrations/20260818000000_phase2_core_hardening.sql
-- Description: Non-destructive hardening for topics, comments, reactions, bookmarks,
--              reports, notifications, triggers, RPCs, and RLS policies.
-- ==============================================================================

-- 1. EXTENSIONS & ESSENTIAL HELPERS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Helper: Check if current authenticated user has staff privileges (admin or moderator)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon;

-- 2. CANONICAL TABLES ENHANCEMENTS (IDEMPOTENT)

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'system')),
  level INT DEFAULT 1,
  xp INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  accessibility_prefs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS level INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS accessibility_prefs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Topics (Canonical)
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  solution_comment_id UUID,
  solved_at TIMESTAMPTZ,
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_solved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS solution_comment_id UUID DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS solved_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS views_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Comments (Canonical)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Foreign key for solution_comment_id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_topics_solution_comment'
  ) THEN
    ALTER TABLE public.topics
      ADD CONSTRAINT fk_topics_solution_comment
      FOREIGN KEY (solution_comment_id)
      REFERENCES public.comments(id)
      ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Reactions (Canonical)
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  emoji TEXT DEFAULT '👍',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_topic_reaction'
  ) THEN
    ALTER TABLE public.reactions
      ADD CONSTRAINT unique_user_topic_reaction UNIQUE (user_id, topic_id);
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Bookmarks (Canonical)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_topic_bookmark_key UNIQUE (user_id, topic_id)
);

-- Reports (Canonical)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned', 'resolved')),
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRIGGERS: AUTOMATIC COUNTERS AND ACTIVITY TRACKING

-- Auto-update comments count and last_activity_at on topics
CREATE OR REPLACE FUNCTION public.sync_topic_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.topics
    SET comments_count = (SELECT count(*) FROM public.comments WHERE topic_id = NEW.topic_id),
        last_activity_at = NOW()
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.topics
    SET comments_count = (SELECT count(*) FROM public.comments WHERE topic_id = OLD.topic_id)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_topic_comment_stats ON public.comments;
CREATE TRIGGER trg_sync_topic_comment_stats
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.sync_topic_comment_stats();

-- Auto-update likes count on topics
CREATE OR REPLACE FUNCTION public.sync_topic_reaction_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.topic_id IS NOT NULL THEN
    UPDATE public.topics
    SET likes_count = (SELECT count(*) FROM public.reactions WHERE topic_id = NEW.topic_id)
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' AND OLD.topic_id IS NOT NULL THEN
    UPDATE public.topics
    SET likes_count = (SELECT count(*) FROM public.reactions WHERE topic_id = OLD.topic_id)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_topic_reaction_stats ON public.reactions;
CREATE TRIGGER trg_sync_topic_reaction_stats
AFTER INSERT OR DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.sync_topic_reaction_stats();

-- 4. SECURE STORED PROCEDURES (RPCs)

-- Increment Views RPC
CREATE OR REPLACE FUNCTION public.increment_views(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO authenticated, anon;

-- Toggle Topic Solution RPC (Topic author or Staff only)
CREATE OR REPLACE FUNCTION public.toggle_topic_solution(
  p_topic_id UUID,
  p_comment_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_topic_author_id UUID;
  v_current_solved BOOLEAN;
BEGIN
  SELECT author_id, is_solved INTO v_topic_author_id, v_current_solved
  FROM public.topics
  WHERE id = p_topic_id;

  -- Ensure authorization (Must be author or staff)
  IF auth.uid() != v_topic_author_id AND NOT public.is_staff() THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Yalnızca konu sahibi veya moderatör çözüm işaretleyebilir.';
  END IF;

  IF v_current_solved AND (SELECT solution_comment_id FROM public.topics WHERE id = p_topic_id) = p_comment_id THEN
    -- Unmark solution
    UPDATE public.topics 
    SET is_solved = false, solution_comment_id = NULL, solved_at = NULL 
    WHERE id = p_topic_id;
    
    UPDATE public.comments 
    SET is_solution = false 
    WHERE topic_id = p_topic_id;
  ELSE
    -- Mark new solution
    UPDATE public.comments 
    SET is_solution = false 
    WHERE topic_id = p_topic_id;

    UPDATE public.comments 
    SET is_solution = true 
    WHERE id = p_comment_id;

    UPDATE public.topics 
    SET is_solved = true, solution_comment_id = p_comment_id, solved_at = NOW() 
    WHERE id = p_topic_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.toggle_topic_solution(UUID, UUID) TO authenticated;

-- Toggle Topic Bookmark RPC
CREATE OR REPLACE FUNCTION public.toggle_topic_bookmark(p_topic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Yer işareti eklemek için oturum açmalısınız.';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.bookmarks
    WHERE user_id = v_user_id AND topic_id = p_topic_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.bookmarks WHERE user_id = v_user_id AND topic_id = p_topic_id;
    RETURN false;
  ELSE
    INSERT INTO public.bookmarks (user_id, topic_id) VALUES (v_user_id, p_topic_id);
    RETURN true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.toggle_topic_bookmark(UUID) TO authenticated;

-- 5. PERFORMANCE & SEARCH INDICES
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author_id ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_last_activity ON public.topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics(slug);
CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_reactions_topic_user ON public.reactions(topic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_topic ON public.bookmarks(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 6. ROW LEVEL SECURITY (RLS) HARDENING

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Profiles RLS
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
  CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  -- Categories RLS
  DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
  CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Staff can manage categories" ON public.categories;
  CREATE POLICY "Staff can manage categories" ON public.categories
    FOR ALL USING (public.is_staff());

  -- Topics RLS
  DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
  CREATE POLICY "Topics are viewable by everyone" ON public.topics
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.topics;
  CREATE POLICY "Authenticated users can create topics" ON public.topics
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

  DROP POLICY IF EXISTS "Authors or staff can update topics" ON public.topics;
  CREATE POLICY "Authors or staff can update topics" ON public.topics
    FOR UPDATE USING (auth.uid() = author_id OR public.is_staff())
    WITH CHECK (auth.uid() = author_id OR public.is_staff());

  DROP POLICY IF EXISTS "Authors or staff can delete topics" ON public.topics;
  CREATE POLICY "Authors or staff can delete topics" ON public.topics
    FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

  -- Comments RLS
  DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
  CREATE POLICY "Comments are viewable by everyone" ON public.comments
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
  CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = author_id);

  DROP POLICY IF EXISTS "Authors or staff can update comments" ON public.comments;
  CREATE POLICY "Authors or staff can update comments" ON public.comments
    FOR UPDATE USING (auth.uid() = author_id OR public.is_staff())
    WITH CHECK (auth.uid() = author_id OR public.is_staff());

  DROP POLICY IF EXISTS "Authors or staff can delete comments" ON public.comments;
  CREATE POLICY "Authors or staff can delete comments" ON public.comments
    FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

  -- Reactions RLS
  DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
  CREATE POLICY "Reactions are viewable by everyone" ON public.reactions
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can manage own reactions" ON public.reactions;
  CREATE POLICY "Users can manage own reactions" ON public.reactions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Bookmarks RLS
  DROP POLICY IF EXISTS "Users can only view own bookmarks" ON public.bookmarks;
  CREATE POLICY "Users can only view own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
  CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  -- Reports RLS (Strict Privacy)
  DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
  CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

  DROP POLICY IF EXISTS "Reporters view own reports" ON public.reports;
  CREATE POLICY "Reporters view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id OR public.is_staff());

  DROP POLICY IF EXISTS "Staff can update reports" ON public.reports;
  CREATE POLICY "Staff can update reports" ON public.reports
    FOR UPDATE USING (public.is_staff());
END $$;
