-- EngelsizForum Robust Relationship Fix
-- Run this script in your Supabase SQL Editor to fix connection between topics and profiles.

-- 1. Topics Table Fixes
DO $$ 
BEGIN 
    -- Check and add author_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topics_author_id_fkey') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Check and add category_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topics_category_id_fkey') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Comments Table Fixes
DO $$ 
BEGIN 
    -- Check and add author_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_author_id_fkey') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Check and add topic_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_topic_id_fkey') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Trigger PostgREST cache reload by touching the table comments
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics';
COMMENT ON TABLE public.profiles IS 'EngelsizForum Profiles';

-- 4. Enable RLS and verify policies
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view topics" ON public.topics;
CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create topics" ON public.topics;
CREATE POLICY "Users can create topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their topics" ON public.topics;
CREATE POLICY "Authors can update their topics" ON public.topics FOR UPDATE USING (auth.uid() = author_id);
