-- ==============================================================================
-- ENGELSİZFORUM - PHASE 3 PREFLIGHT, VALIDATION & NEGATIVE TEST SUITE
-- File: supabase/tests/phase3_permissions_tests.sql
-- Description: Run this in Supabase SQL Editor before and after applying
--              20260818000001_phase3_auth_profile_privacy_permissions.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PREFLIGHT HEALTH CHECK (Run BEFORE migration)
-- ------------------------------------------------------------------------------
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if phase 2 functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_staff', 'increment_views', 'toggle_topic_solution');

-- ------------------------------------------------------------------------------
-- 2. POSTFLIGHT VERIFICATION (Run AFTER applying Phase 3 migration)
-- ------------------------------------------------------------------------------

-- A. Verify new columns exist in profiles
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('account_status', 'status_reason', 'suspended_until', 'privacy_settings', 'notification_prefs');

-- B. Verify new tables exist and have RLS enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('category_moderators', 'community_moderators');

-- C. Verify new functions exist with SECURITY DEFINER
SELECT 
  proname, 
  prosecdef, 
  proconfig 
FROM pg_proc 
WHERE proname IN ('is_account_active', 'has_category_permission', 'prevent_profile_role_escalation');

-- D. Verify triggers
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'trg_prevent_profile_role_escalation';

-- ------------------------------------------------------------------------------
-- 3. RLS & PERMISSIONS BEHAVIOR TESTS (Simulated in SQL Editor)
-- ------------------------------------------------------------------------------

DO $$
DECLARE
  v_test_uid UUID := gen_random_uuid();
  v_cat_id UUID := gen_random_uuid();
  v_res BOOLEAN;
BEGIN
  RAISE NOTICE '>>> Starting Phase 3 Validation Tests <<<';

  -- Test 1: Non-existent or NULL user is_account_active
  v_res := public.is_account_active(NULL);
  ASSERT v_res = FALSE, 'Test 1 Failed: NULL user should not be active';

  -- Test 2: NULL category permission check
  v_res := public.has_category_permission(NULL, NULL);
  ASSERT v_res = FALSE, 'Test 2 Failed: NULL category/user should not have permission';

  RAISE NOTICE '>>> Phase 3 Validation Tests: ALL INTERNAL ASSERTS PASSED <<<';
END $$;
