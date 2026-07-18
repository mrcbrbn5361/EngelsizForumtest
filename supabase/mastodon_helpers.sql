-- 🐘 MASTODON / ACTIVITYPUB & GAMIFICATION INTEGRATION HELPERS
-- Execute this SQL script in your Supabase SQL Editor to support the Mastodon API integration!

-- =========================================================================
-- 1. INCREMENT USER XP & HANDLE LEVEL UPS
-- =========================================================================
-- Every 200 XP advances the user to the next level: Level = 1 + floor(XP / 200)
-- This function runs securely as SECURITY DEFINER to bypass standard RLS restrictions.

CREATE OR REPLACE FUNCTION public.increment_user_xp(user_id uuid, xp_amount integer)
RETURNS void AS $$
DECLARE
    current_xp integer;
    new_xp integer;
    new_level integer;
BEGIN
    -- 1. Get the current XP from the profiles table
    SELECT COALESCE(xp, 0) INTO current_xp FROM public.profiles WHERE id = user_id;
    
    -- 2. Calculate the new total XP
    new_xp := current_xp + xp_amount;
    
    -- 3. Calculate new level (200 XP per level)
    new_level := 1 + (new_xp / 200);
    
    -- 4. Update the user profile with new XP, Level, and updated timestamp
    UPDATE public.profiles
    SET xp = new_xp,
        level = new_level,
        updated_at = now()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.increment_user_xp(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_xp(uuid, integer) TO service_role;


-- =========================================================================
-- 2. INCREMENT TOPIC COMMENTS COUNT
-- =========================================================================
-- Increments the comments_count column on topics when comments are created.
-- This function runs securely as SECURITY DEFINER.

CREATE OR REPLACE FUNCTION public.increment_comments_count(topic_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.topics
    SET comments_count = COALESCE(comments_count, 0) + 1,
        updated_at = now()
    WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.increment_comments_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_comments_count(uuid) TO service_role;


-- =========================================================================
-- COMMENT / EXPLANATION
-- =========================================================================
-- These two database RPC endpoints are used dynamically by the stateless
-- Mastodon status and activity endpoints to guarantee gamification rewards
-- and comment synchronizations when posts or replies are submitted.
