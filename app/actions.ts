'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const TOPIC_DELETE_FAILED = 'Konu silinirken bir hata oluştu.';

/**
 * Creates an authenticated Supabase server client bound to request cookies.
 */
async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Refreshes every cached view that may still list a topic.
 */
function revalidateTopicPaths(topicId: string) {
  revalidatePath('/discussions');
  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/');
}

/**
 * Server Action: Deletes a topic if the caller is its author or a staff member.
 * Every query runs with the caller's own session, so row-level security stays the gate.
 * Any failed lookup stops the action, and nothing is reported as deleted unless a
 * follow-up read confirms the row is gone. Caches are refreshed whenever a delete was attempted.
 */
export async function deleteTopicAction(topicId: string) {
  if (!topicId) {
    return { success: false, error: 'Geçersiz konu.' };
  }

  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  let deleteAttempted = false;

  try {
    const [topicLookup, profileLookup] = await Promise.all([
      supabase.from('topics').select('author_id').eq('id', topicId).maybeSingle(),
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    ]);

    if (topicLookup.error || profileLookup.error) {
      console.error('deleteTopicAction lookup failed:', topicLookup.error || profileLookup.error);
      return { success: false, error: TOPIC_DELETE_FAILED };
    }

    const topicRow = topicLookup.data;
    if (!topicRow) {
      return { success: false, error: 'Konu bulunamadı veya zaten silinmiş.' };
    }

    const isStaff = profileLookup.data?.role === 'admin' || profileLookup.data?.role === 'moderator';
    if (topicRow.author_id !== user.id && !isStaff) {
      return { success: false, error: 'Yalnızca konunun sahibi veya moderatörler silebilir.' };
    }

    deleteAttempted = true;
    const { error: deleteError } = await supabase.from('topics').delete().eq('id', topicId);
    if (deleteError) {
      console.error('deleteTopicAction delete failed:', deleteError);
      return { success: false, error: TOPIC_DELETE_FAILED };
    }

    const { data: topicLeft, error: checkError } = await supabase.from('topics').select('id').eq('id', topicId).maybeSingle();
    if (checkError) {
      console.error('deleteTopicAction check failed:', checkError);
      return { success: false, error: TOPIC_DELETE_FAILED };
    }
    if (topicLeft) {
      return { success: false, error: 'Konu silinemedi: bu işlem için yetkiniz yok.' };
    }
  } catch (err) {
    console.error('deleteTopicAction failed:', err);
    return { success: false, error: TOPIC_DELETE_FAILED };
  } finally {
    if (deleteAttempted) revalidateTopicPaths(topicId);
  }

  return { success: true };
}
