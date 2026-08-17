-- ==============================================================================
-- ENGELSİZFORUM - KAPSAMLI, HATASIZ VE TEK PARÇA SUPABASE VERİTABANI ŞEMASI (V7 FINAL)
-- ==============================================================================
-- Bu SQL betiği; EngelsizForum'un tüm backend mimarisini, veri tablolarını, 
-- ilişkilerini (Foreign Keys), RPC fonksiyonlarını, RLS güvenlik politikalarını, 
-- Supabase Storage (forum-assets) alanını, otomatik tetikleyicilerini ve 
-- varsayılan kategori/rozet/topluluk tohum verilerini (Seed) eksiksiz kurar.
--
-- KURULUM:
-- 1. Supabase Dashboard -> SQL Editor menüsünü açın.
-- 2. "New Query" diyerek bu dosyanın TÜM içeriğini yapıştırın.
-- 3. "Run" butonuna basarak tek seferde çalıştırın.
-- ==============================================================================

-- 1. GEREKLİ POSTGRESQL EKLENTİLERİ
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. YARDIMCI VE YETKİLENDİRME FONKSİYONLARI
-- ==============================================================================

-- Yönetici / Moderatör Kontrol Fonksiyonu (RLS için)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator', 'system')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon, service_role;

-- Otomatik updated_at Alanı Güncelleyici
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. KULLANICI PROFİLLERİ (PROFILES) & AUTH TETİKLEYİCİSİ
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
    "fontSize": 100,
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

-- Kolonların varlığını garantiye al
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
  "fontSize": 100,
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
CREATE TRIGGER tr_profiles_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Supabase Auth Üyelik Oluşturulduğunda Otomatik Profil Başlatıcı
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'user';
BEGIN
  -- Kurucu / Yönetici e-posta kontrolü
  IF NEW.email = 'miracbirben@gmail.com' THEN
    v_role := 'admin';
  ELSE
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  END IF;

  INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    full_name,
    avatar_url, 
    role,
    level,
    xp,
    reputation_points,
    is_verified
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
    v_role,
    1,
    100,
    10,
    (v_role = 'admin')
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    role = CASE WHEN EXCLUDED.role = 'admin' THEN 'admin' ELSE public.profiles.role END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Son Görülme Zamanı Güncelleme Fonksiyonu (RPC)
CREATE OR REPLACE FUNCTION public.update_user_last_seen(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NOW(),
      updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.update_user_last_seen(UUID) TO authenticated, anon, service_role;

-- XP & Seviye Artırma Fonksiyonu (RPC)
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

GRANT EXECUTE ON FUNCTION public.increment_user_xp(UUID, INTEGER) TO authenticated, anon, service_role;

-- ==============================================================================
-- 4. KATEGORİLER (CATEGORIES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL DEFAULT NULL,
  title TEXT,
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

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL DEFAULT NULL;
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

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

DROP TRIGGER IF EXISTS tr_categories_updated_at ON public.categories;
CREATE TRIGGER tr_categories_updated_at 
BEFORE UPDATE ON public.categories 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. TARTIŞMALAR / KONULAR (TOPICS) & UYUMLULUK GÖRÜNÜMÜ (THREADS)
-- ==============================================================================

DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT c.relname, c.relkind 
    FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE n.nspname = 'public' AND c.relname IN ('threads', 'posts')
  ) LOOP
    IF r.relkind = 'v' THEN
      EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.relname) || ' CASCADE';
    END IF;
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
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS voice_duration INTEGER DEFAULT 0;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_last_activity ON public.topics(last_activity_at DESC);

-- Türkçe Tam Metin Arama İndeksi
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
CREATE TRIGGER tr_topics_updated_at 
BEFORE UPDATE ON public.topics 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Geriye Dönük Uyumluluk Görünümü (Threads)
CREATE OR REPLACE VIEW public.threads AS 
SELECT 
  id, category_id, author_id, title, slug, content, 
  is_pinned, is_locked, is_solved, views_count, 
  comments_count AS replies_count, likes_count, tags, 
  created_at, updated_at, last_activity_at
