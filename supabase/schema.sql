-- ==============================================================================
-- ENGELSİZFORUM - COMPREHENSIVE ENTERPRISE SUPABASE DATABASE SCHEMA & INITIAL SEED
-- WCAG 2.1 AAA Compliant, Multi-Role (Admin / Moderator / Member), Hierarchical Categories
-- ==============================================================================

-- 1. EXTENSIONS SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. PROFILES TABLE & AUTH TRIGGERS
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

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON public.profiles(last_seen);

-- Automatic Profile Creator Trigger
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
      'kullanici_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name', 
      NEW.raw_user_meta_data->>'full_name', 
      'Engelsiz Üye'
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Engelsiz Üye'),
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
-- 3. CATEGORIES TABLE (5 MAIN CATEGORIES + 20 SUBCATEGORIES)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE DEFAULT NULL,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'FolderTree',
  color_code TEXT DEFAULT '#2563EB',
  is_main BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ==============================================================================
-- 4. TOPICS / THREADS TABLE
-- ==============================================================================

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

-- Alias view for threads <-> topics compatibility
CREATE OR REPLACE VIEW public.threads AS 
SELECT 
  id, 
  category_id, 
  author_id, 
  title, 
  slug, 
  content, 
  is_pinned, 
  is_locked, 
  is_solved, 
  views_count, 
  comments_count AS replies_count, 
  likes_count, 
  tags, 
  created_at, 
  updated_at, 
  last_activity_at
FROM public.topics;

CREATE INDEX IF NOT EXISTS idx_topics_category ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_is_pinned ON public.topics(is_pinned);

