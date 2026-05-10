-- Engelsiz Forum - Ultimate Database Setup (v2.1)
-- Tüm tabloları ve güvenlik kurallarını (RLS) kurar.

-- 1. GEREKLİLİKLER
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLO: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  accessibility_prefs JSONB DEFAULT '{"fontSize": "md", "highContrast": false, "dyslexicFont": false, "reducedMotion": false, "bionicReading": false, "voiceMode": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLO: CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLO: TOPICS
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

-- 5. TABLO: COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABLO: REACTIONS
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 7. GÜVENLİK (RLS) - OTOMATİK AKTİFLEŞTİRME
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

-- 8. POLİTİKALAR (POLICIES)

-- Profiles
DROP POLICY IF EXISTS "Herkes profilleri görebilir" ON public.profiles;
CREATE POLICY "Herkes profilleri görebilir" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
DROP POLICY IF EXISTS "Herkes kategorileri görebilir" ON public.categories;
CREATE POLICY "Herkes kategorileri görebilir" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Yetkililer kategori yönetebilir" ON public.categories;
CREATE POLICY "Yetkililer kategori yönetebilir" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Topics
DROP POLICY IF EXISTS "Herkes konuları görebilir" ON public.topics;
CREATE POLICY "Herkes konuları görebilir" ON public.topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Giriş yapanlar konu açabilir" ON public.topics;
CREATE POLICY "Giriş yapanlar konu açabilir" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Yazarlar veya adminler konuyu yönetebilir" ON public.topics;
CREATE POLICY "Yazarlar veya adminler konuyu yönetebilir" ON public.topics FOR ALL USING (
  auth.uid() = author_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- 9. TETİKLEYİCİLER (TRIGGERS)

-- Yeni kullanıcı kaydında profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    -- İlk kaydı admin yapmak isterseniz burayı değiştirebilirsiniz
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. ÖZEL YETKİ ATAMASI (Moderator Atama)
-- brtapardi@gmail.com kullanıcısını bulup moderatör yapma
UPDATE public.profiles 
SET role = 'moderator' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'brtapardi@gmail.com'
);
