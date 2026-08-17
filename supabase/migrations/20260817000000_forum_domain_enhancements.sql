-- ==============================================================================
-- ENGELSİZFORUM - COMPLETE FULLSTACK SUPABASE MIGRATION
-- ==============================================================================
-- Migration Dependency Order:
-- 1. Core Profile & Auth Extensions
-- 2. Forum Domain (Categories, Communities, Tags, Topics, Comments)
-- 3. Social & Interactions (Votes, Bookmarks, Follows, Conversations, Messages)
-- 4. Moderation & Audit (Reports, Moderation Actions, Audit Logs)
-- 5. AI Agents & MCP Infrastructure (Tools, Permissions, Workflow Executions)
-- ==============================================================================

-- 1. CORE PROFILES & USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  disability_type TEXT,
  accessibility_preferences JSONB DEFAULT '{}'::jsonb,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  xp_points INT DEFAULT 0,
  reputation_badge TEXT DEFAULT 'Acemi Yazar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FORUM DOMAIN EXTENSIONS
ALTER TABLE public.topics 
  ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS solution_comment_id UUID REFERENCES public.comments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS solved_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.comments 
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE DEFAULT NULL;

-- 3. SOCIAL & INTERACTION TABLES
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_conv_member UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_audio BOOLEAN DEFAULT false,
  audio_url TEXT,
  duration NUMERIC DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_topic_bookmark UNIQUE (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'comment', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI AGENTS & MCP INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mcp_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  input_schema JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  required_role TEXT DEFAULT 'user',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mcp_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  input_payload JSONB,
  output_payload JSONB,
  execution_status TEXT NOT NULL,
  execution_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_topics_community ON public.topics(community_id);
CREATE INDEX IF NOT EXISTS idx_topics_is_solved ON public.topics(is_solved);
CREATE INDEX IF NOT EXISTS idx_topics_is_pinned ON public.topics(is_pinned);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_mcp_audit_tool ON public.mcp_audit_logs(tool_name);

-- 6. RPC FOR TOGGLING TOPIC SOLUTION
CREATE OR REPLACE FUNCTION public.toggle_topic_solution(
  p_topic_id UUID,
  p_comment_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_current_solved BOOLEAN;
BEGIN
  SELECT is_solved INTO v_current_solved FROM public.topics WHERE id = p_topic_id;

  IF v_current_solved THEN
    UPDATE public.topics 
    SET is_solved = false, solution_comment_id = NULL, solved_at = NULL 
    WHERE id = p_topic_id;
    
    UPDATE public.comments 
    SET is_solution = false 
    WHERE topic_id = p_topic_id;
  ELSE
    UPDATE public.comments 
    SET is_solution = false 
    WHERE topic_id = p_topic_id;

    UPDATE public.comments 
    SET is_solution = true 
    WHERE id = p_comment_id;

    UPDATE public.topics 
    SET is_solved = true, solution_comment_id = p_comment_id, solved_at = NOW() 
    WHERE id = p_topic_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.toggle_topic_solution(UUID, UUID) TO authenticated, anon, service_role;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Profiles RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles viewable' AND tablename = 'profiles') THEN
    CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Bookmarks RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own bookmarks' AND tablename = 'bookmarks') THEN
    CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Notifications RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users view own notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Reports RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users create reports' AND tablename = 'reports') THEN
    CREATE POLICY "Users create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
  END IF;
END $$;

-- VERIFICATION QUERY FOR DASHBOARD / SQL EDITOR:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