-- Search vector index for topics
ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS search_vector TSVECTOR 
  GENERATED ALWAYS AS (to_tsvector('turkish', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;

CREATE INDEX IF NOT EXISTS idx_topics_search ON public.topics USING gin(search_vector);

-- ==============================================================================
-- 5. COMMENTS / POSTS TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alias view for posts <-> comments compatibility
CREATE OR REPLACE VIEW public.posts AS
SELECT 
  id,
  topic_id AS thread_id,
  author_id,
  content,
  is_solution,
  likes_count,
  parent_id,
  created_at,
  updated_at
FROM public.comments;

CREATE INDEX IF NOT EXISTS idx_comments_topic ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON public.comments(author_id);

-- ==============================================================================
-- 6. COMMUNITIES & COMMUNITY MEMBERS TABLE
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

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- ==============================================================================
-- 7. VISITORS & ACTIVE USER TRACKING TABLE
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_last_seen ON public.visitors(last_seen DESC);

-- ==============================================================================
-- 8. NOTIFICATIONS & AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('reply', 'mention', 'like', 'solution', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);

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
-- 9. HELPER FUNCTIONS & COUNTER TRIGGERS
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

-- Increment thread view count alias
CREATE OR REPLACE FUNCTION public.increment_thread_views(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto update topic comment count & last activity
CREATE OR REPLACE FUNCTION public.handle_comment_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.topics 
    SET comments_count = COALESCE(comments_count, 0) + 1,
        last_activity_at = NOW() 
    WHERE id = NEW.topic_id;
    
    -- Give author 15 XP for commenting
    IF NEW.author_id IS NOT NULL THEN
      UPDATE public.profiles
      SET xp = COALESCE(xp, 0) + 15,
          reputation_points = COALESCE(reputation_points, 0) + 1
      WHERE id = NEW.author_id;
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
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories Policies
DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Topics Policies
DROP POLICY IF EXISTS "Topics viewable by everyone" ON public.topics;
CREATE POLICY "Topics viewable by everyone" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create topics" ON public.topics;
CREATE POLICY "Authenticated users create topics" ON public.topics FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors or mods update topics" ON public.topics;
CREATE POLICY "Authors or mods update topics" ON public.topics FOR UPDATE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

DROP POLICY IF EXISTS "Authors or mods delete topics" ON public.topics;
CREATE POLICY "Authors or mods delete topics" ON public.topics FOR DELETE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Comments Policies
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create comments" ON public.comments;
CREATE POLICY "Authenticated users create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors or mods update comments" ON public.comments;
CREATE POLICY "Authors or mods update comments" ON public.comments FOR UPDATE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Visitors Policies
DROP POLICY IF EXISTS "Public can record visitor activity" ON public.visitors;
CREATE POLICY "Public can record visitor activity" ON public.visitors FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update visitor activity" ON public.visitors;
CREATE POLICY "Public can update visitor activity" ON public.visitors FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Everyone view visitor stats" ON public.visitors;
CREATE POLICY "Everyone view visitor stats" ON public.visitors FOR SELECT USING (true);

-- ==============================================================================
-- 11. SEED DATA - 5 MAIN CATEGORIES & 20 SUBCATEGORIES
-- ==============================================================================

-- Clean old sample categories safely
TRUNCATE TABLE public.categories CASCADE;

-- ANA KATEGORİ 1: Sağlık & Erişilebilirlik
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index)
VALUES ('10000000-0000-0000-0000-000000000001', NULL, 'Sağlık & Erişilebilirlik', 'Sağlık & Erişilebilirlik', 'saglik-ve-erisilebilirlik', 'Medikal süreçler, cihazlar, dijital ve fiziksel mimari erişilebilirlik çözümleri.', 'HeartPulse', '#E11D48', true, 10);

-- Subcategories for Main Category 1
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index) VALUES 
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Medikal & Tedavi Rehberi', 'Medikal & Tedavi Rehberi', 'medikal-tedavi-rehberi', 'Sağlık kurulu raporları, doktor deneyimleri ve tedavi rehberleri.', 'Stethoscope', '#E11D48', false, 11),
('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Medikal Cihazlar & Protez-Ortez', 'Medikal Cihazlar & Protez-Ortez', 'medikal-cihazlar-protez', 'Tekerlekli sandalye, işitme cihazı, protez ve SGK geri ödeme süreçleri.', 'Shield', '#E11D48', false, 12),
('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Dijital Erişilebilirlik & Yazılımlar', 'Dijital Erişilebilirlik & Yazılımlar', 'dijital-erisilebilirlik-yazilim', 'WCAG standartları, ekran okuyucu uyumluluğu ve erişilebilir mobil uygulamalar.', 'Code', '#E11D48', false, 13),
('10000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'Fiziksel Erişilebilirlik & Mimari', 'Fiziksel Erişilebilirlik & Mimari', 'fiziksel-erisilebilirlik-mimari', 'Rampalar, asansörler, sarı çizgiler ve kamusal alan mimari standartları.', 'Eye', '#E11D48', false, 14);

-- ANA KATEGORİ 2: Yasal Haklar & Mevzuat
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index)
VALUES ('20000000-0000-0000-0000-000000000001', NULL, 'Yasal Haklar & Mevzuat', 'Yasal Haklar & Mevzuat', 'yasal-haklar-ve-mevzuat', 'ÖTV muafiyeti, engelli maaşları, erken emeklilik ve hukuki danışmanlık.', 'Scale', '#2563EB', true, 20);

-- Subcategories for Main Category 2
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index) VALUES 
('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Engelli Emekliliği & ÖTV-KDV Muafiyeti', 'Engelli Emekliliği & ÖTV-KDV Muafiyeti', 'engelli-emekliligi-otv-muafiyeti', '2026 ÖTV araç üst sınırı, vergi indirimi ve emeklilik prim gün hesaplama.', 'Car', '#2563EB', false, 21),
('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'İstihdam & EKPSS Hazırlık', 'İstihdam & EKPSS Hazırlık', 'istihdam-ekpss-hazirlik', 'EKPSS kılavuzları, sınav soruları, memur kontenjanları ve kura çekimleri.', 'GraduationCap', '#2563EB', false, 22),
('20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Evde Bakım & Engelli Maaşları', 'Evde Bakım & Engelli Maaşları', 'evde-bakim-engelli-maaslari', '2022 engelli yardımları, muhtaçlık aylığı, kişi başı gelir kriterleri.', 'HeartPulse', '#2563EB', false, 23),
('20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 'Hukuki Danışmanlık & Hak Arama', 'Hukuki Danışmanlık & Hak Arama', 'hukuki-danismanlik-hak-arama', 'Emsal mahkeme kararları, idari itiraz dilekçeleri ve kanun maddeleri.', 'BookOpen', '#2563EB', false, 24);

-- ANA KATEGORİ 3: Eğitim & Kariyer
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index)
VALUES ('30000000-0000-0000-0000-000000000001', NULL, 'Eğitim & Kariyer', 'Eğitim & Kariyer', 'egitim-ve-kariyer', 'Özel eğitim merkezleri, akademik burslar, uzaktan çalışma ve yetenek geliştirme.', 'GraduationCap', '#7C3AED', true, 30);

-- Subcategories for Main Category 3
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index) VALUES 
('30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Özel Eğitim & Rehabilitasyon', 'Özel Eğitim & Rehabilitasyon', 'ozel-egitim-rehabilitasyon', 'RAM raporları, bireysel eğitim planları (BEP) ve rehabilitasyon merkezi seçimi.', 'BookOpen', '#7C3AED', false, 31),
('30000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Üniversite & Akademik Yaşam', 'Üniversite & Akademik Yaşam', 'universite-akademik-yasam', 'YÖK engelli öğrenci birimleri, kampüs erişilebilirliği ve burs imkanları.', 'GraduationCap', '#7C3AED', false, 32),
('30000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'İş İlanları & İş Deneyimleri', 'İş İlanları & İş Deneyimleri', 'is-ilanlari-is-deneyimleri', 'Engelli personel ilanları, evden/uzaktan çalışma fırsatları ve mülakat tüyoları.', 'Briefcase', '#7C3AED', false, 33),
('30000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'Beceri Geliştirme & Kurslar', 'Beceri Geliştirme & Kurslar', 'beceri-gelistirme-kurslar', 'Yazılım, grafik, içerik üreticiliği ve İŞKUR meslek edindirme kursları.', 'Cpu', '#7C3AED', false, 34);

-- ANA KATEGORİ 4: Sosyal Yaşam & Yaşam Kalitesi
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index)
VALUES ('40000000-0000-0000-0000-000000000001', NULL, 'Sosyal Yaşam & Yaşam Kalitesi', 'Sosyal Yaşam & Yaşam Kalitesi', 'sosyal-yasam-kalitesi', 'Kültür, spor, seyahat, deneyim paylaşımı ve yardımlaşma kulüpleri.', 'Smile', '#059669', true, 40);

-- Subcategories for Main Category 4
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index) VALUES 
('40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Spor, Sanat & Hobiler', 'Spor, Sanat & Hobiler', 'spor-sanat-hobiler', 'Ampute futbol, tekerlekli sandalye basketbol, tiyatro ve hobi grupları.', 'Smile', '#059669', false, 41),
('40000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'Engelsiz Turizm & Gezi', 'Engelsiz Turizm & Gezi', 'engelsiz-turizm-gezi', 'Erişilebilir oteller, engelsiz plajlar, seyahat tavsiyeleri ve rota önerileri.', 'Car', '#059669', false, 42),
('40000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'Kişisel Hikayeler & Deneyimler', 'Kişisel Hikayeler & Deneyimler', 'kisisel-hikayeler-deneyimler', 'Başarı hikayeleri, ilham veren yaşam tecrübeleri ve serbest sohbet.', 'User', '#059669', false, 43),
('40000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'İkinci El Cihaz & Ekipman Paylaşımı', 'İkinci El Cihaz & Ekipman Paylaşımı', 'ikinci-el-cihaz-ekipman', 'Temiz kullanılmış sandalye, hasta yatağı, işitme cihazı devir ve bağışları.', 'Shield', '#059669', false, 44);

-- ANA KATEGORİ 5: Teknoloji & Yapay Zeka
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index)
VALUES ('50000000-0000-0000-0000-000000000001', NULL, 'Teknoloji & Yapay Zeka', 'Teknoloji & Yapay Zeka', 'teknoloji-ve-yapay-zeka', 'Ekran okuyucular, sesli asistanlar, yapay zeka betimleme ve akıllı ev donanımları.', 'Cpu', '#D97706', true, 50);

-- Subcategories for Main Category 5
INSERT INTO public.categories (id, parent_id, title, name, slug, description, icon_name, color_code, is_main, order_index) VALUES 
('50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Ekran Okuyucular & Sesli Asistanlar', 'Ekran Okuyucular & Sesli Asistanlar', 'ekran-okuyucular-sesli-asistanlar', 'NVDA, JAWS, TalkBack, VoiceOver rehberleri ve kısayol ipuçları.', 'Volume2', '#D97706', false, 51),
('50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'Akıllı Ev & Yardımcı Donanımlar', 'Akıllı Ev & Yardımcı Donanımlar', 'akilli-ev-yardimci-donanimlar', 'Sesle kumanda edilen prizler, akıllı kilitler ve ortam sensörleri.', 'Settings', '#D97706', false, 52),
('50000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000001', 'Yapay Zeka & Betimleme Araçları', 'Yapay Zeka & Betimleme Araçları', 'yapay-zeka-betimleme-araclari', 'Gemini Vision, Be My AI, Yeterly AI ve yapay zeka ile görsel okuma.', 'Sparkles', '#D97706', false, 53),
('50000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000001', 'Mobil Uygulamalar & İpuçları', 'Mobil Uygulamalar & İpuçları', 'mobil-uygulamalar-ipuclari', 'İOS ve Android erişilebilirlik ayarları, navigasyon uygulamaları.', 'Cpu', '#D97706', false, 54);

-- ==============================================================================
-- 12. SAMPLE SEED DISCUSSIONS (TOPICS)
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
  ARRAY['NVDA', 'TalkBack', 'Ekran Okuyucu', 'Aİ']
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
);

-- Realtime Publication Registration
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.topics; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.comments; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Finish schema script
