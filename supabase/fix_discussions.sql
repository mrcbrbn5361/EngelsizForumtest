-- EngelsizForum Kesin Çözüm: İlişki ve Tip Onarımı (V6 - Final)
-- Bu betik, tüm ana tablo ID'lerini ve Yabancı Anahtarları UUID'ye çevirerek tam uyum sağlar.

DO $$ 
DECLARE
    r RECORD;
    -- Tüm etkilenen tablolar
    target_tables TEXT[] := ARRAY['topics', 'comments', 'reactions', 'reports', 'bookmarks', 'user_badges', 'notifications', 'topic_tags', 'follows', 'uploads', 'attachments', 'categories'];
BEGIN 
    -- 1. ADIM: Tüm RLS Politikalarını Dinamik Olarak Kaldır
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = ANY(target_tables)) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;

    -- 2. ADIM: Tüm Yabancı Anahtar (FK) Kısıtlamalarını Kaldır
    ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
    ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_author_id_fkey;
    ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_category_id_fkey;
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_topic_id_fkey;
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;
    ALTER TABLE public.topic_tags DROP CONSTRAINT IF EXISTS topic_tags_topic_id_fkey;
    ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_topic_id_fkey;
    ALTER TABLE public.bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
    ALTER TABLE public.reactions DROP CONSTRAINT IF EXISTS reactions_user_id_fkey;

    -- 3. ADIM: Bozuk Verileri Temizle
    UPDATE public.topics SET category_id = NULL WHERE category_id = 'all' OR category_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    UPDATE public.categories SET parent_id = NULL WHERE parent_id = 'all' OR parent_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    UPDATE public.comments SET parent_comment_id = NULL WHERE parent_comment_id = 'all' OR parent_comment_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    DELETE FROM public.categories WHERE id::text = 'all' OR id::text !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

    -- 4. ADIM: Tip Dönüşümleri (ID ve Foreign Key Kolonları)
    
    -- Categories
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'id') = 'text' THEN
        ALTER TABLE public.categories ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id') = 'text' THEN
        ALTER TABLE public.categories ALTER COLUMN parent_id TYPE uuid USING parent_id::uuid;
    END IF;

    -- Topics (Önce ID, sonra FK'lar)
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'category_id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN category_id TYPE uuid USING category_id::uuid;
    END IF;

    -- Comments
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN id TYPE uuid USING id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'topic_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'parent_comment_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN parent_comment_id TYPE uuid USING parent_comment_id::uuid;
    END IF;

    -- Topic Tags
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topic_tags' AND column_name = 'topic_id') = 'text' THEN
        ALTER TABLE public.topic_tags ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;

    -- Bookmarks
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'topic_id') = 'text' THEN
        ALTER TABLE public.bookmarks ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'user_id') = 'text' THEN
        ALTER TABLE public.bookmarks ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;

    -- Reactions
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'reactions' AND column_name = 'user_id') = 'text' THEN
        ALTER TABLE public.reactions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;

    -- 5. ADIM: İlişkileri (FK) UUID Standartlarına Göre Yeniden Kur
    ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;
    
    ALTER TABLE public.topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.topics ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    
    ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.comments ADD CONSTRAINT comments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
    ALTER TABLE public.comments ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE SET NULL;
    
    ALTER TABLE public.topic_tags ADD CONSTRAINT topic_tags_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;

    -- 6. ADIM: RLS Politikalarını Yeniden Kur
    -- Topics
    CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Users can update own topics or staff" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
    CREATE POLICY "Users can delete own topics or staff" ON public.topics FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

    -- Comments
    CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Users can update own comments or staff" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
    CREATE POLICY "Users can delete own comments or staff" ON public.comments FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

    -- Topic Tags
    CREATE POLICY "Topic tags are viewable by everyone" ON public.topic_tags FOR SELECT USING (true);
    CREATE POLICY "Topic authors can manage tags" ON public.topic_tags FOR ALL USING (
      EXISTS (SELECT 1 FROM public.topics WHERE topics.id = topic_tags.topic_id AND (topics.author_id = auth.uid() OR public.is_staff()))
    );

END $$;

-- 7. Önbellek Yenileme
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics - Database Schema Synchronized (V6)';
COMMENT ON TABLE public.categories IS 'EngelsizForum Categories - Fixed UUID Self-Reference (V6)';