FROM public.topics;

-- ==============================================================================
-- 6. YORUMLAR (COMMENTS) & UYUMLULUK GÖRÜNÜMÜ (POSTS)
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
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS voice_duration INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false;

ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_comments_topic ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at ASC);

DROP TRIGGER IF EXISTS tr_comments_updated_at ON public.comments;
CREATE TRIGGER tr_comments_updated_at 
BEFORE UPDATE ON public.comments 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Geriye Dönük Uyumluluk Görünümü (Posts)
CREATE OR REPLACE VIEW public.posts AS
SELECT 
  id, topic_id AS thread_id, author_id, content, 
  is_solution, likes_count, parent_id, created_at, updated_at
FROM public.comments;

-- ==============================================================================
-- 7. REAKSİYONLAR & BEĞENİLER (REACTIONS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS reaction_type TEXT DEFAULT 'like';

CREATE INDEX IF NOT EXISTS idx_reactions_user_topic ON public.reactions(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_comment ON public.reactions(user_id, comment_id);

-- Beğeni Sayacı Senkronizasyon Tetikleyicisi
CREATE OR REPLACE FUNCTION public.sync_topic_likes() 
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.topic_id IS NOT NULL THEN
      UPDATE public.topics SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.topic_id;
    ELSIF NEW.comment_id IS NOT NULL THEN
      UPDATE public.comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.topic_id IS NOT NULL THEN
      UPDATE public.topics SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.topic_id;
    ELSIF OLD.comment_id IS NOT NULL THEN
      UPDATE public.comments SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.comment_id;
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
-- 8. KAYDEDİLENLER (BOOKMARKS)
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

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- ==============================================================================
-- 9. TOPLULUKLAR VE ÜYELERİ (COMMUNITIES)
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

-- ==============================================================================
-- 10. ETİKETLER (TAGS & TOPIC_TAGS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.topic_tags (
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (topic_id, tag_id)
);

-- ==============================================================================
-- 11. ROZETLER & OYUNLAŞTIRMA (BADGES & GAMIFICATION)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ==============================================================================
-- 12. TAKİP & DİREKT MESAJLAŞMA (MESSAGING & FOLLOWS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  audio_url TEXT DEFAULT NULL,
  media_url TEXT DEFAULT NULL,
  duration INTEGER DEFAULT 0,
  is_voice_message BOOLEAN DEFAULT false,
  waveform JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT DEFAULT NULL;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_voice_message BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS waveform JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);

-- ==============================================================================
-- 12.1 SESLİ MESAJLAR & SES KAYITLARI (VOICE MESSAGES & AUDIO MEMOS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.voice_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE DEFAULT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'audio/webm',
  transcription TEXT DEFAULT NULL,
  waveform JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS file_size INTEGER DEFAULT 0;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS mime_type TEXT DEFAULT 'audio/webm';
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS transcription TEXT DEFAULT NULL;
ALTER TABLE public.voice_messages ADD COLUMN IF NOT EXISTS waveform JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_voice_messages_user ON public.voice_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_conversation ON public.voice_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_topic ON public.voice_messages(topic_id);
CREATE INDEX IF NOT EXISTS idx_voice_messages_comment ON public.voice_messages(comment_id);


-- ==============================================================================
-- 13. ZİYARETÇİ ANALİTİĞİ VE IOT (VISITORS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT,
  mac_address TEXT,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  path TEXT,
  total_visitors INTEGER DEFAULT 0,
  active_visitors INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS device_id TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS mac_address TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS total_visitors INTEGER DEFAULT 0;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS active_visitors INTEGER DEFAULT 0;
ALTER TABLE public.visitors ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_visitors_device_id ON public.visitors(device_id) WHERE device_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_visitors_mac_address ON public.visitors(mac_address) WHERE mac_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON public.visitors(last_seen DESC);

-- ==============================================================================
-- 14. MCP & YAPAY ZEKA SUNUCULARI DİZİNİ (MCP_SERVERS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  category TEXT,
  "agentTypes" JSONB DEFAULT '[]'::jsonb,
  protocol TEXT DEFAULT 'sse',
  "endpointUrl" TEXT,
  "githubUrl" TEXT,
  "websiteUrl" TEXT,
  "starCount" INTEGER DEFAULT 0,
  "isOfficial" BOOLEAN DEFAULT false,
  "isEngelsizForumNative" BOOLEAN DEFAULT false,
  "syncStatus" TEXT DEFAULT 'synced',
  "lastSyncedAt" TIMESTAMPTZ DEFAULT NOW(),
  tools JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mcp_servers_category ON public.mcp_servers(category);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_slug ON public.mcp_servers(slug);

-- ==============================================================================
-- 15. BİLDİRİMLER, RAPORLAR, OAUTH & MASTODON DESTEĞİ
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE DEFAULT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE DEFAULT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  type TEXT NOT NULL DEFAULT 'reply',
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
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'reply';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

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

CREATE TABLE IF NOT EXISTS public.oauth_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 16. RPC FONKSİYONLARI (SAYAÇLAR VE TETİKLEYİCİLER)
-- ==============================================================================

-- Görüntülenme Sayacı Artırıcı (RPC: increment_views)
CREATE OR REPLACE FUNCTION public.increment_views(topic_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO authenticated, anon, service_role;

-- Görüntülenme Sayacı Artırıcı (Alternatif İsim: increment_thread_views)
CREATE OR REPLACE FUNCTION public.increment_thread_views(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_thread_views(UUID) TO authenticated, anon, service_role;

-- Yorum Sayacı Artırıcı (RPC: increment_comments_count)
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

GRANT EXECUTE ON FUNCTION public.increment_comments_count(UUID) TO authenticated, anon, service_role;

-- Otomatik Yorum Değişim Tetikleyicisi (Yorum Eklendiğinde Sayacı ve XP'yi Günceller)
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
-- 17. SUPABASE STORAGE (FORUM-ASSETS BUCKET)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-assets', 'forum-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Politikaları
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view forum assets" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload forum assets" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own forum assets" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own forum assets" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public can view forum assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-assets');

CREATE POLICY "Authenticated users can upload forum assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'forum-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own forum assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'forum-assets' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own forum assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'forum-assets' AND (auth.uid() = owner OR public.is_staff()));

-- ==============================================================================
-- 18. SATIR BAZLI GÜVENLİK (ROW LEVEL SECURITY - RLS)
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
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastodon_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_codes ENABLE ROW LEVEL SECURITY;

-- Eski Çakışan Politikaları Güvenle Temizle
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
  END LOOP;
END $$;

-- Yeni Temiz ve Standart RLS Politikaları
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

CREATE POLICY "Voice messages viewable by topic, comment or conversation members" ON public.voice_messages FOR SELECT USING (
  topic_id IS NOT NULL 
  OR comment_id IS NOT NULL
  OR EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = voice_messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users insert own voice messages" ON public.voice_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own voice messages or staff" ON public.voice_messages FOR DELETE USING (auth.uid() = user_id OR public.is_staff());


CREATE POLICY "Visitors select public" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Visitors insert public" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitors update public" ON public.visitors FOR UPDATE USING (true);

CREATE POLICY "MCP servers viewable by everyone" ON public.mcp_servers FOR SELECT USING (true);
CREATE POLICY "Staff or service role manage mcp servers" ON public.mcp_servers FOR ALL USING (public.is_staff() OR auth.role() = 'service_role');

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
-- 19. 5 ANA KATEGORİ VE 18 ALT KATEGORİ TOHUM VERİLERİ (SEED)
-- ==============================================================================

-- 1. Haklar ve Mevzuat
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('20000000-0000-0000-0000-000000000001', NULL, 'Haklar ve Mevzuat', 'Haklar ve Mevzuat', 'haklar-ve-mevzuat', 'Engelli hakları, yasalar, hak arama yolları ve mevzuat tartışmaları.', 'Scale', 'Scale', '#2563EB', '#2563EB', true, 10, 10)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Engelli Hakları ve Yasalar', 'Engelli Hakları ve Yasalar', 'engelli-haklari-ve-yasalar', 'Engellilerin anayasal hakları, yasalar, hak arama yolları ve mevzuat tartışmaları.', 'Scale', 'Scale', '#2563EB', '#2563EB', false, 11, 11),
('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Maaşlar, Ödenekler ve Sosyal Yardımlar', 'Maaşlar, Ödenekler ve Sosyal Yardımlar', 'maaslar-odenekler-ve-sosyal-yardimlar', '2022 engelli maaşı, evde bakım aylığı, vakıf yardımları ve başvuru koşulları.', 'CreditCard', 'CreditCard', '#2563EB', '#2563EB', false, 12, 12),
('20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Malulen Emeklilik ve Vergi İndirimi', 'Malulen Emeklilik ve Vergi İndirimi', 'malulen-emeklilik-ve-vergi-indirimi', 'Vergi indirimi dereceleri, erken emeklilik şartları, maluliyet tespiti ve SGK işlemleri.', 'PiggyBank', 'PiggyBank', '#2563EB', '#2563EB', false, 13, 13),
('20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'EKPSS (Sınav ve Atamalar)', 'EKPSS (Sınav ve Atamalar)', 'ekpss-sinav-ve-atamalar', 'Engelli Kamu Personeli Seçme Sınavı hazırlık, başvuru, tercih, kadrolar ve atama haberleri.', 'Award', 'Award', '#2563EB', '#2563EB', false, 14, 14),
('20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 'ÖTV Muafiyetli Araç Alımı', 'ÖTV Muafiyetli Araç Alımı', 'otv-muafiyetli-arac-alimi', '2026 ÖTV üst limit takibi, tertibatlı araç alımı, ithal araç ve vergi dairesi işlemleri.', 'Car', 'Car', '#2563EB', '#2563EB', false, 15, 15)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 2. Sağlık ve Medikal
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('10000000-0000-0000-0000-000000000001', NULL, 'Sağlık ve Medikal', 'Sağlık ve Medikal', 'saglik-ve-medikal', 'Rapor alımı, tıbbi tedaviler, medikal cihazlar ve protez/ortez deneyimleri.', 'HeartPulse', 'HeartPulse', '#E11D48', '#E11D48', true, 20, 20)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Engelli Sağlık Raporu', 'Engelli Sağlık Raporu', 'engelli-saglik-raporu', 'Sağlık kurulu raporu alma süreci, engelli oranları, itirazlar ve hastane deneyimleri.', 'FileText', 'FileText', '#E11D48', '#E11D48', false, 21, 21),
('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Medikal Cihazlar ve Protez/Ortez', 'Medikal Cihazlar ve Protez/Ortez', 'medikal-cihazlar-ve-protez-ortez', 'Tekerlekli sandalyeler, işitme cihazları, protezler, SGK ödemeleri ve marka deneyimleri.', 'HeartPulse', 'HeartPulse', '#E11D48', '#E11D48', false, 22, 22),
('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Kronik Hastalıklar ve İlaç Paylaşımları', 'Kronik Hastalıklar ve İlaç Paylaşımları', 'kronik-hastaliklar-ve-ilac-paylasimlari', 'Kronik rahatsızlıklarla yaşam, tedavi protokolleri, ilaçlar ve yan etki paylaşımları.', 'Activity', 'Activity', '#E11D48', '#E11D48', false, 23, 23)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Erişilebilirlik ve Teknoloji
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('30000000-0000-0000-0000-000000000001', NULL, 'Erişilebilirlik ve Teknoloji', 'Erişilebilirlik ve Teknoloji', 'erisilebilirlik-ve-teknoloji', 'Ekran okuyucular, fiziksel mekan tasarımı ve akıllı yardımcı araçlar.', 'Eye', 'Eye', '#7C3AED', '#7C3AED', true, 30, 30)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Görme Engelliler Teknolojileri', 'Görme Engelliler Teknolojileri', 'gorme-engelliler-teknolojileri', 'NVDA, Jaws, VoiceOver ekran okuyucular, kabartma cihazlar ve sesli kütüphaneler.', 'Eye', 'Eye', '#7C3AED', '#7C3AED', false, 31, 31),
('30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'İşitme ve Dil Çözümleri', 'İşitme ve Dil Çözümleri', 'isitme-ve-dil-cozumleri', 'İşitme cihazı ayarları, koklear implant, işaret dili eğitimleri ve alt yazı araçları.', 'Volume2', 'Volume2', '#7C3AED', '#7C3AED', false, 32, 32),
('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'Fiziksel Mekan ve Ulaşım Erişilebilirliği', 'Fiziksel Mekan ve Ulaşım Erişilebilirliği', 'fiziksel-mekan-ve-ulasim-erisilebilirligi', 'Tekerlekli sandalye dostu mekanlar, toplu taşıma, rampalar ve erişilebilirlik haritaları.', 'MapPin', 'MapPin', '#7C3AED', '#7C3AED', false, 33, 33)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 4. Sosyal Yaşam ve Akran Desteği
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('40000000-0000-0000-0000-000000000001', NULL, 'Sosyal Yaşam ve Akran Desteği', 'Sosyal Yaşam ve Akran Desteği', 'sosyal-yasam-ve-akran-destegi', 'Eğitim, kariyer, sosyal yardımlaşma ve farkındalık paylaşımları.', 'Users', 'Users', '#059669', '#059669', true, 40, 40)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Eğitim ve İstihdam', 'Eğitim ve İstihdam', 'egitim-ve-istihdam', 'Engelli öğrencilerin eğitim hakları, özel eğitim, iş ilanları ve çalışma hayatı zorlukları.', 'GraduationCap', 'GraduationCap', '#059669', '#059669', false, 41, 41),
('40000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Buluşma ve Etkinlikler', 'Buluşma ve Etkinlikler', 'bulusma-ve-etkinlikler', 'Fiziksel veya çevrimiçi engelsiz buluşmalar, sanatsal ve sportif faaliyet duyuruları.', 'Calendar', 'Calendar', '#059669', '#059669', false, 42, 42),
('40000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'Ayrımcılık Bildirimi ve Hak İhlalleri', 'Ayrımcılık Bildirimi ve Hak İhlalleri', 'ayrimcilik-bildirimi-ve-hak-ihlalleri', 'Günlük yaşamda karşılaşılan engelli ayrımcılığı, hak ihlalleri ve hukuki başvuru takibi.', 'AlertTriangle', 'AlertTriangle', '#059669', '#059669', false, 43, 43)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 5. Yapay Zeka & WebMCP
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order)
VALUES ('50000000-0000-0000-0000-000000000001', NULL, 'Yapay Zeka & WebMCP', 'Yapay Zeka & WebMCP', 'yapay-zeka-ve-webmcp', 'Yapay zeka asistanları, MCP sunucuları, otonom araçlar ve erişilebilir AI ajanları.', 'Cpu', 'Cpu', '#D97706', '#D97706', true, 50, 50)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon, icon_name, color, color_code, is_main, order_index, sort_order) VALUES 
('50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'MCP Sunucuları & Araçlar', 'MCP Sunucuları & Araçlar', 'mcp-sunuculari-ve-araclar', 'Model Context Protocol (MCP) eklentileri, API entegrasyonları ve açık kaynak araçlar.', 'Cpu', 'Cpu', '#D97706', '#D97706', false, 51, 51),
('50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Erişilebilir Yapay Zeka Ajanları', 'Erişilebilir Yapay Zeka Ajanları', 'erisilebilir-yapay-zeka-ajanlari', 'Görsel betimleme, sesli komut ajanları, mevzuat hesaplayıcı yapay zeka botları.', 'Bot', 'Bot', '#D97706', '#D97706', false, 52, 52)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ==============================================================================
-- 20. OYUNLAŞTIRMA ROZETLERİ TOHUM VERİLERİ (SEED)
-- ==============================================================================

INSERT INTO public.badges (id, name, description, icon, criteria) VALUES
('b0000000-0000-0000-0000-000000000001', 'Öncü Yazar', 'Platformda ilk tartışmasını veya rehber konusunu başlatan üye.', 'Sparkles', '{"topics_count": 1}'::jsonb),
('b0000000-0000-0000-0000-000000000002', 'Yardım Meleği', '10 farklı tartışmada çözüm sunan veya faydalı yanıt veren üye.', 'Heart', '{"solved_count": 10}'::jsonb),
('b0000000-0000-0000-0000-000000000003', 'Topluluk Rehberi', '500+ XP puanına ulaşan ve aktif katkı sağlayan kıdemli üye.', 'Award', '{"min_xp": 500}'::jsonb),
('b0000000-0000-0000-0000-000000000004', 'Erişilebilirlik Elçisi', 'Dijital veya fiziksel engellerle mücadelede örnek deneyim paylaşan üye.', 'ShieldCheck', '{"manual": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 21. TOPLULUKLAR TOHUM VERİLERİ (SEED)
-- ==============================================================================

INSERT INTO public.communities (id, name, slug, description, cover_url, avatar_url, members_count, topics_count, is_private, tags) VALUES
('c0000000-0000-0000-0000-000000000001', 'ÖTV Muafiyeti ve Tertibatlı Araç Alımı', 'otv', '2026 yılı ÖTV muafiyet üst limiti, tertibat kodları, vergi dairesi özelgeleri ve bayi deneyimleri.', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80', 'https://api.dicebear.com/7.x/identicon/svg?seed=otv', 1890, 425, false, ARRAY['Araç Alımı', 'ÖTV Muafiyeti', 'Limit Takibi']),
('c0000000-0000-0000-0000-000000000002', 'Sağlık Kurulu Raporu ve ÇÖZGER', 'saglik', 'Erişkin ve çocuklar için engelli sağlık kurulu raporu alma, itiraz süreçleri, oran hesaplama.', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80', 'https://api.dicebear.com/7.x/identicon/svg?seed=saglik', 1210, 245, false, ARRAY['Rapor Derecesi', 'Tedavi Süreçleri', 'Hekim Tavsiyeleri']),
('c0000000-0000-0000-0000-000000000003', 'Özel Eğitim, RAM ve Burs Fırsatları', 'egitim', 'Rehabilitasyon merkezleri, RAM incelemeleri, kaynaştırma eğitimi ve engelli öğrenci bursları.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', 'https://api.dicebear.com/7.x/identicon/svg?seed=egitim', 940, 180, false, ARRAY['Özel Eğitim', 'RAM Raporları', 'Kapsayıcı Okullar']),
('c0000000-0000-0000-0000-000000000004', 'EKPSS ve Engelli İstihdamı', 'istihdam', 'EKPSS sınav hazırlığı, branş bazında sıralamalar, memur alımları ve özel sektör kotaları.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80', 'https://api.dicebear.com/7.x/identicon/svg?seed=istihdam', 2150, 610, false, ARRAY['EKPSS', 'Kadro Atamaları', 'İş Fırsatları'])
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
