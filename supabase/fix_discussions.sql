-- EngelsizForum Robust Relationship & Type Fix
-- Run this script in your Supabase SQL Editor to fix connection between topics, comments and profiles.

-- 1. Fix Topics Table
DO $$ 
BEGIN 
    -- Convert author_id to uuid if it's text
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'topics' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.topics ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;

    -- Add author_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topics_author_id_fkey') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add category_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'topics_category_id_fkey') THEN
        ALTER TABLE public.topics ADD CONSTRAINT topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Fix Comments Table
DO $$ 
BEGIN 
    -- Convert author_id to uuid if it's text
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'author_id') = 'text' THEN
        ALTER TABLE public.comments ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
    END IF;

    -- Add author_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_author_id_fkey') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Add topic_id foreign key
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'comments_topic_id_fkey') THEN
        ALTER TABLE public.comments ADD CONSTRAINT comments_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Cache Refresh & Metadata
COMMENT ON TABLE public.topics IS 'EngelsizForum Topics - Corrected Types';
COMMENT ON TABLE public.profiles IS 'EngelsizForum Profiles - Relationship Target';

-- 4. Re-verify RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view topics" ON public.topics;
CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);

