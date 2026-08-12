-- EngelsizForum - Professional Database Schema (Supabase / PostgreSQL)
-- WCAG 2.1 AAA Compliant & Enterprise Grade RLS

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. PROFILES TABLE
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

-- 2. CATEGORIES TABLE
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

-- 3. THREADS (TOPICS) TABLE
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

-- Backward compatibility alias view/table if needed
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

-- 4. POSTS (REPLIES) TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_meta JSONB DEFAULT '[]'::jsonb,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'support', 'helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reaction_target_check CHECK (thread_id IS NOT NULL OR post_id IS NOT NULL)
);

-- 6. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, thread_id)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'reply', 'mention', 'solution', 'system'
  reference_id UUID, -- thread_id or post_id
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_threads_category ON public.threads(category_id);
CREATE INDEX IF NOT EXISTS idx_threads_author ON public.threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_last_activity ON public.threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_thread ON public.posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_reactions_thread ON public.reactions(thread_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);

-- FULL TEXT SEARCH INDEX
CREATE INDEX IF NOT EXISTS idx_threads_fts ON public.threads USING gin(to_tsvector('turkish', title || ' ' || content));

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Threads Policies
CREATE POLICY "Threads are viewable by everyone" ON public.threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create threads" ON public.threads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors or moderators can update threads" ON public.threads FOR UPDATE USING (
  auth.uid() = author_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Posts Policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors or moderators can update posts" ON public.posts FOR UPDATE USING (
  auth.uid() = author_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Reactions Policies
CREATE POLICY "Reactions viewable by everyone" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage own reactions" ON public.reactions FOR ALL USING (auth.uid() = user_id);

-- Bookmarks Policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);

-- Audit Logs Policies
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TRIGGERS & FUNCTIONS

-- 1. Update updated_at column automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_threads_updated_at
BEFORE UPDATE ON public.threads
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Update thread replies_count and last_activity_at when post is created
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

CREATE OR REPLACE TRIGGER trg_on_new_post
AFTER INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.handle_new_post();

-- DEFAULT CATEGORIES SEED DATA
INSERT INTO public.categories (id, title, name, slug, description, icon_name, color_code, order_index)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Erişilebilirlik & Teknoloji', 'Erişilebilirlik & Teknoloji', 'erisilebilirlik-teknoloji', 'Ekran okuyucular, biyonik okuma, sesli komut ve yardımcı teknolojiler üzerine tartışmalar.', 'accessibility', '#2563EB', 1),
  ('22222222-2222-2222-2222-222222222222', 'Haklar & Legal Mevzuat', 'Haklar & Legal Mevzuat', 'haklar-mevzuat', 'Engelli hakları, kamu erişilebilirliği, istihdam ve resmi mevzuat rehberi.', 'shield-check', '#059669', 2),
  ('33333333-3333-3333-3333-333333333333', 'Eğitim & Kariyer', 'Eğitim & Kariyer', 'egitim-kariyer', 'Erişilebilir eğitim materyalleri, uzaktan çalışma ve kariyer fırsatları.', 'briefcase', '#D97706', 3),
  ('44444444-4444-4444-4444-444444444444', 'Yaşam & Deneyimler', 'Yaşam & Deneyimler', 'yasam-deneyimler', 'Mekânsal erişilebilirlik, toplu taşıma, günlük yaşam çözümleri ve sosyal tecrübeler.', 'heart', '#E11D48', 4),
  ('55555555-5555-5555-5555-555555555555', 'Genel Topluluk', 'Genel Topluluk', 'genel-topluluk', 'Tanışma, serbest sohbetler, duyurular ve topluluk geribildirimleri.', 'message-square', '#7C3AED', 5)
ON CONFLICT (slug) DO NOTHING;

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
