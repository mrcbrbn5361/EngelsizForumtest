-- ==============================================================================
-- ENGELSİZFORUM - PHASE 4 CLASSIC FORUM CORE HARDENED MIGRATION (SECURITY RECOVERY)
-- File: supabase/migrations/20260818000002_phase4_classic_forum_core.sql
-- Description: Hardened forum lifecycle, cross-topic validation, anti-tampering triggers,
--              scoped category moderation, safe counters sync, and strict RLS policies.
-- ==============================================================================

BEGIN;

-- 1. EXTENSIONS & ESSENTIAL HELPERS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. CATEGORIES ENHANCEMENTS (IDEMPOTENT)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT false,
  topics_count INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  last_post_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS topics_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS posts_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_post_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. TOPICS ENHANCEMENTS (CANONICAL)
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
  tags TEXT[] DEFAULT '{}'::text[],
  topic_type TEXT DEFAULT 'discussion',
  audio_url TEXT,
  voice_duration INT,
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
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS topic_type TEXT DEFAULT 'discussion',
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS voice_duration INT,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Topic type constraint check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topics_topic_type_check'
  ) THEN
    ALTER TABLE public.topics
      ADD CONSTRAINT topics_topic_type_check
      CHECK (topic_type IN ('discussion', 'question', 'guide', 'announcement'));
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 4. COMMENTS ENHANCEMENTS (CANONICAL)
-- Set ON DELETE SET NULL on parent_id to prevent destroying entire sub-threads if a parent comment is deleted
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  likes_count INT DEFAULT 0,
  edit_count INT DEFAULT 0,
  edit_reason TEXT,
  last_edited_at TIMESTAMPTZ,
  audio_url TEXT,
  voice_duration INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE SET NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS likes_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS edit_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS edit_reason TEXT,
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS voice_duration INT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Foreign key for solution_comment_id
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

-- 5. TAGS & TOPIC_TAGS TABLES
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.topic_tags (
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (topic_id, tag_id)
);

-- 6. POLLS SYSTEM (HARDENED)
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_multiple_choice BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  votes_count INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_poll_user_vote UNIQUE (poll_id, option_id, user_id)
);

-- Poll vote validation trigger function: guarantees option belongs to poll and single-choice rules
CREATE OR REPLACE FUNCTION public.validate_poll_vote()
RETURNS TRIGGER AS $$
DECLARE
  v_is_multiple_choice BOOLEAN;
  v_is_closed BOOLEAN;
  v_ends_at TIMESTAMPTZ;
  v_option_poll_id UUID;
BEGIN
  -- 1. Ensure option belongs to poll
  SELECT poll_id INTO v_option_poll_id
  FROM public.poll_options
  WHERE id = NEW.option_id;

  IF v_option_poll_id IS NULL OR v_option_poll_id != NEW.poll_id THEN
    RAISE EXCEPTION 'Geçersiz anket seçeneği.';
  END IF;

  -- 2. Ensure poll is open
  SELECT is_multiple_choice, is_closed, ends_at
  INTO v_is_multiple_choice, v_is_closed, v_ends_at
  FROM public.polls
  WHERE id = NEW.poll_id;

  IF v_is_closed OR (v_ends_at IS NOT NULL AND v_ends_at < NOW()) THEN
    RAISE EXCEPTION 'Bu anket oylamaya kapatılmıştır.';
  END IF;

  -- 3. If single choice, ensure user has not voted for another option
  IF NOT COALESCE(v_is_multiple_choice, false) THEN
    IF EXISTS (
      SELECT 1 FROM public.poll_votes
      WHERE poll_id = NEW.poll_id AND user_id = NEW.user_id AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'Bu ankette yalnızca tek bir seçenek için oy kullanabilirsiniz.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_poll_vote ON public.poll_votes;
CREATE TRIGGER trg_validate_poll_vote
BEFORE INSERT OR UPDATE ON public.poll_votes
FOR EACH ROW EXECUTE FUNCTION public.validate_poll_vote();

-- Sync poll option vote count
CREATE OR REPLACE FUNCTION public.sync_poll_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_option_id UUID := COALESCE(NEW.option_id, OLD.option_id);
BEGIN
  IF v_option_id IS NOT NULL THEN
    UPDATE public.poll_options
    SET votes_count = (SELECT count(*) FROM public.poll_votes WHERE option_id = v_option_id)
    WHERE id = v_option_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_poll_vote_counts ON public.poll_votes;
CREATE TRIGGER trg_sync_poll_vote_counts
AFTER INSERT OR DELETE ON public.poll_votes
FOR EACH ROW EXECUTE FUNCTION public.sync_poll_vote_counts();

-- 7. REACTIONS & BOOKMARKS ENHANCEMENTS
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
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_unique_user_topic_reaction'
  ) THEN
    CREATE UNIQUE INDEX idx_unique_user_topic_reaction 
    ON public.reactions (user_id, topic_id) 
    WHERE topic_id IS NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_unique_user_comment_reaction'
  ) THEN
    CREATE UNIQUE INDEX idx_unique_user_comment_reaction 
    ON public.reactions (user_id, comment_id) 
    WHERE comment_id IS NOT NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_topic_bookmark_key UNIQUE (user_id, topic_id)
);

