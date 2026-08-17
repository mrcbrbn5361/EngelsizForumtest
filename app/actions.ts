'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import { generateUUID, slugify } from '@/lib/utils';

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
 * Server Action: Creates a new topic safely checking user session.
 */
export async function createTopicAction(formData: {
  title: string;
  categoryId: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  isLocked?: boolean;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Konu oluşturmak için lütfen oturum açın.' };
  }

  const title = (formData.title || '').trim();
  const categoryId = (formData.categoryId || '').trim();
  const content = (formData.content || '').trim();

  if (title.length < 5) {
    return { success: false, error: 'Başlık en az 5 karakter olmalıdır.' };
  }
  if (!categoryId) {
    return { success: false, error: 'Geçerli bir kategori seçmelisiniz.' };
  }
  if (content.length < 10) {
    return { success: false, error: 'İçerik en az 10 karakter olmalıdır.' };
  }

  const topicId = generateUUID();
  let slug = slugify(title);
  if (!slug) slug = topicId.substring(0, 8);

  const payload = {
    id: topicId,
    title,
    category_id: categoryId,
    content,
    author_id: user.id,
    slug,
    is_pinned: Boolean(formData.isPinned),
    is_locked: Boolean(formData.isLocked),
    is_solved: false,
    views_count: 0
  };

  const { data, error } = await supabase
    .from('topics')
    .insert(payload)
    .select('id, slug')
    .single();

  if (error) {
    console.error('Error inserting topic:', error);
    // Fallback to threads
    const { error: threadErr } = await supabase.from('threads').insert(payload);
    if (threadErr) {
      return { success: false, error: error.message || 'Konu kaydedilemedi.' };
    }
  }

  revalidatePath('/discussions');
  revalidatePath(`/category/${categoryId}`);
  revalidatePath('/');

  return { success: true, topicId: data?.id || topicId, slug };
}

/**
 * Server Action: Creates a reply comment to a topic safely verifying user session.
 */
export async function createCommentAction(formData: {
  topicId: string;
  content: string;
  parentCommentId?: string | null;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Yorum yazmak için lütfen oturum açın.' };
  }

  const topicId = (formData.topicId || '').trim();
  const content = (formData.content || '').trim();

  if (!topicId) {
    return { success: false, error: 'Geçersiz tartışma konusu.' };
  }
  if (!content) {
    return { success: false, error: 'Yorum içeriği boş bırakılamaz.' };
  }

  const commentId = generateUUID();
  const payload = {
    id: commentId,
    topic_id: topicId,
    author_id: user.id,
    content,
    parent_comment_id: formData.parentCommentId || null
  };

  const { error: commentErr } = await supabase
    .from('comments')
    .insert(payload);

  if (commentErr) {
    // Fallback for posts view
    const { error: postErr } = await supabase.from('posts').insert(payload);
    if (postErr) {
      return { success: false, error: commentErr.message || 'Cevap gönderilemedi.' };
    }
  }

  revalidatePath(`/discussions/${topicId}`);
  return { success: true, commentId };
}

/**
 * Server Action: Deletes a topic if the user is the author or a staff member.
 */
export async function deleteTopicAction(topicId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  // Check ownership or staff role
  const { data: topic } = await supabase
    .from('topics')
    .select('author_id')
    .eq('id', topicId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';
  const isAuthor = topic?.author_id === user.id;

  if (!isAuthor && !isStaff) {
    return { success: false, error: 'Yalnızca konunun sahibi veya moderatörler silebilir.' };
  }

  const { error } = await supabase.from('topics').delete().eq('id', topicId);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/discussions');
  revalidatePath('/');
  return { success: true };
}

/**
 * Server Action: Toggles a topic reaction for the authenticated user.
 */
export async function toggleReactionAction(topicId: string, emoji = '👍') {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Beğenmek için giriş yapmalısınız.' };
  }

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('topic_id', topicId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id);
    return { success: true, reacted: false };
  } else {
    await supabase.from('reactions').insert({
      id: generateUUID(),
      topic_id: topicId,
      user_id: user.id,
      emoji
    });
    return { success: true, reacted: true };
  }
}

/**
 * Server Action: Updates user profile details securely with validation.
 */
export async function updateProfileServerAction(profileData: {
  username?: string;
  fullName?: string;
  bio?: string;
  accessibilityPrefs?: any;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Profil güncellemek için oturum açmalısınız.' };
  }

  const updates: any = {
    updated_at: new Date().toISOString()
  };

  if (profileData.username !== undefined) {
    const cleanUsername = profileData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      return { success: false, error: 'Kullanıcı adı en az 3 karakter olmalıdır.' };
    }
    updates.username = cleanUsername;
  }

  if (profileData.fullName !== undefined) {
    updates.full_name = profileData.fullName.trim();
  }

  if (profileData.bio !== undefined) {
    updates.bio = profileData.bio.trim();
  }

  if (profileData.accessibilityPrefs !== undefined) {
    updates.accessibility_prefs = profileData.accessibilityPrefs;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (updateError) {
    console.error('Error updating profile in server action:', updateError);
    return { success: false, error: updateError.message || 'Profil güncellenemedi.' };
  }

  revalidatePath('/profile');
  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}

/**
 * Server Action: Reports content (topic, comment, or user).
 */
export async function reportContentAction(reportData: {
  targetId: string;
  targetType: 'topic' | 'comment' | 'user';
  reason: string;
  description?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bildirimde bulunmak için lütfen oturum açın.' };
  }

  const { error } = await supabase
    .from('reports')
    .insert({
      id: generateUUID(),
      reporter_id: user.id,
      target_id: reportData.targetId,
      target_type: reportData.targetType,
      reason: reportData.reason,
      description: reportData.description || null,
      status: 'pending',
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error submitting report:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Fetches total and active visitor statistics.
 */
export async function getVisitorStats() {
  const { count: totalCount, error: totalError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Failed to fetch total visitors:', totalError);
  }

  const { count: activeCount, error: activeError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  if (activeError) {
    console.error('Failed to fetch active visitors:', activeError);
  }
  
  return { 
    total_visitors: totalCount || 0, 
    active_visitors: activeCount || 0 
  };
}

/**
 * Records or updates a visitor activity heartbeat using a device ID.
 */
export async function recordVisitor(deviceId: string) {
  if (!deviceId) return { success: false };

  const { error } = await supabaseServer
    .from('visitors')
    .upsert(
      { device_id: deviceId, last_seen: new Date().toISOString() },
      { onConflict: 'device_id' }
    );

  if (error) {
    console.error('Error recording visitor:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
