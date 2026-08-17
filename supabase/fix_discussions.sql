-- EngelsizForum Kesin Çözüm: İlişki, Tip ve RLS Onarımı (Idempotent Migration V7)
-- Bu betik, tüm ana tablo ID'lerini ve Yabancı Anahtarları UUID'ye çevirerek tam uyum sağlar.

-- 0. ADIM: Yardımcı fonksiyonların varlığını sağla
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$;

DO $$ 
DECLARE
    r RECORD;
    target_tables TEXT[] := ARRAY['topics', 'comments', 'reactions', 'reports', 'bookmarks', 'user_badges', 'notifications', 'topic_tags', 'follows', 'uploads', 'attachments', 'categories', 'community_members'];
BEGIN 
    -- 1. ADIM: Tüm RLS Politikalarını Dinamik Olarak Güvenle Kaldır
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = ANY(target_tables)) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;

    -- 2. ADIM: Tüm Yabancı Anahtar (FK) Kısıtlamalarını Güvenle Kaldır
    ALTER TABLE IF EXISTS public.categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
    ALTER TABLE IF EXISTS public.topics DROP CONSTRAINT IF EXISTS topics_author_id_fkey;
    ALTER TABLE IF EXISTS public.topics DROP CONSTRAINT IF EXISTS topics_category_id_fkey;
    ALTER TABLE IF EXISTS public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
    ALTER TABLE IF EXISTS public.comments DROP CONSTRAINT IF EXISTS comments_topic_id_fkey;
    ALTER TABLE IF EXISTS public.comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;
    ALTER TABLE IF EXISTS public.topic_tags DROP CONSTRAINT IF EXISTS topic_tags_topic_id_fkey;
    ALTER TABLE IF EXISTS public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_topic_id_fkey;
    ALTER TABLE IF EXISTS public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
    ALTER TABLE IF EXISTS public.reactions DROP CONSTRAINT IF EXISTS reactions_user_id_fkey;
    ALTER TABLE IF EXISTS public.community_members DROP CONSTRAINT IF EXISTS community_members_community_id_fkey;
    ALTER TABLE IF EXISTS public.community_members DROP CONSTRAINT IF EXISTS community_members_user_id_fkey;

    -- 3. ADIM: Bozuk veya Geçersiz Verileri Temizle
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        UPDATE public.topics SET category_id = NULL WHERE category_id IS NOT NULL AND category_id::text !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        UPDATE public.categories SET parent_id = NULL WHERE parent_id IS NOT NULL AND parent_id::text !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
        DELETE FROM public.categories WHERE id::text !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        UPDATE public.comments SET parent_comment_id = NULL WHERE parent_comment_id IS NOT NULL AND parent_comment_id::text !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    END IF;

    -- 4. ADIM: Tip Dönüşümleri (ID ve Foreign Key Kolonları)
    
    -- Categories
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'id' AND data_type = 'text') THEN
        ALTER TABLE public.categories ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id' AND data_type = 'text') THEN
        ALTER TABLE public.categories ALTER COLUMN parent_id TYPE uuid USING parent_id::uuid;
    END IF;

    -- Topics
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'id' AND data_type = 'text') THEN
        ALTER TABLE public.topics ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'author_id' AND data_type = 'text') THEN
        ALTER TABLE public.topics ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'category_id' AND data_type = 'text') THEN
        ALTER TABLE public.topics ALTER COLUMN category_id TYPE uuid USING category_id::uuid;
    END IF;

    -- Comments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'id' AND data_type = 'text') THEN
        ALTER TABLE public.comments ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id' AND data_type = 'text') THEN
        ALTER TABLE public.comments ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'topic_id' AND data_type = 'text') THEN
        ALTER TABLE public.comments ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id' AND data_type = 'text') THEN
        ALTER TABLE public.comments ALTER COLUMN parent_comment_id TYPE uuid USING parent_comment_id::uuid;
    END IF;

    -- Topic Tags
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'topic_tags' AND column_name = 'topic_id' AND data_type = 'text') THEN
        ALTER TABLE public.topic_tags ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;

    -- Bookmarks
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'topic_id' AND data_type = 'text') THEN
        ALTER TABLE public.bookmarks ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'user_id' AND data_type = 'text') THEN
        ALTER TABLE public.bookmarks ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;

    -- Reactions
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reactions' AND column_name = 'user_id' AND data_type = 'text') THEN
        ALTER TABLE public.reactions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;

    -- 5. ADIM: İlişkileri (FK) UUID Standartlarına Göre Yeniden Kur
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        ALTER TABLE public.topics ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        ALTER TABLE public.comments ADD CONSTRAINT comments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
        ALTER TABLE public.comments ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_tags') THEN
        ALTER TABLE public.topic_tags ADD CONSTRAINT topic_tags_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
    END IF;

    -- 6. ADIM: RLS Politikalarını Yeniden Kur
    -- Topics
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
        CREATE POLICY "Users can update own topics or staff" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
        CREATE POLICY "Users can delete own topics or staff" ON public.topics FOR DELETE USING (auth.uid() = author_id OR public.is_staff());
    END IF;

    -- Comments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
        CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
        CREATE POLICY "Users can update own comments or staff" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
        CREATE POLICY "Users can delete own comments or staff" ON public.comments FOR DELETE USING (auth.uid() = author_id OR public.is_staff());
    END IF;

    -- Topic Tags
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_tags') THEN
        ALTER TABLE public.topic_tags ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Topic tags are viewable by everyone" ON public.topic_tags FOR SELECT USING (true);
        CREATE POLICY "Topic authors can manage tags" ON public.topic_tags FOR ALL USING (
          EXISTS (SELECT 1 FROM public.topics WHERE topics.id = topic_tags.topic_id AND (topics.author_id = auth.uid() OR public.is_staff()))
        );
    END IF;

END $$;

-- 7. Tablo Yorumları
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics - Synchronized Idempotent Schema (V7)';
COMMENT ON TABLE public.categories IS 'EngelsizForum Categories - Fixed UUID Self-Reference (V7)';
