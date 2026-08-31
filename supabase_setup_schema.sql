-- =====================================================================
-- ENGELSİZFORUM COMPREHENSIVE SUPABASE DATABASE SCHEMA
-- WITH ROW LEVEL SECURITY (RLS) POLICIES & AUTH SIGNUP TRIGGERS
-- =====================================================================

-- 1. BASE TABLES DEFINITION
-- ---------------------------------------------------------------------

-- Profiles: Holds user identity, rank, and platform roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    xp INTEGER DEFAULT 10,
    level INTEGER DEFAULT 1,
    reputation_points INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories: Scalable categorization structure
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_name TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics & Threads: Backward compatible forum discussion entities
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_solved BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_solved BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments & Posts: Support for replies under topics/threads
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions & Interactions
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction_type TEXT DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES public.threads(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations & Messaging Channels (For DM)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.voice_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL,
    wave_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    source_id UUID,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);


-- 2. DUAL-WRITE SYNCHRONIZATION TRIGGERS
-- ---------------------------------------------------------------------

-- Sync topics & threads
-- Since threads is a view, we only need an INSTEAD OF trigger on public.threads to redirect write/update/delete operations to public.topics.
-- No AFTER triggers are needed on topics to sync to threads view because the view dynamically reflects topics table anyway.

CREATE OR REPLACE FUNCTION public.sync_threads_to_topics()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.topics (id, category_id, author_id, title, slug, content, is_pinned, is_locked, is_solved, views_count, created_at, updated_at)
        VALUES (COALESCE(NEW.id, gen_random_uuid()), NEW.category_id, NEW.author_id, NEW.title, NEW.slug, NEW.content, NEW.is_pinned, NEW.is_locked, NEW.is_solved, NEW.views_count, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()))
        ON CONFLICT (id) DO UPDATE SET
            category_id = EXCLUDED.category_id,
            author_id = EXCLUDED.author_id,
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            content = EXCLUDED.content,
            is_pinned = EXCLUDED.is_pinned,
            is_locked = EXCLUDED.is_locked,
            is_solved = EXCLUDED.is_solved,
            views_count = EXCLUDED.views_count,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.topics SET
            category_id = NEW.category_id,
            author_id = NEW.author_id,
            title = NEW.title,
            slug = NEW.slug,
            content = NEW.content,
            is_pinned = NEW.is_pinned,
            is_locked = NEW.is_locked,
            is_solved = NEW.is_solved,
            views_count = NEW.views_count,
            updated_at = COALESCE(NEW.updated_at, NOW())
        WHERE id = OLD.id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM public.topics WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup any previous AFTER triggers that fail on views
DROP TRIGGER IF EXISTS trg_sync_topics_to_threads ON public.topics;
DROP TRIGGER IF EXISTS trg_sync_threads_to_topics ON public.threads;

-- Create INSTEAD OF trigger for write support on the threads view
CREATE TRIGGER trg_sync_threads_to_topics
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.threads
FOR EACH ROW EXECUTE FUNCTION public.sync_threads_to_topics();


-- Sync comments & posts
-- Since posts is a view, we only need an INSTEAD OF trigger on public.posts to redirect write/update/delete operations to public.comments.
-- No AFTER triggers are needed on comments to sync to posts view because the view dynamically reflects comments table anyway.

CREATE OR REPLACE FUNCTION public.sync_posts_to_comments()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.comments (id, topic_id, thread_id, author_id, content, is_solution, created_at, updated_at)
        VALUES (COALESCE(NEW.id, gen_random_uuid()), NEW.topic_id, NEW.thread_id, NEW.author_id, NEW.content, NEW.is_solution, COALESCE(NEW.created_at, NOW()), COALESCE(NEW.updated_at, NOW()))
        ON CONFLICT (id) DO UPDATE SET
            topic_id = EXCLUDED.topic_id,
            thread_id = EXCLUDED.thread_id,
            author_id = EXCLUDED.author_id,
            content = EXCLUDED.content,
            is_solution = EXCLUDED.is_solution,
            updated_at = EXCLUDED.updated_at;
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.comments SET
            topic_id = NEW.topic_id,
            thread_id = NEW.thread_id,
            author_id = NEW.author_id,
            content = NEW.content,
            is_solution = NEW.is_solution,
            updated_at = COALESCE(NEW.updated_at, NOW())
        WHERE id = OLD.id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM public.comments WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup any previous AFTER triggers that fail on views
