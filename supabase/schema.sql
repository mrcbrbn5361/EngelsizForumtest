-- EngelsizForum - Enterprise Database Schema (Supabase / PostgreSQL)
-- WCAG 2.1 AAA Compliant, Multi-role (Admin/Moderator/User) & Enterprise Grade RLS

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. PROFILES TABLE & AUTH TRIGGER
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  reputation_points INTEGER DEFAULT 10,
  accessibility_preferences JSONB DEFAULT '{
    "fontSize": "md",
    "highContrast": false,
    "dyslexicFont": false,
    "reducedMotion": false,
    "bionicReading": false,
    "focusMode": false
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation on Supabase Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'kullanici_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Forum Üyesi'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
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

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'folder',
  color_code TEXT DEFAULT '#2563EB',
  is_private BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. THREADS (TOPICS) TABLE & ALIAS VIEW
CREATE TABLE IF NOT EXISTS public.threads (
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
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely convert old topics table/view if present
DO $$
DECLARE
    r_kind "char";
BEGIN
    SELECT c.relkind INTO r_kind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'topics';

    IF r_kind = 'r' THEN
        EXECUTE 'DROP TABLE public.topics CASCADE';
    ELSIF r_kind = 'v' OR r_kind = 'm' THEN
        EXECUTE 'DROP VIEW public.topics CASCADE';
    END IF;
END $$;

CREATE OR REPLACE VIEW public.topics AS
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
  replies_count,
  created_at,
  updated_at
FROM public.threads;

-- 5. POSTS (REPLIES) TABLE & MIGRATIONS
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_meta JSONB DEFAULT '[]'::jsonb,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='posts' AND column_name='thread_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema='public' AND table_name='posts' AND column_name='topic_id'
        ) THEN
            ALTER TABLE public.posts RENAME COLUMN topic_id TO thread_id;
        ELSE
            ALTER TABLE public.posts ADD COLUMN thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 6. REACTIONS TABLE & MIGRATIONS
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'support', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reactions ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='reactions' AND column_name='thread_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema='public' AND table_name='reactions' AND column_name='topic_id'
        ) THEN
            ALTER TABLE public.reactions RENAME COLUMN topic_id TO thread_id;
        ELSE
            ALTER TABLE public.reactions ADD COLUMN thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 7. BOOKMARKS TABLE & MIGRATIONS
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='bookmarks' AND column_name='thread_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema='public' AND table_name='bookmarks' AND column_name='topic_id'
        ) THEN
            ALTER TABLE public.bookmarks RENAME COLUMN topic_id TO thread_id;
        ELSE
            ALTER TABLE public.bookmarks ADD COLUMN thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 8. NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  reference_id UUID,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='notifications' AND column_name='recipient_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema='public' AND table_name='notifications' AND column_name='user_id'
        ) THEN
            ALTER TABLE public.notifications RENAME COLUMN user_id TO recipient_id;
        ELSE
            ALTER TABLE public.notifications ADD COLUMN recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INDEXES
