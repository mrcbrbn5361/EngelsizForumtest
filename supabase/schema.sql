-- 🚀 ENGELSİZFORUM — TEMİZLENMİŞ SQL ŞEMASI (V2.2)
-- Analitikler ve log tabloları kaldırıldı. Idempotent (tekrar çalıştırılabilir) hale getirildi.

-- ==========================================
-- 1. EXTENSIONS & ENUMS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum tipleri (Hata almamak için DO blokları ile kontrol ediliyor)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE public.report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reaction_type') THEN
        CREATE TYPE public.reaction_type AS ENUM ('like', 'heart', 'insightful', 'support');
    END IF;
END $$;

-- ==========================================
-- 2. TABLES
-- ==========================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role public.user_role DEFAULT 'user',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  bio TEXT,
  header_url TEXT,
  is_locked BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  is_discoverable BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  accessibility_prefs JSONB DEFAULT '{"fontSize": 100, "highContrast": false, "dyslexicFont": false, "reducedMotion": false, "bionicReading": false, "focusMode": false, "voiceMode": false}'::jsonb,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  statuses_count INTEGER DEFAULT 0,
  last_status_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Ensure columns exist if table was already created
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS header_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_discoverable BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_status_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS statuses_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
DECLARE
    cat_id_type text;
BEGIN
    SELECT data_type INTO cat_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'id';

    IF cat_id_type = 'text' THEN
        BEGIN
            ALTER TABLE public.categories ALTER COLUMN id TYPE UUID USING id::uuid;
            cat_id_type := 'uuid';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'parent_id'
    ) THEN
        IF cat_id_type = 'text' THEN
            ALTER TABLE public.categories ADD COLUMN parent_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE;
        ELSE
            ALTER TABLE public.categories ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.categories ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public',
  is_sensitive BOOLEAN DEFAULT false,
  spoiler_text TEXT,
  search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(title,'') || ' ' || coalesce(content,''))) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS spoiler_text TEXT;
ALTER TABLE public.topics ALTER COLUMN id SET DEFAULT gen_random_uuid();

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='topics' AND column_name='search_vector'
    ) THEN
        ALTER TABLE public.topics ADD COLUMN search_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
    END IF;
END $$;

-- COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public',
  is_sensitive BOOLEAN DEFAULT false,
  spoiler_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure columns exist if table was already created
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_sensitive BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS spoiler_text TEXT;
ALTER TABLE public.comments ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- REACTIONS
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reaction_type public.reaction_type DEFAULT 'like'::public.reaction_type,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id, reaction_type),
  UNIQUE(user_id, comment_id, reaction_type),
  CHECK (num_nonnulls(topic_id, comment_id) = 1)
);

-- REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status public.report_status DEFAULT 'pending'::public.report_status,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (num_nonnulls(topic_id, comment_id) = 1)
);

-- BADGES
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.badges ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.badges ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- USER_BADGES
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- BOOKMARKS
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CONVERSATION_MEMBERS
CREATE TABLE IF NOT EXISTS public.conversation_members (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- UPLOADS
CREATE TABLE IF NOT EXISTS public.uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (num_nonnulls(topic_id, comment_id) = 1)
);

-- VISITORS (Raspberry Pi Data)
CREATE TABLE IF NOT EXISTS public.visitors (
  mac_address TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ DEFAULT now()
);

-- TAGS
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.tags ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- TOPIC_TAGS
CREATE TABLE IF NOT EXISTS public.topic_tags (
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (topic_id, tag_id)
);

-- FOLLOWS (Mastodon Relationship tracking)
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

-- handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profile update triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_topics_updated_at ON public.topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- handle new user (auth.users -> profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Yeni Kullanıcı'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Topic likes count
CREATE OR REPLACE FUNCTION public.increment_topic_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.topic_id IS NOT NULL THEN
    UPDATE public.topics SET likes_count = likes_count + 1 WHERE id::text = NEW.topic_id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement_topic_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.topic_id IS NOT NULL THEN
    UPDATE public.topics SET likes_count = likes_count - 1 WHERE id::text = OLD.topic_id::text;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reaction_added_topic ON public.reactions;
CREATE TRIGGER on_reaction_added_topic AFTER INSERT ON public.reactions FOR EACH ROW EXECUTE FUNCTION public.increment_topic_likes();

DROP TRIGGER IF EXISTS on_reaction_removed_topic ON public.reactions;
CREATE TRIGGER on_reaction_removed_topic AFTER DELETE ON public.reactions FOR EACH ROW EXECUTE FUNCTION public.decrement_topic_likes();

-- Comment count
CREATE OR REPLACE FUNCTION public.increment_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.topics SET comments_count = comments_count + 1, updated_at = now() WHERE id::text = NEW.topic_id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_added ON public.comments;
CREATE TRIGGER on_comment_added AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.increment_comment_count();

-- MASTODON COMPATIBILITY TRIGGERS & HELPERS
-- ==========================================

-- MASTODON APPS
CREATE TABLE IF NOT EXISTS public.mastodon_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  redirect_uri TEXT NOT NULL,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT NOT NULL,
  scopes TEXT DEFAULT 'read write follow',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- OAUTH CODES (Short lived)
CREATE TABLE IF NOT EXISTS public.oauth_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,
  scope TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mastodon_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public apps view" ON public.mastodon_apps;
CREATE POLICY "Public apps view" ON public.mastodon_apps FOR SELECT USING (true);

-- 1. Handle follows updates (followers_count and following_count)
CREATE OR REPLACE FUNCTION public.handle_follows_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id::text = NEW.follower_id::text;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id::text = NEW.following_id::text;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id::text = OLD.follower_id::text;
    UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id::text = OLD.following_id::text;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follows_changed ON public.follows;
CREATE TRIGGER on_follows_changed
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follows_change();

-- 2. Handle statuses count (for topics and comments)
CREATE OR REPLACE FUNCTION public.handle_statuses_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.profiles SET statuses_count = statuses_count + 1 WHERE id::text = NEW.author_id::text;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.profiles SET statuses_count = GREATEST(0, statuses_count - 1) WHERE id::text = OLD.author_id::text;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_topic_added_status ON public.topics;
CREATE TRIGGER on_topic_added_status
  AFTER INSERT OR DELETE ON public.topics
  FOR EACH ROW EXECUTE FUNCTION public.handle_statuses_count_change();

DROP TRIGGER IF EXISTS on_comment_added_status ON public.comments;
CREATE TRIGGER on_comment_added_status
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_statuses_count_change();

-- 3. Increment User XP & level up
CREATE OR REPLACE FUNCTION public.increment_user_xp(user_id uuid, xp_amount integer)
RETURNS void AS $$
DECLARE
    current_xp integer;
    new_xp integer;
    new_level integer;
BEGIN
    SELECT COALESCE(xp, 0) INTO current_xp FROM public.profiles WHERE id::text = user_id::text;
    new_xp := current_xp + xp_amount;
    new_level := 1 + (new_xp / 200);
    UPDATE public.profiles
    SET xp = new_xp,
        level = new_level,
        updated_at = now()
    WHERE id::text = user_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_user_xp(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_xp(uuid, integer) TO service_role;

-- 4. Increment comments count on topics
CREATE OR REPLACE FUNCTION public.increment_comments_count(topic_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.topics
    SET comments_count = COALESCE(comments_count, 0) + 1,
        updated_at = now()
    WHERE id::text = topic_id::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_comments_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_comments_count(uuid) TO service_role;

-- ==========================================
-- 4. INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS topics_search_idx ON public.topics USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_topic ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_slug ON public.badges(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_tags ENABLE ROW LEVEL SECURITY;

-- Helper function for staff check (admin/moderator)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id::text = auth.uid()::text AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id::text OR public.is_staff());

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage categories" ON public.categories;
CREATE POLICY "Staff can manage categories" ON public.categories FOR ALL USING (public.is_staff());

-- Topics
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert topics" ON public.topics;
CREATE POLICY "Authenticated users can insert topics" ON public.topics FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);

DROP POLICY IF EXISTS "Users can update own topics or staff" ON public.topics;
CREATE POLICY "Users can update own topics or staff" ON public.topics FOR UPDATE USING (auth.uid()::text = author_id::text OR public.is_staff());

DROP POLICY IF EXISTS "Users can delete own topics or staff" ON public.topics;
CREATE POLICY "Users can delete own topics or staff" ON public.topics FOR DELETE USING (auth.uid()::text = author_id::text OR public.is_staff());

-- Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid()::text = author_id::text);

DROP POLICY IF EXISTS "Users can update own comments or staff" ON public.comments;
CREATE POLICY "Users can update own comments or staff" ON public.comments FOR UPDATE USING (auth.uid()::text = author_id::text OR public.is_staff());

DROP POLICY IF EXISTS "Users can delete own comments or staff" ON public.comments;
CREATE POLICY "Users can delete own comments or staff" ON public.comments FOR DELETE USING (auth.uid()::text = author_id::text OR public.is_staff());

-- Reactions
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
CREATE POLICY "Reactions are viewable by everyone" ON public.reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert reactions" ON public.reactions;
CREATE POLICY "Authenticated users can insert reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own reactions" ON public.reactions;
CREATE POLICY "Users can delete own reactions" ON public.reactions FOR DELETE USING (auth.uid()::text = user_id::text);

-- Reports
DROP POLICY IF EXISTS "Staff can view reports" ON public.reports;
CREATE POLICY "Staff can view reports" ON public.reports FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can insert reports" ON public.reports;
CREATE POLICY "Authenticated users can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid()::text = reporter_id::text);

DROP POLICY IF EXISTS "Staff can update reports" ON public.reports;
CREATE POLICY "Staff can update reports" ON public.reports FOR UPDATE USING (public.is_staff());

-- Badges
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage badges" ON public.badges;
CREATE POLICY "Staff can manage badges" ON public.badges FOR ALL USING (public.is_staff());

-- User Badges
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage user badges" ON public.user_badges;
CREATE POLICY "Staff can manage user badges" ON public.user_badges FOR ALL USING (public.is_staff());

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid()::text = user_id::text);

