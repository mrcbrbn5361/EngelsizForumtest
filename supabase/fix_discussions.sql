-- EngelsizForum "Nuclear" Relationship & Type Fix
-- Bu betik, tüm engelleyici politikaları kaldırır, tipleri düzeltir ve her şeyi yeniden kurar.

DO $$ 
DECLARE
    r RECORD;
    target_tables TEXT[] := ARRAY['topics', 'comments', 'reactions', 'reports', 'bookmarks', 'user_badges', 'notifications', 'topic_tags'];
    t TEXT;
BEGIN 
    -- 1. ADIM: Kritik tablolardaki TÜM politikaları kaldır
    -- Not: pg_policies tablosu üzerinden dinamik olarak tüm politikaları siliyoruz.
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename = ANY(target_tables)) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;

    -- 2. ADIM: Tip Dönüşümleri (TEXT -> UUID)
    -- Bu adım, veritabanı seviyesinde ilişki kurulabilmesi için zorunludur.
    
    -- Topics
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'category_id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN category_id TYPE uuid USING category_id::uuid;
    END IF;

    -- Comments
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'topic_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN topic_id TYPE uuid USING topic_id::uuid;
    END IF;

    -- Reactions
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'reactions' AND column_name = 'user_id') = 'text' THEN
        ALTER TABLE public.reactions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;

    -- Bookmarks
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'bookmarks' AND column_name = 'user_id') = 'text' THEN
        ALTER TABLE public.bookmarks ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
    END IF;

    -- Reports
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'reporter_id') = 'text' THEN
        ALTER TABLE public.reports ALTER COLUMN reporter_id TYPE uuid USING reporter_id::uuid;
    END IF;

    -- 3. ADIM: Yabancı Anahtarları (Foreign Keys) Temizle ve Yeniden Ekle
    -- Topics
    ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_author_id_fkey;
    ALTER TABLE public.topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_category_id_fkey;
    ALTER TABLE public.topics ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

    -- Comments
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
    ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_topic_id_fkey;
    ALTER TABLE public.comments ADD CONSTRAINT comments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;

    -- Topic Tags
    ALTER TABLE public.topic_tags DROP CONSTRAINT IF EXISTS topic_tags_topic_id_fkey;
    ALTER TABLE public.topic_tags ADD CONSTRAINT topic_tags_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;

    -- 4. ADIM: RLS Politikalarını Yeniden Kur
    
    -- Topics
    CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Users can update own topics or staff" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());
    CREATE POLICY "Users can delete own topics or staff" ON public.topics FOR DELETE USING (auth.uid() = author_id OR public.is_staff());

    -- Comments
    CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Users can update own comments or staff" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.is_staff());

    -- Topic Tags
    CREATE POLICY "Topic tags are viewable by everyone" ON public.topic_tags FOR SELECT USING (true);
    CREATE POLICY "Topic authors can manage tags" ON public.topic_tags FOR ALL USING (
      EXISTS (SELECT 1 FROM public.topics WHERE id = topic_id AND (author_id = auth.uid() OR public.is_staff()))
    );

    -- Reactions
    CREATE POLICY "Reactions are viewable by everyone" ON public.reactions FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert reactions" ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can delete own reactions" ON public.reactions FOR DELETE USING (auth.uid() = user_id);

END $$;

-- 5. Önbelleği Zorla Yenile
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics - Database Schema Synchronized';
COMMENT ON TABLE public.comments IS 'EngelsizForum Comments - Database Schema Synchronized';
COMMENT ON TABLE public.profiles IS 'EngelsizForum Profiles - Master User Table';