CREATE INDEX IF NOT EXISTS idx_threads_category ON public.threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON public.threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_last_activity ON public.threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON public.posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_reactions_thread ON public.reactions(thread_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_threads_fts ON public.threads USING gin(to_tsvector('turkish', title || ' ' || content));

-- 10. RLS POLICIES & SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles viewable" ON public.profiles;
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (
  auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories Policies
DROP POLICY IF EXISTS "Categories viewable" ON public.categories;
CREATE POLICY "Categories viewable" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Threads Policies
DROP POLICY IF EXISTS "Threads viewable" ON public.threads;
CREATE POLICY "Threads viewable" ON public.threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users create threads" ON public.threads;
CREATE POLICY "Auth users create threads" ON public.threads FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors or mods update threads" ON public.threads;
CREATE POLICY "Authors or mods update threads" ON public.threads FOR UPDATE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

DROP POLICY IF EXISTS "Authors or mods delete threads" ON public.threads;
CREATE POLICY "Authors or mods delete threads" ON public.threads FOR DELETE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Posts Policies
DROP POLICY IF EXISTS "Posts viewable" ON public.posts;
CREATE POLICY "Posts viewable" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users create posts" ON public.posts;
CREATE POLICY "Auth users create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authors or mods update posts" ON public.posts;
CREATE POLICY "Authors or mods update posts" ON public.posts FOR UPDATE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

DROP POLICY IF EXISTS "Authors or mods delete posts" ON public.posts;
CREATE POLICY "Authors or mods delete posts" ON public.posts FOR DELETE USING (
  auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Reactions & Bookmarks Policies
DROP POLICY IF EXISTS "Reactions viewable" ON public.reactions;
CREATE POLICY "Reactions viewable" ON public.reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth users manage reactions" ON public.reactions;
CREATE POLICY "Auth users manage reactions" ON public.reactions FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Notifications & Audit Logs Policies
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Admins view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 11. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_threads_updated_at ON public.threads;
CREATE TRIGGER trg_threads_updated_at BEFORE UPDATE ON public.threads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.threads 
  SET replies_count = replies_count + 1,
      last_activity_at = NOW()
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_on_new_post ON public.posts;
CREATE TRIGGER trg_on_new_post AFTER INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_new_post();

-- Increment Thread Views RPC
CREATE OR REPLACE FUNCTION public.increment_thread_views(p_thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.threads
  SET views_count = views_count + 1
  WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. DEFAULT SEED CATEGORIES
INSERT INTO public.categories (id, title, name, slug, description, icon_name, color_code, order_index)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'ÖTV & Araç Alımı', 'ÖTV & Araç Alımı', 'otv-arac-alimi', '2026 ÖTV muafiyetli araç üst sınırı, tertibat kodları, bayi süreçleri ve emsal kararlar.', 'Car', '#2563EB', 1),
  ('22222222-2222-2222-2222-222222222222', 'Sağlık Kurulu Raporları', 'Sağlık Kurulu Raporları', 'saglik-kurulu-raporlari', 'Balthazard formülü, süreli/süresiz rapor yenileme, itiraz süreçleri ve hastane deneyimleri.', 'Stethoscope', '#059669', 2),
  ('33333333-3333-3333-3333-333333333333', 'Maaşlar & Devlet Destekleri', 'Maaşlar & Devlet Destekleri', 'maaslar-devlet-destekleri', '2022 engelli aylıkları, evde bakım yardımı kişi başı gelir sınırı ve sosyal ödemeler.', 'HeartPulse', '#D97706', 3),
  ('44444444-4444-4444-4444-444444444444', 'SGK & Erken Emeklilik', 'SGK & Erken Emeklilik', 'sgk-erken-emeklilik', 'Vergi indirimi ile yaştan muaf erken emeklilik, prim gün hesaplama ve malulen emeklilik.', 'Briefcase', '#E11D48', 4),
  ('55555555-5555-5555-5555-555555555555', 'EKPSS & Kamuda İstihdam', 'EKPSS & Kamuda İstihdam', 'ekpss-kamuda-istihdam', 'EKPSS sınav kılavuzu, kura çekimleri, nitelik kodları ve memur atanma süreçleri.', 'GraduationCap', '#7C3AED', 5),
  ('66666666-6666-6666-6666-666666666666', 'Medikal Ürünler & Protez/Ortez', 'Medikal Ürünler & Protez/Ortez', 'medikal-urunler-protez', 'SUT ödemeleri, tekerlekli sandalye bakımı, işitme cihazları ve SGK geri ödemeleri.', 'Shield', '#0891B2', 6),
  ('77777777-7777-7777-7777-777777777777', 'Sosyal Yaşam & Serbest Kürsü', 'Sosyal Yaşam & Serbest Kürsü', 'sosyal-yasam-serbest-kursu', 'Erişilebilir tatil mekanları, toplu taşıma deneyimleri, tanışma ve serbest sohbet.', 'Smile', '#4F46E5', 7)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color_code = EXCLUDED.color_code,
  order_index = EXCLUDED.order_index;

-- 13. REALTIME PUBLICATION
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.threads; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.posts; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications; EXCEPTION WHEN OTHERS THEN NULL; END $$;
