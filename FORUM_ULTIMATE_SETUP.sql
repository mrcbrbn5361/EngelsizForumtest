-- Engelsiz Forum - Ultimate Database Setup (v2.0)
-- Bu SQL kodu, tabloları oluşturur, RLS (Satır Bazlı Güvenlik) kurallarını ayarlar
-- ve profil oluşturma tetikleyicilerini kurar.

-- 1. GEREKLİLİKLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLO: PROFILES (Profil Bilgileri ve Erişilebilirlik Tercihleri)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  accessibility_prefs JSONB DEFAULT '{"fontSize": "md", "highContrast": false, "dyslexicFont": false, "reducedMotion": false, "bionicReading": false, "voiceMode": false}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLO: CATEGORIES (Forum Forumları / Kategoriler)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLO: TOPICS (Tartışma Başlıkları)
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_solved BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLO: COMMENTS (Yanıtlar / Yorumlar)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLO: REACTIONS (Beğeniler / Reaksiyonlar)
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 7. RLS (ROW LEVEL SECURITY) AYARLARI
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- 7.1 PROFILES POLICIES
CREATE POLICY "Herkes profilleri görebilir" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 7.2 CATEGORIES POLICIES
CREATE POLICY "Herkes kategorileri görebilir" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Yalnızca adminler kategori ekleyebilir" ON public.categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7.3 TOPICS POLICIES
CREATE POLICY "Herkes konuları görebilir" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Giriş yapanlar konu açabilir" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Yazarlar veya adminler konuyu güncelleyebilir" ON public.topics FOR UPDATE USING (
  auth.uid() = author_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Yazarlar veya adminler konuyu silebilir" ON public.topics FOR DELETE USING (
  auth.uid() = author_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7.4 COMMENTS POLICIES
CREATE POLICY "Herkes yorumları görebilir" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Giriş yapanlar yorum yapabilir" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Yazarlar kendi yorumunu güncelleyebilir" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Yazarlar veya adminler yorum silebilir" ON public.comments FOR DELETE USING (auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 7.5 REACTIONS POLICIES
CREATE POLICY "Herkes reaksiyonları görebilir" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Giriş yapanlar reaksiyon bırakabilir" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Giriş yapanlar reaksiyonunu silebilir" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- 8. TETİKLEYİCİLER (TRIGGERS)

-- 8.1 Otomatik Profil Oluşturma (auth.users tablosuna yeni biri eklendiğinde)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8.2 Güncelleme Tarihi (updated_at) Tetikleyicisi
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE OR REPLACE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
