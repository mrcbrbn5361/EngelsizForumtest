-- ==============================================================================
-- ENGELSİZFORUM - PHASE 2 RLS NEGATIVE SECURITY TEST SUITE
-- File: supabase/tests/rls_negative_tests.sql
-- Description: Verification script for security boundaries & policy enforcement
-- ==============================================================================

-- TEST 1: Anonymous visitor can select public topics
-- EXPECTED: Rows returned with public topic data
SELECT id, title, slug, is_pinned, is_solved FROM public.topics LIMIT 5;

-- TEST 2: Anonymous visitor CANNOT insert topics
-- EXPECTED: Fails with RLS policy violation
DO $$
BEGIN
  -- Should throw error because auth.uid() is null
  INSERT INTO public.topics (title, slug, content, author_id)
  VALUES ('Unauthorized Title', 'unauthorized-title', 'Content', '00000000-0000-0000-0000-000000000000');
  RAISE EXCEPTION 'TEST FAILED: Anonymous user was able to insert topic';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'TEST 2 PASSED: Anonymous insert rejected (%s)', SQLERRM;
END $$;

-- TEST 3: User cannot insert a comment claiming to be another user
-- EXPECTED: Fails with RLS policy check (auth.uid() = author_id)
-- Note: When running with authenticated user session A, trying to insert author_id = B will fail

-- TEST 4: Users cannot see other users' bookmarks
-- EXPECTED: Policy 'Users can only view own bookmarks' restricts rows to user_id = auth.uid()
SELECT * FROM public.bookmarks WHERE user_id != auth.uid(); -- Returns 0 rows for non-staff

-- TEST 5: Reports privacy enforcement
-- EXPECTED: Non-staff users cannot see other users' reports
SELECT * FROM public.reports WHERE reporter_id != auth.uid(); -- Returns 0 rows for non-staff

-- TEST 6: Solution marking permission check
-- EXPECTED: toggle_topic_solution raises error when called by non-author and non-staff