-- Bookmarks
DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid()::text = user_id::text);

-- Tags
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.tags;
CREATE POLICY "Authenticated users can insert tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Topic Tags
DROP POLICY IF EXISTS "Topic tags are viewable by everyone" ON public.topic_tags;
CREATE POLICY "Topic tags are viewable by everyone" ON public.topic_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Topic authors can manage tags" ON public.topic_tags;
CREATE POLICY "Topic authors can manage tags" ON public.topic_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.topics WHERE id::text = topic_id::text AND (author_id::text = auth.uid()::text OR public.is_staff()))
);

-- Follows (Mastodon relationships)
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view follows" ON public.follows;
CREATE POLICY "Everyone can view follows" ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id::text);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid()::text = follower_id::text);

-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id::text = id::text AND user_id::text = auth.uid()::text)
);

-- Conversation Members
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view members of their own conversations" ON public.conversation_members;
CREATE POLICY "Users can view members of their own conversations" ON public.conversation_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_members cm WHERE cm.conversation_id::text = conversation_id::text AND cm.user_id::text = auth.uid()::text)
);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in their own conversations" ON public.messages;
CREATE POLICY "Users can view messages in their own conversations" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id::text = messages.conversation_id::text AND user_id::text = auth.uid()::text)
);

DROP POLICY IF EXISTS "Users can insert messages in their own conversations" ON public.messages;
CREATE POLICY "Users can insert messages in their own conversations" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id::text = messages.conversation_id::text AND user_id::text = auth.uid()::text)
  AND auth.uid()::text = sender_id::text
);

-- Uploads
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own uploads" ON public.uploads;
CREATE POLICY "Users can view their own uploads" ON public.uploads FOR SELECT USING (auth.uid()::text = user_id::text OR public.is_staff());