DROP TRIGGER IF EXISTS trg_sync_comments_to_posts ON public.comments;
DROP TRIGGER IF EXISTS trg_sync_posts_to_comments ON public.posts;

-- Create INSTEAD OF trigger for write support on the posts view
CREATE TRIGGER trg_sync_posts_to_comments
INSTEAD OF INSERT OR UPDATE OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.sync_posts_to_comments();


-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories Policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Only admins can manage categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Topics Policies
CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Logged in users can create topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or staff can update topics" ON public.topics FOR UPDATE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);
CREATE POLICY "Authors or staff can delete topics" ON public.topics FOR DELETE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Logged in users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors or staff can update comments" ON public.comments FOR UPDATE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);
CREATE POLICY "Authors or staff can delete comments" ON public.comments FOR DELETE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Reactions Policies
CREATE POLICY "Reactions are viewable by everyone" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

-- Reports Policies
CREATE POLICY "Logged in users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Only staff can manage reports" ON public.reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

-- Conversations Policies
CREATE POLICY "Conversations are viewable by members" ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = id AND user_id = auth.uid())
);

-- Conversation Members Policies
CREATE POLICY "Memberships are viewable by participants" ON public.conversation_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members AS cm WHERE cm.conversation_id = conversation_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Users can add memberships" ON public.conversation_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can remove their own memberships" ON public.conversation_members FOR DELETE USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Messages are viewable by conversation participants" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Conversation participants can send messages" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- Voice Messages Policies
CREATE POLICY "Voice messages are viewable by recipients" ON public.voice_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.messages AS msg
        JOIN public.conversation_members AS cm ON cm.conversation_id = msg.conversation_id
        WHERE msg.id = message_id AND cm.user_id = auth.uid()
    )
);

-- Notifications Policies
CREATE POLICY "Notifications are viewable by receiver" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can trigger notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Follows Policies
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);


-- 4. AUTH USERS SIGNUP PROFILE GENERATOR TRIGGER
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_username TEXT;
    clean_display_name TEXT;
BEGIN
    -- Extract username from email
    default_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g'));
    
    -- Ensure username is not empty
    IF default_username = '' THEN
        default_username := 'user_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 5);
    END IF;

    -- Handle potential username collision by appending random chars if exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = default_username) THEN
        default_username := default_username || '_' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 4);
    END IF;

    clean_display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', default_username);

    INSERT INTO public.profiles (id, username, display_name, full_name, avatar_url, role, xp, level, created_at, last_seen_at)
    VALUES (
        NEW.id,
        default_username,
        clean_display_name,
        clean_display_name,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        CASE WHEN NEW.email = 'miracbirben@gmail.com' THEN 'admin' ELSE 'user' END,
        10,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. INITIAL DATA SEEDING (KATEGORİLER)
-- ---------------------------------------------------------------------

INSERT INTO public.categories (id, name, slug, description, icon_name, order_index)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Haklar ve Mevzuat', 'haklar-ve-mevzuat', 'Engelli hakları, yasal süreçler, SGK, ÖTV muafiyeti ve istihdam rehberleri.', 'Scale', 1),
    ('22222222-2222-2222-2222-222222222222', 'Sağlık ve Medikal', 'saglik-ve-medikal', 'Sağlık raporları, tedavi süreçleri, medikal donanım ve rehabilitasyon.', 'HeartPulse', 2),
    ('33333333-3333-3333-3333-333333333333', 'Erişilebilirlik ve Teknoloji', 'erisilebilirlik-ve-teknoloji', 'Ekran okuyucular, yardımcı yazılımlar ve erişilebilir yaşam çözümleri.', 'Accessibility', 3),
    ('44444444-4444-4444-4444-444444444444', 'Sosyal Yaşam ve Dayanışma', 'sosyal-yasam-ve-dayanisma', 'Sosyal aktiviteler, deneyim paylaşımları, spor, sanat ve dayanışma ağları.', 'Users', 4)
ON CONFLICT (id) DO NOTHING;