-- 8. COMPATIBILITY VIEWS (WITH SECURITY INVOKER WHERE SUPPORTED)
DO $$
BEGIN
  -- Recreate view with security_invoker = true if supported
  EXECUTE 'CREATE OR REPLACE VIEW public.threads WITH (security_invoker = true) AS
  SELECT
    id, title, slug, content, category_id, author_id,
    is_pinned, is_locked, is_solved, views_count, likes_count,
    comments_count, last_activity_at, created_at, updated_at
  FROM public.topics;';

  EXECUTE 'CREATE OR REPLACE VIEW public.posts WITH (security_invoker = true) AS
  SELECT
    id, topic_id, author_id, parent_id, parent_comment_id,
    content, is_solution, likes_count, created_at, updated_at
  FROM public.comments;';
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback for older engine versions
    CREATE OR REPLACE VIEW public.threads AS
    SELECT
      id, title, slug, content, category_id, author_id,
      is_pinned, is_locked, is_solved, views_count, likes_count,
      comments_count, last_activity_at, created_at, updated_at
    FROM public.topics;

    CREATE OR REPLACE VIEW public.posts AS
    SELECT
      id, topic_id, author_id, parent_id, parent_comment_id,
      content, is_solution, likes_count, created_at, updated_at
    FROM public.comments;
END $$;

-- 9. ANTI-TAMPERING TRIGGERS (PREVENT CLIENT PRIVILEGE ESCALATION ON UPDATE)
CREATE OR REPLACE FUNCTION public.prevent_topic_tampering()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_staff BOOLEAN := FALSE;
BEGIN
  -- If caller is internal system or staff
  IF auth.uid() IS NOT NULL THEN
    caller_is_staff := public.is_staff() OR public.has_category_permission(OLD.category_id, auth.uid());
  ELSE
    caller_is_staff := TRUE;
  END IF;

  -- Non-staff users cannot manipulate metadata or counter fields directly
  IF NOT COALESCE(caller_is_staff, FALSE) THEN
    NEW.author_id := OLD.author_id;
    NEW.is_pinned := OLD.is_pinned;
    NEW.is_locked := OLD.is_locked;
    NEW.is_solved := OLD.is_solved;
    NEW.solution_comment_id := OLD.solution_comment_id;
    NEW.solved_at := OLD.solved_at;
    NEW.views_count := OLD.views_count;
    NEW.likes_count := OLD.likes_count;
    NEW.comments_count := OLD.comments_count;
    NEW.created_at := OLD.created_at;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_topic_tampering ON public.topics;
CREATE TRIGGER trg_prevent_topic_tampering
BEFORE UPDATE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.prevent_topic_tampering();

CREATE OR REPLACE FUNCTION public.prevent_comment_tampering()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_staff BOOLEAN := FALSE;
BEGIN
  IF auth.uid() IS NOT NULL THEN
    caller_is_staff := public.is_staff();
  ELSE
    caller_is_staff := TRUE;
  END IF;

  IF NOT COALESCE(caller_is_staff, FALSE) THEN
    NEW.author_id := OLD.author_id;
    NEW.topic_id := OLD.topic_id;
    NEW.is_solution := OLD.is_solution;
    NEW.likes_count := OLD.likes_count;
    NEW.created_at := OLD.created_at;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_comment_tampering ON public.comments;
CREATE TRIGGER trg_prevent_comment_tampering
BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.prevent_comment_tampering();