DROP POLICY IF EXISTS "Users can insert their own uploads" ON public.uploads;
CREATE POLICY "Users can insert their own uploads" ON public.uploads FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Attachments are viewable by everyone" ON public.attachments;
CREATE POLICY "Attachments are viewable by everyone" ON public.attachments FOR SELECT USING (true);

-- ==========================================
-- 6. REALTIME
-- ==========================================
-- Supabase Dashboard > Database > Replication > 'supabase_realtime' publication
-- ==========================================
-- 6. STORAGE BUCKETS
-- ==========================================
-- Note: Requires storage extension enabled
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public)
    SELECT 'uploads', 'uploads', true
    WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads');
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- ==========================================
-- 7. SEED DATA (TEMİZLENMİŞ)
-- ==========================================

-- 1. MOCK DATA VE EŞLEŞMEYEN VERİ TEMİZLEME
DELETE FROM public.topics WHERE author_id::text IN (
    SELECT p.id::text FROM public.profiles p
    LEFT JOIN auth.users u ON p.id::text = u.id::text
    WHERE u.id IS NULL OR p.username LIKE 'mock_%' OR p.full_name LIKE 'Mock%'
);

DELETE FROM public.profiles
WHERE id::text NOT IN (SELECT id::text FROM auth.users)
OR username LIKE 'mock_%' OR full_name LIKE 'Mock%';

-- 2. KATEGORİLER (Ana)
DO $$
DECLARE
    cat RECORD;
    categories_list CURSOR FOR 
        SELECT * FROM (VALUES
            ('Engelli Hakları', 'engelli-haklari', 'Engelli hakları savunuculuğu.'),
            ('İstihdam', 'istihdam', 'İş ilanları ve kariyer.'),
            ('ÖTV', 'otv', 'Araç alımı ve mevzuat.'),
            ('SGK', 'sgk', 'Emeklilik ve prim.'),
            ('Sosyal Haklar', 'sosyal-haklar', 'Yardımlar.'),
            ('Araçlar', 'araclar', 'Yardımcı ekipmanlar.'),
            ('Eğitim', 'egitim', 'Özel eğitim.'),
            ('Sağlık', 'saglik', 'Raporlar ve tedavi.'),
            ('Teknoloji', 'teknoloji', 'Erişilebilir teknoloji.'),
            ('Yapay Zeka', 'yapay-zeka', 'Yapay zeka araçları.'),
            ('Yazılım', 'yazilim', 'Erişilebilir yazılım.'),
            ('EKPSS', 'ekpss', 'Sınav hazırlık.'),
            ('Günlük Yaşam', 'gunluk-yasam', 'Hobi ve sosyal.'),
            ('Kamu Duyuruları', 'kamu-duyurulari', 'Resmi ilanlar.')
        ) AS t(name, slug, description);
BEGIN
    FOR cat IN categories_list LOOP
        IF EXISTS (SELECT 1 FROM public.categories WHERE slug = cat.slug) THEN
            UPDATE public.categories SET description = cat.description WHERE slug = cat.slug;
        ELSE
            INSERT INTO public.categories (id, name, slug, description) VALUES (gen_random_uuid(), cat.name, cat.slug, cat.description);
        END IF;
    END LOOP;
END $$;

-- 3. ALT KATEGORİLERİ ZORLA OLUŞTURMA
DO $$
DECLARE
    cat_rec RECORD;
    sub_names TEXT[] := ARRAY['Genel', 'Mevzuat', 'Destek', 'Sıkça Sorulanlar', 'Gelişmeler'];
    sub_slug TEXT;
BEGIN
    FOR cat_rec IN SELECT id, slug, name FROM public.categories WHERE parent_id IS NULL LOOP
        FOR i IN 1..5 LOOP
            sub_slug := cat_rec.slug || '-alt-' || i;
            IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = sub_slug) THEN
                INSERT INTO public.categories (id, name, slug, description, parent_id)
                VALUES (
                    gen_random_uuid(),
                    sub_names[i],
                    sub_slug,
                    sub_names[i] || ' - ' || cat_rec.name,
                    cat_rec.id
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;
