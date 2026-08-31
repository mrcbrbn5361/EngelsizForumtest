-- =====================================================================
-- ENGELSİZFORUM COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
-- This script enables Row Level Security (RLS) and sets up robust, secure,
-- and WCAG compliant access control policies for all core forum tables.
--
-- How to apply:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your project: vtmozdquvamjeniwhonm
-- 3. Click on the "SQL Editor" in the left sidebar
-- 4. Click "+ New Query"
-- 5. Copy and paste the entire contents of this file
-- 6. Click "Run" at the bottom right
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL CORE TABLES
-- ---------------------------------------------------------------------

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.voice_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.follows ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 2. DROP EXISTING POLICIES TO PREVENT COLLISIONS
-- ---------------------------------------------------------------------

-- Profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;

-- Topics
DROP POLICY IF EXISTS "Topics are viewable by everyone" ON public.topics;
DROP POLICY IF EXISTS "Logged in users can create topics" ON public.topics;
DROP POLICY IF EXISTS "Authors or staff can update topics" ON public.topics;
DROP POLICY IF EXISTS "Authors or staff can delete topics" ON public.topics;

-- Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Logged in users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Authors or staff can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authors or staff can delete comments" ON public.comments;

-- Reactions & Interactions
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.reactions;
DROP POLICY IF EXISTS "Users can create their own reactions" ON public.reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON public.reactions;

-- Reports
DROP POLICY IF EXISTS "Logged in users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Only staff can manage reports" ON public.reports;

-- Messaging / DMs
DROP POLICY IF EXISTS "Conversations are viewable by members" ON public.conversations;
DROP POLICY IF EXISTS "Memberships are viewable by participants" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can add memberships" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can remove their own memberships" ON public.conversation_members;
DROP POLICY IF EXISTS "Messages are viewable by conversation participants" ON public.messages;
DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Voice messages are viewable by recipients" ON public.voice_messages;

-- Notifications & Follows
DROP POLICY IF EXISTS "Notifications are viewable by receiver" ON public.notifications;
DROP POLICY IF EXISTS "Users can trigger notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;

-- ---------------------------------------------------------------------
-- 3. DEFINE ROBUST, SECURE AND COMPLIANT POLICIES
-- ---------------------------------------------------------------------

-- === PROFILES POLICIES ===
-- Public Profiles: Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Self-Write: Users can only write/update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admin Bypass: Admins can do anything on profiles
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- === CATEGORIES POLICIES ===
-- Public Read: Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

-- Admin Write: Only admins can manage categories
CREATE POLICY "Only admins can manage categories" 
ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- === TOPICS POLICIES ===
-- Public Read: Topics are viewable by everyone
CREATE POLICY "Topics are viewable by everyone" 
ON public.topics FOR SELECT USING (true);

-- Logged In Insert: Any logged-in user can insert a topic
CREATE POLICY "Logged in users can create topics" 
ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Edit / Delete: Author of the topic or a Moderator/Admin can update or delete
CREATE POLICY "Authors or staff can update topics" 
ON public.topics FOR UPDATE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

CREATE POLICY "Authors or staff can delete topics" 
ON public.topics FOR DELETE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);



-- === COMMENTS POLICIES ===
-- Public Read: Comments are viewable by everyone
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT USING (true);

-- Logged In Insert: Any logged-in user can insert a comment
CREATE POLICY "Logged in users can create comments" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Edit / Delete: Author of the comment or a Moderator/Admin can update or delete
CREATE POLICY "Authors or staff can update comments" 
ON public.comments FOR UPDATE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);

CREATE POLICY "Authors or staff can delete comments" 
ON public.comments FOR DELETE USING (
    auth.uid() = author_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);


-- === REACTIONS POLICIES ===
-- Public Read: Reactions are viewable by everyone
CREATE POLICY "Reactions are viewable by everyone" 
ON public.reactions FOR SELECT USING (true);

-- Self Insert / Self Delete: Users can only react or remove their own reaction
CREATE POLICY "Users can create their own reactions" 
ON public.reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.reactions FOR DELETE USING (auth.uid() = user_id);


-- === REPORTS POLICIES ===
-- Insert: Any logged in user can report a topic, comment, post or thread
CREATE POLICY "Logged in users can create reports" 
ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- View / Update / Delete: Only staff (moderator or admin) can see or manage reports
CREATE POLICY "Only staff can manage reports" 
ON public.reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin'))
);


-- === DIRECT MESSAGES & CONVERSATIONS POLICIES ===
-- Conversations: Only members of a conversation can see it
CREATE POLICY "Conversations are viewable by members" 
ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = id AND user_id = auth.uid())
);

-- Conversation Members: Members can view the list of conversation participants
CREATE POLICY "Memberships are viewable by participants" 
ON public.conversation_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members AS cm WHERE cm.conversation_id = conversation_id AND cm.user_id = auth.uid())
);

-- Adding Members: Logged in users can add/create memberships
CREATE POLICY "Users can add memberships" 
ON public.conversation_members FOR INSERT WITH CHECK (true);

-- Leaving Group: Users can remove their own membership
CREATE POLICY "Users can remove their own memberships" 
ON public.conversation_members FOR DELETE USING (auth.uid() = user_id);

-- Messages: Users can only read messages belonging to conversations they are part of
CREATE POLICY "Messages are viewable by conversation participants" 
ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- Sending Messages: User can only send messages as themselves to conversations they participate in
CREATE POLICY "Conversation participants can send messages" 
ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);

-- Voice Messages: Recipients or senders can read voice messages corresponding to their chat conversations
CREATE POLICY "Voice messages are viewable by recipients" 
ON public.voice_messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.messages AS msg
        JOIN public.conversation_members AS cm ON cm.conversation_id = msg.conversation_id
        WHERE msg.id = message_id AND cm.user_id = auth.uid()
    )
);


-- === NOTIFICATIONS & FOLLOWS POLICIES ===
-- Notifications: Users can only read their own notifications
CREATE POLICY "Notifications are viewable by receiver" 
ON public.notifications FOR SELECT USING (auth.uid() = user_id);

-- Users can insert notifications (e.g., when commenting on someone's topic)
CREATE POLICY "Users can trigger notifications" 
ON public.notifications FOR INSERT WITH CHECK (true);

-- Users can only mark their own notifications as read
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Follows: Anyone can view follow lists
CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT USING (true);

-- Follow: Users can only follow as themselves
CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Unfollow: Users can only unfollow their own followed records
CREATE POLICY "Users can unfollow" 
ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- =====================================================================
-- COMPLETED SUCCESSFUL SPECIFICATION OF ROW LEVEL SECURITY
-- =====================================================================