-- 10. REAL-TIME COUNTERS & STATS SYNCHRONIZATION TRIGGERS
CREATE OR REPLACE FUNCTION public.sync_topic_comment_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_new_topic_id UUID;
  v_old_topic_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new_topic_id := NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_topic_id := OLD.topic_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_new_topic_id := NEW.topic_id;
    v_old_topic_id := OLD.topic_id;
  END IF;

  IF v_new_topic_id IS NOT NULL THEN
    UPDATE public.topics
    SET comments_count = (SELECT count(*) FROM public.comments WHERE topic_id = v_new_topic_id),
        last_activity_at = NOW()
    WHERE id = v_new_topic_id;
  END IF;

  IF v_old_topic_id IS NOT NULL AND v_old_topic_id != COALESCE(v_new_topic_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    UPDATE public.topics
    SET comments_count = (SELECT count(*) FROM public.comments WHERE topic_id = v_old_topic_id)
    WHERE id = v_old_topic_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_topic_comment_stats ON public.comments;
CREATE TRIGGER trg_sync_topic_comment_stats
AFTER INSERT OR UPDATE OF topic_id OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.sync_topic_comment_stats();

CREATE OR REPLACE FUNCTION public.sync_category_topic_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_new_cat_id UUID;
  v_old_cat_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new_cat_id := NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_cat_id := OLD.category_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_new_cat_id := NEW.category_id;
    v_old_cat_id := OLD.category_id;
  END IF;

  IF v_new_cat_id IS NOT NULL THEN
    UPDATE public.categories
    SET topics_count = (SELECT count(*) FROM public.topics WHERE category_id = v_new_cat_id),
        posts_count = (SELECT count(*) FROM public.comments c JOIN public.topics t ON t.id = c.topic_id WHERE t.category_id = v_new_cat_id),
        last_post_at = NOW()
    WHERE id = v_new_cat_id;
  END IF;

  IF v_old_cat_id IS NOT NULL AND v_old_cat_id != COALESCE(v_new_cat_id, '00000000-0000-0000-0000-000000000000'::uuid) THEN
    UPDATE public.categories
    SET topics_count = (SELECT count(*) FROM public.topics WHERE category_id = v_old_cat_id),
        posts_count = (SELECT count(*) FROM public.comments c JOIN public.topics t ON t.id = c.topic_id WHERE t.category_id = v_old_cat_id)
    WHERE id = v_old_cat_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_category_topic_stats ON public.topics;
CREATE TRIGGER trg_sync_category_topic_stats
AFTER INSERT OR UPDATE OF category_id OR DELETE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.sync_category_topic_stats();

CREATE OR REPLACE FUNCTION public.sync_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  v_topic_id UUID := COALESCE(NEW.topic_id, OLD.topic_id);
  v_comment_id UUID := COALESCE(NEW.comment_id, OLD.comment_id);
BEGIN
  IF v_topic_id IS NOT NULL THEN
    UPDATE public.topics
    SET likes_count = (SELECT count(*) FROM public.reactions WHERE topic_id = v_topic_id)
    WHERE id = v_topic_id;
  END IF;

  IF v_comment_id IS NOT NULL THEN
    UPDATE public.comments
    SET likes_count = (SELECT count(*) FROM public.reactions WHERE comment_id = v_comment_id)
    WHERE id = v_comment_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_sync_reaction_counts ON public.reactions;
CREATE TRIGGER trg_sync_reaction_counts
AFTER INSERT OR DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.sync_reaction_counts();

-- 11. HARDENED STORED PROCEDURES (SECURITY DEFINER WITH SEARCH_PATH)

-- Increment Views RPC
CREATE OR REPLACE FUNCTION public.increment_views(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  IF topic_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.topics WHERE id = topic_id) THEN
    UPDATE public.topics
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = topic_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.increment_views(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO authenticated, anon;

-- Toggle Topic Solution RPC (Guarantees cross-topic match and author/scoped mod permission)
CREATE OR REPLACE FUNCTION public.toggle_topic_solution(
  p_topic_id UUID,
  p_comment_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_topic_author_id UUID;
  v_current_solved BOOLEAN;
  v_category_id UUID;
  v_comment_topic_id UUID;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Oturum açmalısınız.';
  END IF;

  IF NOT public.is_account_active(v_caller_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Hesabınız aktif durumda değil.';
  END IF;

  SELECT author_id, is_solved, category_id 
  INTO v_topic_author_id, v_current_solved, v_category_id
  FROM public.topics
  WHERE id = p_topic_id;

  IF v_topic_author_id IS NULL AND NOT FOUND THEN
    RAISE EXCEPTION 'Konu bulunamadı.';
  END IF;

  IF p_comment_id IS NULL THEN
    RAISE EXCEPTION 'Geçersiz yorum parametresi.';
  END IF;

  -- Verify comment belongs to THIS topic
  SELECT topic_id INTO v_comment_topic_id
  FROM public.comments
  WHERE id = p_comment_id;

  IF v_comment_topic_id IS NULL THEN
    RAISE EXCEPTION 'Yorum bulunamadı.';
  END IF;

  IF v_comment_topic_id != p_topic_id THEN
    RAISE EXCEPTION 'Güvenlik ihlali: Seçilen yorum bu konuya ait değil.';
  END IF;

  -- Ensure authorization (Author, Staff, or Scoped Category Moderator)
  IF v_caller_id != v_topic_author_id 
     AND NOT public.is_staff() 
     AND NOT public.has_category_permission(v_category_id, v_caller_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Yalnızca konu sahibi veya kategori moderatörü çözüm belirleyebilir.';
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
    -- Unmark any previous solution on THIS topic only
    UPDATE public.comments 
    SET is_solution = false 
    WHERE topic_id = p_topic_id;

    -- Mark chosen comment as solution
    UPDATE public.comments 
    SET is_solution = true 
    WHERE id = p_comment_id AND topic_id = p_topic_id;

    -- Update topic status
    UPDATE public.topics 
    SET is_solved = true, solution_comment_id = p_comment_id, solved_at = NOW() 
    WHERE id = p_topic_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.toggle_topic_solution(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_topic_solution(UUID, UUID) TO authenticated;

-- Toggle Topic Pin RPC
CREATE OR REPLACE FUNCTION public.toggle_topic_pin(p_topic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_category_id UUID;
  v_current_pinned BOOLEAN;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Oturum açmalısınız.';
  END IF;

  IF NOT public.is_account_active(v_caller_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Hesabınız aktif durumda değil.';
  END IF;

  SELECT category_id, is_pinned INTO v_category_id, v_current_pinned
  FROM public.topics
  WHERE id = p_topic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Konu bulunamadı.';
  END IF;

  IF NOT public.is_staff() AND NOT public.has_category_permission(v_category_id, v_caller_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Yalnızca yetkili moderatörler konuyu sabitleyebilir.';
  END IF;

  UPDATE public.topics
  SET is_pinned = NOT COALESCE(v_current_pinned, false)
  WHERE id = p_topic_id;

  RETURN NOT COALESCE(v_current_pinned, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.toggle_topic_pin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_topic_pin(UUID) TO authenticated;

-- Toggle Topic Lock RPC
CREATE OR REPLACE FUNCTION public.toggle_topic_lock(p_topic_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_category_id UUID;
  v_current_locked BOOLEAN;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Oturum açmalısınız.';
  END IF;

  IF NOT public.is_account_active(v_caller_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Hesabınız aktif durumda değil.';
  END IF;

  SELECT category_id, is_locked INTO v_category_id, v_current_locked
  FROM public.topics
  WHERE id = p_topic_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Konu bulunamadı.';
  END IF;

  IF NOT public.is_staff() AND NOT public.has_category_permission(v_category_id, v_caller_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Yalnızca yetkili moderatörler konuyu kilitleyebilir.';
  END IF;

  UPDATE public.topics
  SET is_locked = NOT COALESCE(v_current_locked, false)
  WHERE id = p_topic_id;

  RETURN NOT COALESCE(v_current_locked, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.toggle_topic_lock(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_topic_lock(UUID) TO authenticated;

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

  IF NOT public.is_account_active(v_user_id) THEN
    RAISE EXCEPTION 'Yetkisiz işlem: Hesabınız aktif durumda değil.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.topics WHERE id = p_topic_id) THEN
    RAISE EXCEPTION 'Konu bulunamadı.';
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

REVOKE EXECUTE ON FUNCTION public.toggle_topic_bookmark(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_topic_bookmark(UUID) TO authenticated;

-- 12. PERFORMANCE & SEARCH INDICES
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author_id ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_last_activity ON public.topics(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_is_pinned ON public.topics(is_pinned DESC);
CREATE INDEX IF NOT EXISTS idx_topics_is_solved ON public.topics(is_solved);
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics(slug);
CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);
CREATE INDEX IF NOT EXISTS idx_reactions_topic_user ON public.reactions(topic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_comment_user ON public.reactions(comment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_topic ON public.bookmarks(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_topic_tags_tag_id ON public.topic_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user ON public.poll_votes(poll_id, user_id);

-- 13. ROW LEVEL SECURITY (RLS) HARDENING

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Categories RLS
  DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON public.categories;
  CREATE POLICY "Public categories are viewable by everyone" ON public.categories
    FOR SELECT USING (
      COALESCE(is_private, false) = false OR public.is_staff()
    );

  DROP POLICY IF EXISTS "Staff can manage categories" ON public.categories;
  CREATE POLICY "Staff can manage categories" ON public.categories
    FOR ALL USING (public.is_staff())
    WITH CHECK (public.is_staff());

  -- Topics RLS
  DROP POLICY IF EXISTS "Public topics are viewable by everyone" ON public.topics;
  CREATE POLICY "Public topics are viewable by everyone" ON public.topics
    FOR SELECT USING (
      NOT EXISTS (
        SELECT 1 FROM public.categories c 
        WHERE c.id = public.topics.category_id AND COALESCE(c.is_private, false) = true
      ) OR public.is_staff()
    );

  DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.topics;
  CREATE POLICY "Authenticated users can create topics" ON public.topics
    FOR INSERT WITH CHECK (
      auth.uid() IS NOT NULL AND
      auth.uid() = author_id AND
      public.is_account_active(auth.uid())
    );

  DROP POLICY IF EXISTS "Authors, Staff and Category Mods can update topics" ON public.topics;
  CREATE POLICY "Authors, Staff and Category Mods can update topics" ON public.topics
    FOR UPDATE USING (
      auth.uid() IS NOT NULL AND (
        auth.uid() = author_id OR 
        public.is_staff() OR 
        public.has_category_permission(public.topics.category_id, auth.uid())
      )
    )
    WITH CHECK (
      auth.uid() IS NOT NULL AND (
        auth.uid() = author_id OR 
        public.is_staff() OR 
        public.has_category_permission(public.topics.category_id, auth.uid())
      )
    );

  DROP POLICY IF EXISTS "Authors, Staff and Category Mods can delete topics" ON public.topics;
  CREATE POLICY "Authors, Staff and Category Mods can delete topics" ON public.topics
    FOR DELETE USING (
      auth.uid() IS NOT NULL AND (
        auth.uid() = author_id OR 
        public.is_staff() OR 
        public.has_category_permission(public.topics.category_id, auth.uid())
      )
    );

  -- Comments RLS
  DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON public.comments;
  CREATE POLICY "Public comments are viewable by everyone" ON public.comments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.topics t 
        WHERE t.id = public.comments.topic_id AND (
          NOT EXISTS (
            SELECT 1 FROM public.categories c 
            WHERE c.id = t.category_id AND COALESCE(c.is_private, false) = true
          ) OR public.is_staff()
        )
      )
    );

  DROP POLICY IF EXISTS "Authenticated users can create comments on open topics" ON public.comments;
  CREATE POLICY "Authenticated users can create comments on open topics" ON public.comments
    FOR INSERT WITH CHECK (
      auth.uid() IS NOT NULL AND
      auth.uid() = author_id AND
      public.is_account_active(auth.uid()) AND (
        public.is_staff() OR
        EXISTS (
          SELECT 1 FROM public.topics 
          WHERE id = topic_id AND COALESCE(is_locked, false) = false
        )
      )
    );

  DROP POLICY IF EXISTS "Authors, Staff and Category Mods can update comments" ON public.comments;
  CREATE POLICY "Authors, Staff and Category Mods can update comments" ON public.comments
    FOR UPDATE USING (
      auth.uid() IS NOT NULL AND (
        auth.uid() = author_id OR 
        public.is_staff() OR 
        EXISTS (
          SELECT 1 FROM public.topics t
          WHERE t.id = public.comments.topic_id AND public.has_category_permission(t.category_id, auth.uid())
        )
      )
    )
    WITH CHECK (
      auth.uid() IS NOT NULL AND (
        auth.uid() = author_id OR 
        public.is_staff() OR 
        EXISTS (
          SELECT 1 FROM public.topics t
          WHERE t.id = public.comments.topic_id AND public.has_category_permission(t.category_id, auth.uid())
        )
      )
    );

  DROP POLICY IF EXISTS "Authors, Staff and Category Mods can delete comments" ON public.comments;
  CREATE POLICY "Authors, Staff and Category Mods can delete comments" ON public.comments
    FOR DELETE USING (
      auth.uid() IS NOT NULL AND (
        auth.uid() = author_id OR 
        public.is_staff() OR 
        EXISTS (
          SELECT 1 FROM public.topics t
          WHERE t.id = public.comments.topic_id AND public.has_category_permission(t.category_id, auth.uid())
        )
      )
    );

  -- Tags RLS
  DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
  CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Staff and Active users can insert tags" ON public.tags;
  CREATE POLICY "Staff and Active users can insert tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND public.is_account_active(auth.uid()));

  DROP POLICY IF EXISTS "Topic tags are viewable by everyone" ON public.topic_tags;
  CREATE POLICY "Topic tags are viewable by everyone" ON public.topic_tags FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Topic author and Staff can manage topic tags" ON public.topic_tags;
  CREATE POLICY "Topic author and Staff can manage topic tags" ON public.topic_tags
    FOR ALL USING (
      auth.uid() IS NOT NULL AND (
        EXISTS (SELECT 1 FROM public.topics WHERE id = topic_id AND author_id = auth.uid()) OR
        public.is_staff()
      )
    );

  -- Polls RLS
  DROP POLICY IF EXISTS "Polls are viewable by everyone" ON public.polls;
  CREATE POLICY "Polls are viewable by everyone" ON public.polls FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Topic authors and Staff can create polls" ON public.polls;
  CREATE POLICY "Topic authors and Staff can create polls" ON public.polls
    FOR INSERT WITH CHECK (
      auth.uid() IS NOT NULL AND (
        EXISTS (SELECT 1 FROM public.topics WHERE id = topic_id AND author_id = auth.uid()) OR
        public.is_staff()
      )
    );

  DROP POLICY IF EXISTS "Poll options are viewable by everyone" ON public.poll_options;
  CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Poll votes are viewable by everyone" ON public.poll_votes;
  CREATE POLICY "Poll votes are viewable by everyone" ON public.poll_votes FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Active users can vote on open polls" ON public.poll_votes;
  CREATE POLICY "Active users can vote on open polls" ON public.poll_votes
    FOR INSERT WITH CHECK (
      auth.uid() IS NOT NULL AND
      auth.uid() = user_id AND
      public.is_account_active(auth.uid()) AND
      EXISTS (
        SELECT 1 FROM public.polls 
        WHERE id = poll_id AND COALESCE(is_closed, false) = false
      )
    );

  -- Reactions RLS
  DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
  CREATE POLICY "Reactions are viewable by everyone" ON public.reactions
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can manage own reactions" ON public.reactions;
  CREATE POLICY "Users can manage own reactions" ON public.reactions
    FOR ALL USING (auth.uid() = user_id AND public.is_account_active(auth.uid()))
    WITH CHECK (auth.uid() = user_id AND public.is_account_active(auth.uid()));

  -- Bookmarks RLS
  DROP POLICY IF EXISTS "Users can manage own bookmarks" ON public.bookmarks;
  CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
    FOR ALL USING (auth.uid() = user_id AND public.is_account_active(auth.uid()))
    WITH CHECK (auth.uid() = user_id AND public.is_account_active(auth.uid()));

END $$;

-- 14. DATA BACKFILL (SAFE & IDEMPOTENT)
UPDATE public.topics t
SET comments_count = (SELECT count(*) FROM public.comments c WHERE c.topic_id = t.id)
WHERE t.comments_count = 0 OR t.comments_count IS NULL;

UPDATE public.categories cat
SET topics_count = (SELECT count(*) FROM public.topics t WHERE t.category_id = cat.id),
    posts_count = (SELECT count(*) FROM public.comments c JOIN public.topics t ON t.id = c.topic_id WHERE t.category_id = cat.id)
WHERE cat.topics_count = 0 OR cat.topics_count IS NULL;

UPDATE public.topics
SET last_activity_at = COALESCE((SELECT max(c.created_at) FROM public.comments c WHERE c.topic_id = topics.id), created_at)
WHERE last_activity_at IS NULL;

-- 15. GRANTS
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.topics, public.comments, public.reactions, public.bookmarks, public.poll_votes, public.tags, public.topic_tags TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

COMMIT;
