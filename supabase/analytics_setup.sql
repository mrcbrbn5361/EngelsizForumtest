-- 📊 ANALYTICS & ADMIN ENHANCEMENT FOR TEKNOFEST
-- Run this in Supabase SQL Editor to enable real-time tracking and admin permissions.

-- 1. Ensure the table has user_id for member tracking
ALTER TABLE public.analytics_visitors 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create API Settings table to store secure tokens
CREATE TABLE IF NOT EXISTS public.api_settings (
    key_name TEXT PRIMARY KEY,
    key_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed initial API key (User should change this in Supabase UI)
INSERT INTO public.api_settings (key_name, key_value)
VALUES ('admin_stats_token', 'teknofest2024_guclu_proje_token')
ON CONFLICT (key_name) DO NOTHING;

-- 3. Grant Admin/Staff Permissions to specified emails
-- This will update the profiles table for users who have already signed up
UPDATE public.profiles
SET 
    role = 'admin',
    is_staff = TRUE
FROM auth.users
WHERE profiles.id = auth.users.id
AND auth.users.email IN (
    'miracbirben@gmail.com', 
    'brtapardi@gmail.com', 
    'yigitfirat3405@gmail.com', 
    'muratcancicek0@gmail.com'
);

-- 4. Automatic Admin Role for specific emails on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'user';
  v_is_staff BOOLEAN := FALSE;
BEGIN
  -- Check if user should be admin
  IF NEW.email IN (
    'miracbirben@gmail.com', 
    'brtapardi@gmail.com', 
    'yigitfirat3405@gmail.com', 
    'muratcancicek0@gmail.com'
  ) THEN
    v_role := 'admin';
    v_is_staff := TRUE;
  END IF;

  INSERT INTO public.profiles (id, username, full_name, avatar_url, role, is_staff)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Yeni Kullanıcı'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    v_role,
    v_is_staff
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-assign trigger to make sure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Update track_visitor to support member tracking
CREATE OR REPLACE FUNCTION track_visitor(p_session_id TEXT, p_user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO public.analytics_visitors (session_id, user_id, last_active_at)
  VALUES (p_session_id, p_user_id, timezone('utc'::text, now()))
  ON CONFLICT (session_id) 
  DO UPDATE SET 
    last_active_at = EXCLUDED.last_active_at,
    user_id = COALESCE(EXCLUDED.user_id, analytics_visitors.user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function for Raspberry Pi / Admin Stats API
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  total_visitors BIGINT;
  active_visitors BIGINT;
  active_members BIGINT;
  active_guests BIGINT;
BEGIN
  -- Total unique sessions
  SELECT count(*) INTO total_visitors FROM public.analytics_visitors;
  
  -- Active in last 5 minutes
  SELECT count(*) INTO active_visitors 
  FROM public.analytics_visitors 
  WHERE last_active_at > (now() - interval '5 minutes');
  
  -- Active members (user_id not null)
  SELECT count(*) INTO active_members 
  FROM public.analytics_visitors 
  WHERE last_active_at > (now() - interval '5 minutes') AND user_id IS NOT NULL;
  
  active_guests := active_visitors - active_members;
  
  RETURN json_build_object(
    'total_visitors', total_visitors,
    'active_visitors', active_visitors,
    'active_members', active_members,
    'active_guests', active_guests,
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
