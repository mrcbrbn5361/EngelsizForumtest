-- =========================================================================
-- ENGELSİZ FORUM - KESİN (BULLETPROOF) SUPABASE KURTARMA & ONARIM MİMARİSİ
-- =========================================================================
-- Bu script:
-- 1. Tüm eksik tabloları ve kolonları (%100 idimpotent) ekler.
-- 2. "updated_at" gibi sıklıkla hata veren trigger yapılarını onarır.
-- 3. Reaction (Beğeni), RLS (Güvenlik) ve Profil eşitlemelerini tamir eder.
-- 4. Hatalara neden olan eski trigger ve politikaları güvenle sıfırlayıp yeniden kurar.
-- =========================================================================

-- 1. UZANTILAR
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. TABLOLARIN ZORUNLU İNŞASI VE ONARIMI
-- ==========================================

-- PROFİLLER TABLOSU
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT
);
-- Eksik Kolonlar
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accessibility_prefs JSONB DEFAULT '{"fontSize": "md", "highContrast": false, "dyslexicFont": false, "reducedMotion": false, "bionicReading": false, "voiceMode": false}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- KATEGORİLER TABLOSU
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT
);
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- KONULAR (TOPICS) TABLOSU
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL
);
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_solved BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- YORUMLAR (COMMENTS) TABLOSU
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- REAKSİYONLAR (BEĞENİLER) TABLOSU
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like'
);
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- reactions unique constraint garanti
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reactions_user_id_topic_id_key') THEN
    ALTER TABLE public.reactions ADD CONSTRAINT reactions_user_id_topic_id_key UNIQUE(user_id, topic_id);
  END IF;
END $$;

-- RAPORLAR (REPORTS) TABLOSU
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  reason TEXT NOT NULL
);
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed'));
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- ==========================================
-- 3. GÜVENLİ TETİKLEYİCİ(TRIGGER) FONKSİYONLARI 
-- ==========================================

-- 3.1 Updated_At Senkronizasyonu
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_topics_updated_at ON public.topics;
CREATE TRIGGER tr_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_comments_updated_at ON public.comments;
CREATE TRIGGER tr_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_categories_updated_at ON public.categories;
CREATE TRIGGER tr_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3.2 XP ve Level Sistemi Onarımı
CREATE OR REPLACE FUNCTION public.update_user_xp() RETURNS TRIGGER AS $$
DECLARE
  xp_gain INTEGER;
BEGIN
  IF TG_TABLE_NAME = 'comments' THEN xp_gain := 10;
  ELSIF TG_TABLE_NAME = 'topics' THEN xp_gain := 20;
  ELSE xp_gain := 0;
  END IF;
  
  UPDATE public.profiles 
  SET xp = COALESCE(xp, 0) + xp_gain, 
      level = FLOOR((COALESCE(xp, 0) + xp_gain) / 100) + 1 
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_xp ON public.comments;
CREATE TRIGGER on_comment_xp AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_user_xp();

DROP TRIGGER IF EXISTS on_topic_xp ON public.topics;
CREATE TRIGGER on_topic_xp AFTER INSERT ON public.topics FOR EACH ROW EXECUTE FUNCTION public.update_user_xp();

-- 3.3 Beğeni Sayısı Eşitleyici (Likes Count Sync)
CREATE OR REPLACE FUNCTION public.sync_topic_likes() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.topics SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.topic_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.topics SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reaction_change ON public.reactions;
CREATE TRIGGER on_reaction_change AFTER INSERT OR DELETE ON public.reactions FOR EACH ROW EXECUTE FUNCTION public.sync_topic_likes();

-- Mevcut likes_count verisini backfill (senkronize) et
UPDATE public.topics t
SET likes_count = (SELECT count(*) FROM public.reactions r WHERE r.topic_id = t.id);

-- 3.4 Kullanıcı Kayıt Tetikleyicisi (Auth Handle)
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 4. RLS - GÜVENLİK POLİTİKALARI ONARIMI 
-- ==========================================

-- Önce var olan policy çakışmalarını ortadan kaldır
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.' || r.tablename;
  END LOOP;
END $$;

-- Aktifleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Yeni Temiz Politikalar
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "categories_select" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_manage" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "topics_select" ON public.topics FOR SELECT USING (true);
CREATE POLICY "topics_insert" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "topics_update" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "topics_delete" ON public.topics FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

CREATE POLICY "reactions_select" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "reactions_manage" ON public.reactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports_admin" ON public.reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));


-- ==========================================
-- 5. MEVCUT KULLANICILARI EŞİTLEME (BACKFILL)
-- ==========================================
INSERT INTO public.profiles (id, username, full_name, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)),
  COALESCE(raw_user_meta_data->>'full_name', SPLIT_PART(email, '@', 1)),
  'user'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Admins / Moderators Yetkileri
UPDATE public.profiles SET role = 'admin' WHERE id IN (SELECT id FROM auth.users WHERE email IN ('miracbirben@gmail.com'));
UPDATE public.profiles SET role = 'moderator' WHERE id IN (SELECT id FROM auth.users WHERE email IN ('brtapardi@gmail.com', 'yigitfirat3405@gmail.com'));
