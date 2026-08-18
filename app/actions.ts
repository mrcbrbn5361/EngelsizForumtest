'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseServer, getSupabaseServer } from '@/lib/supabase-server';
import { generateUUID, slugify, generateUniqueSlug } from '@/lib/utils';
import {
  isStaff,
  isAccountActive,
  sanitizeProfileUpdatePayload,
  sanitizeAccessibilityPrefs,
  canModerateCategory,
  PrivacySettings,
  NotificationPreferences
} from '@/lib/permissions';

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

  // Account status check
  const { data: authorProfile } = await supabase
    .from('profiles')
    .select('account_status, role')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(authorProfile)) {
    return { success: false, error: 'Hesabınız askıya alınmıştır veya kısıtlanmıştır.' };
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
  let slug = generateUniqueSlug(title);

  const payload: any = {
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

  let insertedTopic: any = null;
  let lastError: any = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      payload.slug = generateUniqueSlug(title, 8 + attempt * 2);
    }

    const { data, error } = await supabase
      .from('topics')
      .insert(payload)
      .select('id, slug')
      .single();

    if (!error && data) {
      insertedTopic = data;
      lastError = null;
      break;
    }

    lastError = error;

    const isSlugCollision = error?.message?.includes('topics_slug_key') || 
                            error?.message?.includes('duplicate key') || 
                            error?.code === '23505';

    if (!isSlugCollision) {
      // Fallback to threads
      const { data: thData, error: threadErr } = await supabase
        .from('threads')
        .insert(payload)
        .select('id, slug')
        .single();

      if (!threadErr && thData) {
        insertedTopic = thData;
        lastError = null;
        break;
      }
      if (threadErr) lastError = threadErr;
    }
  }

  if (lastError && !insertedTopic) {
    console.error('Error inserting topic in createTopicAction:', lastError);
    return { success: false, error: lastError.message || 'Konu kaydedilemedi.' };
  }

  revalidatePath('/discussions');
  revalidatePath(`/category/${categoryId}`);
  revalidatePath('/');

  return { success: true, topicId: insertedTopic?.id || topicId, slug: insertedTopic?.slug || payload.slug };
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

  // Account status check
  const { data: authorProfile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, account_status, level, xp, is_verified')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(authorProfile)) {
    return { success: false, error: 'Hesabınız askıya alınmıştır veya kısıtlanmıştır.' };
  }

  const topicId = (formData.topicId || '').trim();
  const content = (formData.content || '').trim();

  if (!topicId) {
    return { success: false, error: 'Geçersiz tartışma konusu.' };
  }
  if (!content || content.length < 2) {
    return { success: false, error: 'Yorum içeriği en az 2 karakter olmalıdır.' };
  }
  if (content.length > 15000) {
    return { success: false, error: 'Yorum içeriği çok uzun (maksimum 15.000 karakter).' };
  }

  // Verify topic exists and check lock status
  const { data: topic, error: topicFetchErr } = await supabase
    .from('topics')
    .select('id, title, author_id, is_locked')
    .eq('id', topicId)
    .maybeSingle();

  if (topicFetchErr || !topic) {
    return { success: false, error: 'Tartışma konusu bulunamadı.' };
  }

  if (topic.is_locked) {
    return { success: false, error: 'Bu tartışma kilitlenmiştir, yeni yanıt kabul edilmemektedir.' };
  }

  const commentId = generateUUID();
  const payload: any = {
    id: commentId,
    topic_id: topicId,
    author_id: user.id,
    content,
    is_solution: false,
    parent_comment_id: formData.parentCommentId || null
  };

  let insertedComment: any = null;
  let commentInsertError: any = null;

  // Try inserting with parent_comment_id first
  const { data: cData, error: cErr } = await supabase
    .from('comments')
    .insert([payload])
    .select(`
      id, topic_id, author_id, content, is_solution, created_at, updated_at,
      author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified)
    `)
    .single();

  if (!cErr && cData) {
    insertedComment = cData;
  } else {
    // If parent_comment_id failed, try with parent_id column
    commentInsertError = cErr;
    const fallbackPayload = {
      id: commentId,
      topic_id: topicId,
      author_id: user.id,
      content,
      is_solution: false,
      parent_id: formData.parentCommentId || null
    };

    const { data: fbData, error: fbErr } = await supabase
      .from('comments')
      .insert([fallbackPayload])
      .select(`
        id, topic_id, author_id, content, is_solution, created_at, updated_at,
        author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified)
      `)
      .single();

    if (!fbErr && fbData) {
      insertedComment = fbData;
      commentInsertError = null;
    } else {
      commentInsertError = fbErr || cErr;
    }
  }

  if (commentInsertError && !insertedComment) {
    return { success: false, error: 'Cevap gönderilemedi: ' + (commentInsertError.message || 'Veritabanı hatası') };
  }

  // Send in-app notification to topic author if different from commenter
  if (topic.author_id && topic.author_id !== user.id) {
    try {
      const commenterName = authorProfile?.username || authorProfile?.full_name || 'Bir üye';
      await supabase
        .from('notifications')
        .insert([{
          recipient_id: topic.author_id,
          sender_id: user.id,
          type: 'comment',
          title: 'Yeni Yanıt',
          body: `${commenterName} "${topic.title}" başlıklı konunuza yanıt verdi.`,
          content: `${commenterName} "${topic.title}" başlıklı konunuza yanıt verdi.`,
          data: { link: `/discussions/${topicId}`, topic_id: topicId }
        }]);
    } catch (notifErr) {
      console.warn('Could not dispatch comment notification:', notifErr);
    }
  }

  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/discussions');
  return { 
    success: true, 
    commentId, 
    comment: insertedComment || {
      id: commentId,
      topic_id: topicId,
      author_id: user.id,
      content,
      is_solution: false,
      created_at: new Date().toISOString(),
      author: authorProfile
    }
  };
}

