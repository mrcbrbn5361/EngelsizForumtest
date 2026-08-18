-- ==============================================================================
-- ENGELSİZFORUM - PHASE 3 AUTH, PROFILES, PRIVACY, ACCESSIBILITY & RBAC HARDENING
-- File: supabase/migrations/20260818000001_phase3_auth_profile_privacy_permissions.sql
-- Description: Non-destructive enhancements for account status, profile privacy,
--              scoped category/community moderation, role escalation defense, and RLS.
-- ==============================================================================

-- 1. PROFILES ENHANCEMENTS (IDEMPOTENT)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS status_reason TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"show_email": false, "show_online_status": true, "show_activity": true, "allow_messages": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{"email_replies": true, "email_mentions": true, "email_digest": false, "in_app_notifications": true}'::jsonb;

-- Constraint check for valid account_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_status_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_status_check
      CHECK (account_status IN ('active', 'suspended', 'banned', 'deleted'));
  END IF;
END $$;

-- 2. SCOPED MODERATION TABLES (IDEMPOTENT)

-- Category Moderators
CREATE TABLE IF NOT EXISTS public.category_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_category_moderator UNIQUE (category_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cat_mods_cat ON public.category_moderators(category_id);
CREATE INDEX IF NOT EXISTS idx_cat_mods_user ON public.category_moderators(user_id);

-- Community Moderators (for communities module)
CREATE TABLE IF NOT EXISTS public.community_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'moderator' CHECK (role IN ('owner', 'moderator', 'contributor')),
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_community_moderator UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comm_mods_comm ON public.community_moderators(community_id);
CREATE INDEX IF NOT EXISTS idx_comm_mods_user ON public.community_moderators(user_id);

-- 3. SECURITY & PERMISSION HELPER FUNCTIONS

-- Helper: Verify account status is active
CREATE OR REPLACE FUNCTION public.is_account_active(uid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
  v_suspended_until TIMESTAMPTZ;
BEGIN
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT account_status, suspended_until
  INTO v_status, v_suspended_until
  FROM public.profiles
  WHERE id = uid;

  IF v_status IS NULL THEN
    RETURN TRUE;
  END IF;

  IF v_status = 'banned' OR v_status = 'deleted' THEN
    RETURN FALSE;
  END IF;

  IF v_status = 'suspended' THEN
    IF v_suspended_until IS NOT NULL AND v_suspended_until < NOW() THEN
      -- Suspension period has expired
      RETURN TRUE;
    END IF;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.is_account_active(UUID) TO authenticated, anon;

-- Helper: Check category-specific moderation permission
CREATE OR REPLACE FUNCTION public.has_category_permission(cat_id UUID, uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF uid IS NULL OR cat_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Global staff members have permission over all categories
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid AND role IN ('admin', 'moderator', 'system')
  ) THEN
    RETURN TRUE;
  END IF;

  -- Scoped category moderator check
  RETURN EXISTS (
    SELECT 1 FROM public.category_moderators
    WHERE category_id = cat_id AND user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION public.has_category_permission(UUID, UUID) TO authenticated, anon;

-- 4. ANTI-PRIVILEGE ESCALATION TRIGGER FOR PROFILES
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_admin BOOLEAN := FALSE;
BEGIN
  -- Check if caller is admin or internal DB system
  IF auth.uid() IS NOT NULL THEN
    SELECT (role = 'admin' OR role = 'system') INTO caller_is_admin
    FROM public.profiles
    WHERE id = auth.uid();
  ELSE
    caller_is_admin := TRUE;
  END IF;

  -- If caller is not admin, prevent tampering with privileged attributes
  IF NOT COALESCE(caller_is_admin, FALSE) THEN
    NEW.role := OLD.role;
    NEW.level := OLD.level;
    NEW.xp := OLD.xp;
    NEW.is_verified := OLD.is_verified;
    NEW.account_status := OLD.account_status;
    NEW.status_reason := OLD.status_reason;
    NEW.suspended_until := OLD.suspended_until;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES HARDENING

ALTER TABLE public.category_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderators ENABLE ROW LEVEL SECURITY;

-- Category Moderators RLS
DROP POLICY IF EXISTS "Category moderators viewable by everyone" ON public.category_moderators;
CREATE POLICY "Category moderators viewable by everyone"
  ON public.category_moderators FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage category moderators" ON public.category_moderators;
CREATE POLICY "Admins can manage category moderators"
  ON public.category_moderators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'system')
    )
  );

-- Community Moderators RLS
DROP POLICY IF EXISTS "Community moderators viewable by everyone" ON public.community_moderators;
CREATE POLICY "Community moderators viewable by everyone"
  ON public.community_moderators FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage community moderators" ON public.community_moderators;
CREATE POLICY "Admins can manage community moderators"
  ON public.community_moderators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'system')
    )
  );

-- Hardened Topic Insertion (Blocked for suspended/banned users)
DROP POLICY IF EXISTS "Authenticated users can create topics" ON public.topics;
CREATE POLICY "Authenticated users can create topics"
  ON public.topics FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    public.is_account_active(auth.uid())
  );

-- Hardened Topic Update with Scoped Category Moderation
DROP POLICY IF EXISTS "Authors and moderators can update topics" ON public.topics;
CREATE POLICY "Authors and moderators can update topics"
  ON public.topics FOR UPDATE
  TO authenticated
  USING (
    public.is_account_active(auth.uid()) AND (
      auth.uid() = author_id OR
      public.has_category_permission(category_id, auth.uid())
    )
  );

-- Hardened Comment Insertion (Blocked for suspended/banned users)
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id AND
    public.is_account_active(auth.uid())
  );

-- Hardened Comment Update with Scoped Moderation
DROP POLICY IF EXISTS "Authors and moderators can update comments" ON public.comments;
CREATE POLICY "Authors and moderators can update comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (
    public.is_account_active(auth.uid()) AND (
      auth.uid() = author_id OR
      public.is_staff()
    )
  );

-- Hardened Reactions (Blocked for suspended/banned users)
DROP POLICY IF EXISTS "Users can add reactions" ON public.reactions;
CREATE POLICY "Users can add reactions"
  ON public.reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    public.is_account_active(auth.uid())
  );
