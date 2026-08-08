-- EngelsizForum Kapsamlı İlişki ve Tip Onarımı
-- Bu betik, 'author_id' kolonlarını UUID tipine çevirir ve tablolar arası bağlantıları kurar.

DO $$ 
BEGIN 
    -- 1. Bağımlı Politikaları Temizle (Tip değişimine engel olmamaları için)
    DROP POLICY IF EXISTS "Anyone can view topics" ON public.topics;
    DROP POLICY IF EXISTS "Users can create topics" ON public.topics;
    DROP POLICY IF EXISTS "Authors can update their topics" ON public.topics;
    DROP POLICY IF EXISTS "Authenticated users can insert topics" ON public.topics;
    DROP POLICY IF EXISTS "Users can update own topics" ON public.topics;
    
    DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
    DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
    DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
    DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

    -- 2. Topics Tablosu Tip Dönüşümü (TEXT -> UUID)
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;

    -- 3. Comments Tablosu Tip Dönüşümü (TEXT -> UUID)
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;

    -- 4. Yabancı Anahtar Kısıtlamalarını Ekle
    -- Topics -> Profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topics_author_id_fkey') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Topics -> Categories
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topics_category_id_fkey') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;

    -- Comments -> Profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_author_id_fkey') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Comments -> Topics
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_topic_id_fkey') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
    END IF;

    -- 5. RLS Politikalarını Yeniden Tanımla
    -- Topics Politikaları
    CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Users can update own topics" ON public.topics FOR UPDATE USING (auth.uid() = author_id);

    -- Comments Politikaları
    CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
    CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
    CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
    CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);

END $$;

-- 6. Önbelleği Yenile
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics - Type Fix Applied';
COMMENT ON TABLE public.comments IS 'EngelsizForum Comments - Type Fix Applied';