/**
 * Server Action: Deletes a topic if the user is the author, global staff, or a scoped category moderator.
 */
export async function deleteTopicAction(topicId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmuyor.' };
  }

  // Check ownership, category, or staff role
  const { data: topic } = await supabase
    .from('topics')
    .select('author_id, category_id')
    .eq('id', topicId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isAuthor = topic?.author_id === user.id;
  const isCategoryMod = topic?.category_id
    ? await canModerateCategory(user.id, topic.category_id, profile?.role)
    : false;

  if (!isAuthor && !isGlobalStaff && !isCategoryMod) {
    return { success: false, error: 'Yalnızca konunun sahibi veya yetkili moderatörler silebilir.' };
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
 * Server Action: Updates a topic with title, content, category, or tags.
 */
export async function updateTopicAction(formData: {
  topicId: string;
  title?: string;
  content?: string;
  categoryId?: string;
  tags?: string[];
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const { data: topic } = await supabase
    .from('topics')
    .select('author_id, category_id, is_locked')
    .eq('id', formData.topicId)
    .single();

  if (!topic) {
    return { success: false, error: 'Konu bulunamadı.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isAuthor = topic.author_id === user.id;
  const isCategoryMod = topic.category_id
    ? await canModerateCategory(user.id, topic.category_id, profile?.role)
    : false;

  if (!isAuthor && !isGlobalStaff && !isCategoryMod) {
    return { success: false, error: 'Konuyu düzenleme yetkiniz bulunmuyor.' };
  }

  if (topic.is_locked && !isGlobalStaff && !isCategoryMod) {
    return { success: false, error: 'Kilitlenmiş konular düzenlenemez.' };
  }

  const updates: any = {
    updated_at: new Date().toISOString()
  };

  if (formData.title !== undefined) {
    const trimmedTitle = formData.title.trim();
    if (trimmedTitle.length < 5) {
      return { success: false, error: 'Başlık en az 5 karakter olmalıdır.' };
    }
    updates.title = trimmedTitle;
  }

  if (formData.content !== undefined) {
    const trimmedContent = formData.content.trim();
    if (trimmedContent.length < 10) {
      return { success: false, error: 'İçerik en az 10 karakter olmalıdır.' };
    }
    updates.content = trimmedContent;
  }

  if (formData.categoryId !== undefined) {
    updates.category_id = formData.categoryId;
  }

  if (formData.tags !== undefined) {
    updates.tags = formData.tags;
  }

  const { error: updateErr } = await supabase
    .from('topics')
    .update(updates)
    .eq('id', formData.topicId);

  if (updateErr) {
    return { success: false, error: updateErr.message || 'Konu güncellenemedi.' };
  }

  revalidatePath(`/discussions/${formData.topicId}`);
  revalidatePath('/discussions');
  revalidatePath('/');
  return { success: true };
}

/**
 * Server Action: Toggles topic pinned status (Staff or Category Moderator only).
 */
export async function togglePinTopicAction(topicId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const { data: topic } = await supabase
    .from('topics')
    .select('category_id, is_pinned')
    .eq('id', topicId)
    .single();

  if (!topic) {
    return { success: false, error: 'Konu bulunamadı.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isCategoryMod = topic.category_id
    ? await canModerateCategory(user.id, topic.category_id, profile?.role)
    : false;

  if (!isGlobalStaff && !isCategoryMod) {
    return { success: false, error: 'Yalnızca yetkili moderatörler konuyu sabitleyebilir.' };
  }

  const newPinned = !topic.is_pinned;
  const { error } = await supabase
    .from('topics')
    .update({ is_pinned: newPinned, updated_at: new Date().toISOString() })
    .eq('id', topicId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/discussions');
  revalidatePath('/');
  return { success: true, isPinned: newPinned };
}

/**
 * Server Action: Toggles topic locked status (Staff or Category Moderator only).
 */
export async function toggleLockTopicAction(topicId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const { data: topic } = await supabase
    .from('topics')
    .select('category_id, is_locked')
    .eq('id', topicId)
    .single();

  if (!topic) {
    return { success: false, error: 'Konu bulunamadı.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isCategoryMod = topic.category_id
    ? await canModerateCategory(user.id, topic.category_id, profile?.role)
    : false;

  if (!isGlobalStaff && !isCategoryMod) {
    return { success: false, error: 'Yalnızca yetkili moderatörler konuyu kilitleyebilir.' };
  }

  const newLocked = !topic.is_locked;
  const { error } = await supabase
    .from('topics')
    .update({ is_locked: newLocked, updated_at: new Date().toISOString() })
    .eq('id', topicId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/discussions');
  revalidatePath('/');
  return { success: true, isLocked: newLocked };
}

/**
 * Server Action: Updates a comment content.
 */
export async function updateCommentAction(formData: {
  commentId: string;
  content: string;
  editReason?: string;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, topic_id, edit_count')
    .eq('id', formData.commentId)
    .single();

  if (!comment) {
    return { success: false, error: 'Yorum bulunamadı.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isAuthor = comment.author_id === user.id;

  if (!isAuthor && !isGlobalStaff) {
    return { success: false, error: 'Yalnızca yorum sahibi veya moderatörler düzenleyebilir.' };
  }

  const trimmedContent = (formData.content || '').trim();
  if (!trimmedContent) {
    return { success: false, error: 'Yorum içeriği boş olamaz.' };
  }

  const updates: any = {
    content: trimmedContent,
    last_edited_at: new Date().toISOString(),
    edit_count: (comment.edit_count || 0) + 1,
    updated_at: new Date().toISOString()
  };

  if (formData.editReason) {
    updates.edit_reason = formData.editReason.trim();
  }

  const { error } = await supabase
    .from('comments')
    .update(updates)
    .eq('id', formData.commentId);

  if (error) {
    return { success: false, error: error.message || 'Yorum güncellenemedi.' };
  }

  revalidatePath(`/discussions/${comment.topic_id}`);
  return { success: true };
}

/**
 * Server Action: Deletes a comment if the user is author or staff/moderator.
 */
export async function deleteCommentAction(commentId: string, topicId?: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için giriş yapmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('author_id, topic_id')
    .eq('id', commentId)
    .single();

  if (!comment) {
    return { success: false, error: 'Yorum bulunamadı.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isAuthor = comment.author_id === user.id;

  if (!isAuthor && !isGlobalStaff) {
    return { success: false, error: 'Yalnızca yorum sahibi veya moderatörler silebilir.' };
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    return { success: false, error: error.message || 'Yorum silinemedi.' };
  }

  revalidatePath(`/discussions/${comment.topic_id}`);
  return { success: true };
}

/**
 * Server Action: Marks a comment as the accepted solution for a topic.
 * Allowed for the topic author, staff, or category moderator.
 */
export async function markAsSolutionAction(commentId: string, topicId: string) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız kısıtlanmıştır.' };
  }

  const { data: topic } = await supabase
    .from('topics')
    .select('author_id, category_id')
    .eq('id', topicId)
    .single();

  if (!topic) {
    return { success: false, error: 'Konu bulunamadı.' };
  }

  const isGlobalStaff = isStaff(profile);
  const isAuthor = topic.author_id === user.id;
  const isCategoryMod = topic.category_id
    ? await canModerateCategory(user.id, topic.category_id, profile?.role)
    : false;

  if (!isAuthor && !isGlobalStaff && !isCategoryMod) {
    return { success: false, error: 'Yalnızca konunun sahibi veya yetkili moderatörler çözüm belirleyebilir.' };
  }

  // Reset other comments' is_solution flag for this topic
  await supabase
    .from('comments')
    .update({ is_solution: false })
    .eq('topic_id', topicId);

  // Set the chosen comment as solution
  const { error: commentErr } = await supabase
    .from('comments')
    .update({ is_solution: true, updated_at: new Date().toISOString() })
    .eq('id', commentId);

  if (commentErr) {
    return { success: false, error: commentErr.message || 'Yorum çözüm olarak işaretlenemedi.' };
  }

  // Update topic is_solved status
  const { error: topicErr } = await supabase
    .from('topics')
    .update({ is_solved: true, updated_at: new Date().toISOString() })
    .eq('id', topicId);

  if (topicErr) {
    return { success: false, error: topicErr.message || 'Konu durumu güncellenemedi.' };
  }

  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/discussions');
  revalidatePath('/');
  return { success: true };
}

/**
 * Server Action: Toggles a reaction for a topic or comment.
 */
export async function toggleReactionAction(topicId: string, emoji = '👍') {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Beğenmek için giriş yapmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız askıya alınmıştır veya kısıtlanmıştır.' };
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
 * Server Action: Toggles a reaction for a specific comment.
 */
export async function toggleCommentReactionAction(commentId: string, emoji = '👍') {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Beğenmek için giriş yapmalısınız.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(profile)) {
    return { success: false, error: 'Hesabınız askıya alınmıştır veya kısıtlanmıştır.' };
  }

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id);
    return { success: true, reacted: false };
  } else {
    await supabase.from('reactions').insert({
      id: generateUUID(),
      comment_id: commentId,
      user_id: user.id,
      emoji
    });
    return { success: true, reacted: true };
  }
}

/**
 * Server Action: Updates user profile details securely with validation and privilege protection.
 */
export async function updateProfileServerAction(profileData: {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  accessibilityPrefs?: any;
  privacySettings?: PrivacySettings;
  notificationPrefs?: NotificationPreferences;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Profil güncellemek için oturum açmalısınız.' };
  }

  // Account status check
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('id, username, account_status')
    .eq('id', user.id)
    .single();

  if (!isAccountActive(currentProfile)) {
    return { success: false, error: 'Hesabınız askıya alınmıştır veya kısıtlanmıştır.' };
  }

  // Sanitize away any unauthorized / privilege escalation fields (role, xp, level, etc.)
  const rawSanitized = sanitizeProfileUpdatePayload(profileData);
  const updates: any = {
    ...rawSanitized,
    updated_at: new Date().toISOString()
  };

  if (profileData.username !== undefined) {
    const cleanUsername = profileData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      return { success: false, error: 'Kullanıcı adı en az 3 karakter olmalı ve yalnızca harf, rakam ve alt çizgi içermelidir.' };
    }
    
    // Check case-insensitive username collision
    if (cleanUsername !== currentProfile?.username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'Bu kullanıcı adı zaten başka bir üye tarafından kullanılmaktadır.' };
      }
    }
    updates.username = cleanUsername;
  }

  if (profileData.fullName !== undefined) {
    updates.full_name = profileData.fullName.trim();
  }

  if (profileData.avatarUrl !== undefined) {
    updates.avatar_url = profileData.avatarUrl.trim();
  }

  if (profileData.bio !== undefined) {
    updates.bio = profileData.bio.trim();
  }

  if (profileData.accessibilityPrefs !== undefined) {
    updates.accessibility_prefs = sanitizeAccessibilityPrefs(profileData.accessibilityPrefs);
  }

  if (profileData.privacySettings !== undefined) {
    updates.privacy_settings = profileData.privacySettings;
  }

  if (profileData.notificationPrefs !== undefined) {
    updates.notification_prefs = profileData.notificationPrefs;
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
 * Server Action: Updates user privacy preferences safely on server.
 */
export async function updatePrivacySettingsAction(privacySettings: PrivacySettings) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      privacy_settings: privacySettings,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message || 'Gizlilik ayarları güncellenemedi.' };
  }

  revalidatePath('/profile');
  return { success: true };
}

/**
 * Server Action: Updates user notification preferences safely on server.
 */
export async function updateNotificationPreferencesAction(notificationPrefs: NotificationPreferences) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      notification_prefs: notificationPrefs,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message || 'Bildirim tercihleri güncellenemedi.' };
  }

  revalidatePath('/profile');
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
 * Server Action: Records or updates a visitor activity heartbeat using a device ID.
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

/**
 * Server Action: Toggles following a user safely on the server side with privilege fallback.
 */
export async function toggleFollowAction(targetUserId: string) {
  if (!targetUserId) {
    return { success: false, error: 'Geçersiz kullanıcı hedefi.' };
  }

  const supabaseUserClient = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Kullanıcıyı takip etmek için oturum açmalısınız.' };
  }

  if (user.id === targetUserId) {
    return { success: false, error: 'Kendinizi takip edemezsiniz.' };
  }

  const serviceClient = getSupabaseServer();

  let isFollowing = false;
  let followRecordId: string | null = null;

  try {
    const { data: existing } = await serviceClient
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle();

    if (existing) {
      isFollowing = true;
      followRecordId = existing.id;
    }
  } catch (err) {
    try {
      const { data: existingAlt } = await serviceClient
        .from('follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_id', targetUserId)
        .maybeSingle();
      if (existingAlt) {
        isFollowing = true;
        followRecordId = existingAlt.id;
      }
    } catch {}
  }

  if (isFollowing) {
    // Unfollow
    let deleteErr: any = null;
    if (followRecordId) {
      const { error } = await serviceClient.from('follows').delete().eq('id', followRecordId);
      deleteErr = error;
    } else {
      const { error } = await serviceClient
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);
      deleteErr = error;
    }

    if (deleteErr) {
      console.error('Error deleting follow:', deleteErr);
      return { success: false, error: deleteErr.message || 'Takip bırakılamadı.' };
    }

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${user.id}`);
    return { success: true, following: false };
  } else {
    // Follow
    const followId = generateUUID();
    const payload: any = {
      id: followId,
      follower_id: user.id,
      following_id: targetUserId,
      created_at: new Date().toISOString()
    };

    let insertErr = null;
    const { error } = await serviceClient.from('follows').insert(payload);
    insertErr = error;

    if (insertErr && (insertErr.code === '42703' || insertErr.message?.includes('column'))) {
      const altPayload = {
        id: followId,
        user_id: user.id,
        target_id: targetUserId,
        created_at: new Date().toISOString()
      };
      const { error: altErr } = await serviceClient.from('follows').insert(altPayload);
      insertErr = altErr;
    }

    if (insertErr && insertErr.code !== '23505') {
      console.error('Error inserting follow:', insertErr);
      return { success: false, error: insertErr.message || 'Takip edilemedi.' };
    }

    // Send notification
    try {
      const { data: senderProfile } = await serviceClient
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .maybeSingle();

      const senderName = senderProfile?.full_name || senderProfile?.username || user.email?.split('@')[0] || 'Bir üye';

      await serviceClient.from('notifications').insert({
        id: generateUUID(),
        recipient_id: targetUserId,
        sender_id: user.id,
        type: 'follow',
        title: 'Yeni Takipçi',
        body: `${senderName} sizi takip etmeye başladı.`,
        content: `${senderName} sizi takip etmeye başladı.`,
        data: { link: `/profile/${user.id}` },
        created_at: new Date().toISOString()
      });
    } catch (notifErr) {
      console.warn('Could not create follow notification:', notifErr);
    }

    revalidatePath(`/profile/${targetUserId}`);
    revalidatePath(`/profile/${user.id}`);
    return { success: true, following: true };
  }
}

/**
 * Server Action: Sends a direct message with privilege fallback and recipient notification.
 */
export async function sendMessageAction(params: {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'audio' | 'voice' | 'image' | 'file';
  audioUrl?: string | null;
  duration?: number;
  messageId?: string;
}) {
  const { conversationId, content, messageType = 'text', audioUrl, duration, messageId } = params;
  if (!conversationId || (!content && !audioUrl)) {
    return { success: false, error: 'Mesaj içeriği boş olamaz.' };
  }

  const supabaseUserClient = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Mesaj göndermek için oturum açmalısınız.' };
  }

  const serviceClient = getSupabaseServer();
  const id = messageId || generateUUID();
  const now = new Date().toISOString();

  // 1. Ensure conversation exists and sender is a member in DB
  try {
    const { data: conv } = await serviceClient
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conv) {
      await serviceClient.from('conversations').upsert({
        id: conversationId,
        created_at: now,
        updated_at: now,
      });
    }

    const { data: member } = await serviceClient
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      await serviceClient.from('conversation_members').insert({
        id: generateUUID(),
        conversation_id: conversationId,
        user_id: user.id,
        joined_at: now,
      });
    }
  } catch (convErr) {
    console.warn('Conversation member sync notice:', convErr);
  }

  // 2. Insert message with resilience for optional schema columns
  const fullPayload: any = {
    id,
    conversation_id: conversationId,
    sender_id: user.id,
    content: content || (messageType === 'audio' ? '🎤 Sesli Mesaj' : ''),
    message_type: messageType,
    created_at: now,
    updated_at: now,
  };

  if (audioUrl) {
    fullPayload.audio_url = audioUrl;
    fullPayload.is_voice_message = true;
  }
  if (duration) {
    fullPayload.duration = duration;
  }

  let { data: inserted, error: insertError } = await serviceClient
    .from('messages')
    .insert(fullPayload)
    .select('*')
    .maybeSingle();

  // If column error occurs (e.g. is_voice_message or audio_url doesn't exist in older table versions)
  if (insertError && (insertError.code === '42703' || insertError.message?.includes('column'))) {
    const minimalPayload: any = {
      id,
      conversation_id: conversationId,
      sender_id: user.id,
      content: content || (messageType === 'audio' ? '🎤 Sesli Mesaj' : ''),
      created_at: now,
    };
    const { data: retryInserted, error: retryError } = await serviceClient
      .from('messages')
      .insert(minimalPayload)
      .select('*')
      .maybeSingle();

    if (!retryError) {
      inserted = retryInserted || minimalPayload;
      insertError = null;
    }
  }

  if (insertError) {
    console.error('Error inserting message via server action:', insertError);
    return { success: false, error: insertError.message || 'Mesaj iletilemedi.' };
  }

  // 3. Update conversation updated_at
  try {
    await serviceClient
      .from('conversations')
      .update({ updated_at: now })
      .eq('id', conversationId);
  } catch {}

  // 4. Send notification to conversation participants
  try {
    const { data: otherMembers } = await serviceClient
      .from('conversation_members')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id);

    if (otherMembers && otherMembers.length > 0) {
      const { data: senderProfile } = await serviceClient
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .maybeSingle();
      const senderName = senderProfile?.full_name || senderProfile?.username || 'Bir üye';

      for (const other of otherMembers) {
        if (!other?.user_id) continue;
        await serviceClient.from('notifications').insert({
          id: generateUUID(),
          recipient_id: other.user_id,
          sender_id: user.id,
          type: 'message',
          title: 'Yeni Doğrudan Mesaj',
          body: `${senderName}: ${content.slice(0, 70)}`,
          content: `${senderName}: ${content.slice(0, 70)}`,
          data: { conversation_id: conversationId, link: `/messages?userId=${user.id}` },
          created_at: now,
        });
      }
    }
  } catch (notifErr) {
    console.warn('Could not generate message notification:', notifErr);
  }

  return { success: true, message: inserted || fullPayload };
}

/**
 * Server Action: Finds or creates a direct conversation between current user and target user.
 */
export async function createOrGetConversationAction(targetUserId: string) {
  if (!targetUserId) {
    return { success: false, error: 'Hedef kullanıcı belirtilmedi.' };
  }

  const supabaseUserClient = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Sohbet başlatmak için oturum açmalısınız.' };
  }

  const serviceClient = getSupabaseServer();

  // Resolve target user
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetUserId);
  let profQuery = serviceClient.from('profiles').select('*');
  if (isUUID) {
    profQuery = profQuery.eq('id', targetUserId);
  } else {
    profQuery = profQuery.eq('username', targetUserId);
  }

  let { data: otherProfile } = await profQuery.maybeSingle();
  if (!otherProfile && isUUID) {
    const { data: byUser } = await serviceClient.from('profiles').select('*').eq('username', targetUserId).maybeSingle();
    if (byUser) otherProfile = byUser;
  }

  if (!otherProfile) {
    return { success: false, error: 'Kullanıcı profili bulunamadı.' };
  }

  const resolvedTargetId = otherProfile.id;
  if (resolvedTargetId === user.id) {
    return { success: false, error: 'Kendinizle sohbet başlatamazsınız.' };
  }

  // Find existing conversation with both users
  try {
    const { data: myConvs } = await serviceClient
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (myConvs && myConvs.length > 0) {
      const convIds = myConvs.map(m => m.conversation_id);
      const { data: commonMembers } = await serviceClient
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', resolvedTargetId)
        .in('conversation_id', convIds);

      if (commonMembers && commonMembers.length > 0) {
        const existingConvId = commonMembers[0].conversation_id;
        return { success: true, conversationId: existingConvId, otherUser: otherProfile, isNew: false };
      }
    }
  } catch (err) {
    console.warn('Error checking existing conversations:', err);
  }

  // Create new conversation
  const newConvId = generateUUID();
  const now = new Date().toISOString();

  const { error: convErr } = await serviceClient.from('conversations').insert({
    id: newConvId,
    created_at: now,
    updated_at: now,
  });

  if (convErr) {
    console.error('Error creating conversation:', convErr);
    return { success: false, error: 'Sohbet oluşturulamadı.' };
  }

  await serviceClient.from('conversation_members').insert([
    { id: generateUUID(), conversation_id: newConvId, user_id: user.id, joined_at: now },
    { id: generateUUID(), conversation_id: newConvId, user_id: resolvedTargetId, joined_at: now },
  ]);

  return { success: true, conversationId: newConvId, otherUser: otherProfile, isNew: true };
}

/**
 * Server Action: Fetches all messages for a specific conversation safely without RLS drop.
 */
export async function getConversationMessagesAction(conversationId: string) {
  if (!conversationId) {
    return { success: false, error: 'Geçersiz sohbet ID.' };
  }

  const serviceClient = getSupabaseServer();

  try {
    const { data: messages, error: fetchErr } = await serviceClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (fetchErr) {
      console.error('Error in getConversationMessagesAction:', fetchErr);
      return { success: false, error: fetchErr.message };
    }

    return { success: true, messages: messages || [] };
  } catch (err: any) {
    console.error('Fatal error fetching conversation messages:', err);
    return { success: false, error: err?.message || 'Mesajlar alınamadı.' };
  }
}

/**
 * Server Action: Fetches conversations and other members for current user.
 */
export async function getUserConversationsAction() {
  const supabaseUserClient = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Oturum açılmamış.' };
  }

  const serviceClient = getSupabaseServer();

  try {
    // 1. Get conversation memberships for user
    const { data: memberships, error: memErr } = await serviceClient
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (memErr) {
      console.error('Error fetching conversation memberships:', memErr);
      return { success: false, error: memErr.message };
    }

    const convIds = (memberships || []).map(m => m.conversation_id);
    if (convIds.length === 0) {
      return { success: true, conversations: [] };
    }

    // 2. Fetch conversations
    const { data: convData, error: convErr } = await serviceClient
      .from('conversations')
      .select(`
        *,
        members:conversation_members(
          user_id,
          user:profiles(*)
        ),
        messages:messages(*)
      `)
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (convErr) {
      console.error('Error fetching conversations details:', convErr);
      return { success: false, error: convErr.message };
    }

    const processed = (convData || []).map(conv => {
      const otherMember = conv.members?.find((m: any) => m?.user_id !== user.id || m?.user?.id !== user.id);
      const messagesList = conv.messages || [];
      const lastMsg = messagesList.length > 0
        ? [...messagesList].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

      return {
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        other_user: otherMember?.user || null,
        last_message: lastMsg,
        unread_count: 0
      };
    });

    return { success: true, conversations: processed };
  } catch (err: any) {
    console.error('Fatal error in getUserConversationsAction:', err);
    return { success: false, error: err?.message || 'Sohbetler alınamadı.' };
  }
}

/**
 * Server Action: Toggles bookmarking a topic for the authenticated user.
 */
export async function toggleBookmarkAction(topicId: string) {
  if (!topicId) return { success: false, error: 'Geçersiz konu.' };
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Yer işareti eklemek için oturum açmalısınız.' };
  }

  try {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('topic_id', topicId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error: delErr } = await supabase.from('bookmarks').delete().eq('id', existing.id);
      if (delErr) throw delErr;
      revalidatePath(`/discussions/${topicId}`);
      revalidatePath('/saved');
      return { success: true, bookmarked: false };
    } else {
      const { error: insErr } = await supabase.from('bookmarks').insert({
        id: generateUUID(),
        user_id: user.id,
        topic_id: topicId,
        created_at: new Date().toISOString()
      });
      if (insErr) throw insErr;
      revalidatePath(`/discussions/${topicId}`);
      revalidatePath('/saved');
      return { success: true, bookmarked: true };
    }
  } catch (err: any) {
    console.error('Error toggling bookmark:', err);
    return { success: false, error: err?.message || 'Yer işareti kaydedilemedi.' };
  }
}

/**
 * Server Action: Marks or unmarks a comment as the accepted solution.
 */
export async function toggleSolutionAction(topicId: string, commentId: string) {
  if (!topicId || !commentId) return { success: false, error: 'Geçersiz parametreler.' };
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Bu işlem için oturum açmalısınız.' };
  }

  // Check if user is topic author or staff
  const { data: topic } = await supabase
    .from('topics')
    .select('author_id, is_solved, solution_comment_id')
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
    return { success: false, error: 'Yalnızca konunun sahibi veya moderatörler çözüm belirleyebilir.' };
  }

  try {
    const isCurrentlySolution = topic?.solution_comment_id === commentId;

    if (isCurrentlySolution) {
      // Unmark solution
      await supabase.from('comments').update({ is_solution: false }).eq('topic_id', topicId);
      await supabase.from('topics').update({ is_solved: false, solution_comment_id: null, solved_at: null }).eq('id', topicId);
    } else {
      // Mark solution
      await supabase.from('comments').update({ is_solution: false }).eq('topic_id', topicId);
      await supabase.from('comments').update({ is_solution: true }).eq('id', commentId);
      await supabase.from('topics').update({ is_solved: true, solution_comment_id: commentId, solved_at: new Date().toISOString() }).eq('id', topicId);
    }

    revalidatePath(`/discussions/${topicId}`);
    return { success: true, isSolved: !isCurrentlySolution };
  } catch (err: any) {
    console.error('Error toggling solution:', err);
    return { success: false, error: err?.message || 'Çözüm işaretlenemedi.' };
  }
}



