DO $$
BEGIN
  -- PROFILES
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='level') THEN
    ALTER TABLE public.profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='xp') THEN
    ALTER TABLE public.profiles ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='accessibility_prefs') THEN
    ALTER TABLE public.profiles ADD COLUMN accessibility_prefs JSONB DEFAULT '{"fontSize": 100, "highContrast": false, "dyslexicFont": false, "reducedMotion": false, "bionicReading": false, "focusMode": false, "voiceMode": false}'::jsonb;
  END IF;

  -- CATEGORIES
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='parent_id') THEN
    IF (SELECT data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='id') = 'text' THEN
      ALTER TABLE public.categories ADD COLUMN parent_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE;
    ELSE
      ALTER TABLE public.categories ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='slug') THEN
    ALTER TABLE public.categories ADD COLUMN slug TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='color') THEN
    ALTER TABLE public.categories ADD COLUMN color TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='sort_order') THEN
    ALTER TABLE public.categories ADD COLUMN sort_order INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='created_at') THEN
    ALTER TABLE public.categories ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='updated_at') THEN
    ALTER TABLE public.categories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  -- TOPICS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='likes_count') THEN
    ALTER TABLE public.topics ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='comments_count') THEN
    ALTER TABLE public.topics ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='views_count') THEN
    ALTER TABLE public.topics ADD COLUMN views_count INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='created_at') THEN
    ALTER TABLE public.topics ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='updated_at') THEN
    ALTER TABLE public.topics ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='search_vector') THEN
    ALTER TABLE public.topics ADD COLUMN search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
  END IF;

  -- COMMENTS
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='likes_count') THEN
    ALTER TABLE public.comments ADD COLUMN likes_count INTEGER DEFAULT 0;
  END IF;
  
  -- Ensure Topics has is_solved
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='is_solved') THEN
    ALTER TABLE public.topics ADD COLUMN is_solved BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='slug') THEN
    ALTER TABLE public.topics ADD COLUMN slug TEXT;
  END IF;

  -- Cleanup redundant columns causing errors
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='author_name') THEN
    ALTER TABLE public.topics DROP COLUMN author_name;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='topics' AND column_name='author_username') THEN
    ALTER TABLE public.topics DROP COLUMN author_username;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='comments' AND column_name='author_name') THEN
    ALTER TABLE public.comments DROP COLUMN author_name;
  END IF;
END $$;

-- Increment Views Function
CREATE OR REPLACE FUNCTION public.increment_views(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments Count Trigger Function
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.topics SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.topic_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.topics SET comments_count = GREATEST(0, COALESCE(comments_count, 0) - 1) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create Trigger safely
DROP TRIGGER IF EXISTS on_comment_added_or_removed ON public.comments;
CREATE TRIGGER on_comment_added_or_removed
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- Visitors RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Visitors are viewable by service role only" ON public.visitors;
CREATE POLICY "Visitors are viewable by service role only" ON public.visitors FOR SELECT USING (true); -- We use service role in actions anyway

-- EKSİK OLABİLECEK YENİ TABLOLARI OLUŞTUR (V2.2 GEREKSİNİMLERİ)

-- Visitors (Analitik için)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  path TEXT,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Triggers for updated_at (just in case they are missing)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at') THEN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_topics_updated_at') THEN
    CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
    CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;
