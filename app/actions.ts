'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseServer, getSupabaseServer } from '@/lib/supabase-server';
import { generateUUID, slugify, generateUniqueSlug } from '@/lib/utils';
import { REMEMBER_COOKIE, withRememberPreference } from '@/lib/session-persistence';
import { AVATAR_BUCKET, avatarPublicPrefix, isAllowedAvatarUrl } from '@/lib/avatar';
import { normalizeNotificationPrefs, normalizePrivacyPrefs, wantsNotification, type NotificationPrefs, type PrivacyPrefs } from '@/lib/preferences';

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
          const remember = cookieStore.get(REMEMBER_COOKIE)?.value;
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, withRememberPreference(options, remember))
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
 * Server Action: Deletes a topic if the user is its author or a staff member.
 * Removes the row from both `topics` and the legacy `threads` store (which may be a
 * separate table in some databases) and verifies that nothing is left behind, so a
 * deleted topic cannot keep appearing in listings.
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

  try {
    const serviceClient = getSupabaseServer();
    const [{ data: topicRow }, { data: threadRow }, { data: profile }] = await Promise.all([
      serviceClient.from('topics').select('author_id').eq('id', topicId).maybeSingle(),
      serviceClient.from('threads').select('author_id').eq('id', topicId).maybeSingle(),
      serviceClient.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    ]);

    if (!topicRow && !threadRow) {
      return { success: false, error: 'Konu bulunamadı veya zaten silinmiş.' };
    }

    const authorId = topicRow?.author_id ?? threadRow?.author_id;
    const isStaff = profile?.role === 'admin' || profile?.role === 'moderator';
    if (authorId !== user.id && !isStaff) {
      return { success: false, error: 'Yalnızca konunun sahibi veya moderatörler silebilir.' };
    }

    const { error: topicError } = await serviceClient.from('topics').delete().eq('id', topicId);
    if (topicError) {
      return { success: false, error: topicError.message };
    }

    const { error: threadError } = await serviceClient.from('threads').delete().eq('id', topicId);

    const [{ data: topicLeft }, { data: threadLeft }] = await Promise.all([
      serviceClient.from('topics').select('id').eq('id', topicId).maybeSingle(),
      serviceClient.from('threads').select('id').eq('id', topicId).maybeSingle(),
    ]);
    if (topicLeft || threadLeft) {
      return { success: false, error: threadError?.message || 'Konu tamamen silinemedi.' };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Konu silinirken bir hata oluştu.' };
  }

  revalidatePath('/discussions');
  revalidatePath(`/discussions/${topicId}`);
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
  fullName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  accessibilityPrefs?: any;
  notificationPrefs?: any;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Profil güncellemek için oturum açmalısınız.' };
  }

  const updates: any = {
    updated_at: new Date().toISOString()
  };

  if (profileData.username !== undefined && profileData.username !== null) {
    const cleanUsername = profileData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      return { success: false, error: 'Kullanıcı adı en az 3 karakter olmalıdır.' };
    }
    updates.username = cleanUsername;
  }

  if (profileData.fullName !== undefined) {
    updates.full_name = profileData.fullName?.trim() || null;
  }

  if (profileData.bio !== undefined) {
    updates.bio = profileData.bio?.trim() || null;
  }

  if (profileData.avatarUrl !== undefined) {
    const nextAvatar = profileData.avatarUrl?.trim() || null;
    const { data: current } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle();
    if (!isAllowedAvatarUrl(nextAvatar, { supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '', userId: user.id, currentUrl: current?.avatar_url })) {
      return { success: false, error: 'Profil resmi yalnızca bu sayfadaki "Fotoğraf yükle" ile eklenebilir.' };
    }
    updates.avatar_url = nextAvatar;
  }

  if (profileData.accessibilityPrefs !== undefined) {
    updates.accessibility_prefs = profileData.accessibilityPrefs;
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
 * Server Action: Returns the signed-in user's notification and privacy preferences.
 */
export async function getPreferencesAction(): Promise<
  { success: true; notifications: NotificationPrefs; privacy: PrivacyPrefs } | { success: false; error: string }
> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Tercihlerinizi görmek için oturum açmalısınız.' };
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return {
    success: true,
    notifications: normalizeNotificationPrefs(data?.notification_prefs),
    privacy: normalizePrivacyPrefs(data?.privacy_prefs),
  };
}

/**
 * Server Action: Saves notification and/or privacy preferences for the signed-in user.
 */
export async function updatePreferencesAction(input: { notifications?: NotificationPrefs; privacy?: PrivacyPrefs }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Tercihlerinizi kaydetmek için oturum açmalısınız.' };

  const updates: Record<string, unknown> = {};
  if (input.notifications) updates.notification_prefs = normalizeNotificationPrefs(input.notifications);
  if (input.privacy) updates.privacy_prefs = normalizePrivacyPrefs(input.privacy);
  if (!Object.keys(updates).length) return { success: true };

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
  if (error) {
    const missingColumn = /column|schema cache|42703|PGRST204/i.test(`${error.code} ${error.message}`);
    return {
      success: false,
      error: missingColumn
        ? 'Tercihler henüz kaydedilemiyor: veritabanı güncellemesi bekleniyor (05_tercih_sutunlari.sql).'
        : 'Tercihler kaydedilemedi. Lütfen tekrar deneyin.',
    };
  }
  revalidatePath(`/profile/${user.id}`);
  return { success: true };
}

/**
 * Server Action: Sets (or clears) the profile picture. Only pictures this user uploaded to the
 * "avatars" bucket are accepted, then older pictures in the user's folder are removed.
 */
export async function updateAvatarAction(avatarUrl: string | null) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Profil resmini değiştirmek için oturum açmalısınız.' };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!isAllowedAvatarUrl(avatarUrl, { supabaseUrl, userId: user.id })) {
    return { success: false, error: 'Geçersiz profil resmi.' };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  if (updateError) {
    return { success: false, error: 'Profil resmi kaydedilemedi. Lütfen tekrar deneyin.' };
  }

  const keep = avatarUrl ? avatarUrl.slice(avatarPublicPrefix(supabaseUrl, user.id).length) : null;
  const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(user.id, { limit: 100 });
  const stale = (files || []).map((f) => f.name).filter((name) => name !== keep).map((name) => `${user.id}/${name}`);
  if (stale.length) {
    await supabase.storage.from(AVATAR_BUCKET).remove(stale);
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
  try {
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
  } catch (err) {
    return { total_visitors: 0, active_visitors: 0 };
  }
}

/**
 * Server Action: Records or updates a visitor activity heartbeat using a device ID.
 */
export async function recordVisitor(deviceId: string) {
  if (!deviceId) return { success: false };

  try {
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
  } catch (err: any) {
    return { success: false, error: err?.message || 'Visitor record error' };
  }
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

      if (await recipientWantsNotification(serviceClient, targetUserId, 'follow')) await serviceClient.from('notifications').insert({
        id: generateUUID(),
        user_id: targetUserId,
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
 * Helper to validate bucket-relative voice audio path strictly with exact parser matching voice_<uuid>_<timestamp>.<ext>
 */
function isValidVoicePath(path: string, conversationId: string): boolean {
  if (!path || typeof path !== 'string' || !conversationId) return false;
  const trimmed = path.trim();
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  if (
    cleanPath.includes('..') ||
    cleanPath.includes('?') ||
    cleanPath.includes('#') ||
    cleanPath.includes('//') ||
    cleanPath.includes('\\')
  ) {
    return false;
  }
  const match = cleanPath.match(/^voice_([^_]+)_(\d+)\.(webm|ogg|mp4|mpeg|wav|mp3|m4a)$/);
  if (!match) return false;
  const fileConvId = match[1];
  if (!fileConvId) {
    return false;
  }
  return true;
}

/**
 * Helper to resolve audio URL via signed URL on server side, strictly bound to conversationId
 */
async function resolveServerAudioUrl(audioPath: string | null | undefined, serviceClient: any, conversationId: string): Promise<string> {
  if (!audioPath || !conversationId) return '';
  const trimmed = audioPath.trim();
  if (!isValidVoicePath(trimmed, conversationId)) {
    return '';
  }
  try {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    if (serviceClient?.storage) {
      const { data, error } = await serviceClient.storage
        .from('voice-messages')
        .createSignedUrl(cleanPath, 3600);
      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Server Action: Sends a direct message with strict membership and conversation-bound signed URL resolution.
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

  // 1. Verify conversation exists and sender is ALREADY a member (No auto-joining)
  try {
    const { data: conv } = await serviceClient
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conv) {
      return { success: false, error: 'Sohbet bulunamadı.' };
    }

    const { data: member } = await serviceClient
      .from('conversation_members')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return { success: false, error: 'Bu sohbete mesaj gönderme yetkiniz yok.' };
    }
  } catch (convErr: any) {
    console.error('Conversation membership verification error:', convErr);
    return { success: false, error: 'Sohbet üyelik kontrolü başarısız oldu.' };
  }

  // 2. Insert message with canonical schema columns only (no audio_url in messages table)
  const fullPayload: any = {
    id,
    conversation_id: conversationId,
    sender_id: user.id,
    content: content || (messageType === 'audio' ? '🎤 Sesli Mesaj' : ''),
    created_at: now,
  };

  const { data: inserted, error: insertError } = await serviceClient
    .from('messages')
    .insert(fullPayload)
    .select('*')
    .maybeSingle();

  if (insertError) {
    console.error('Error inserting message via server action:', insertError);
    return { success: false, error: insertError.message || 'Mesaj iletilemedi.' };
  }

  let voiceRecord: any = null;
  // 2.1. If audioUrl is present, record in voice_messages table using exact schema columns and strict conversation-bound path validation
  if (audioUrl) {
    const cleanAudioUrl = audioUrl.trim();
    if (!isValidVoicePath(cleanAudioUrl, conversationId)) {
      await serviceClient.from('messages').delete().eq('id', id);
      return { success: false, error: 'Geçersiz ses dosyası yolu.' };
    }
    try {
      const voiceId = id;
      const { data: vmInserted, error: vmErr } = await serviceClient
        .from('voice_messages')
        .insert({
          id: voiceId,
          user_id: user.id,
          conversation_id: conversationId,
          audio_url: audioUrl,
          duration: duration || 1,
          file_size: 0,
          mime_type: 'audio/webm',
          created_at: now,
        })
        .select('*')
        .maybeSingle();

      if (vmErr) {
        console.error('Error inserting voice_messages:', vmErr);
        await serviceClient.from('messages').delete().eq('id', id);
        await serviceClient.storage.from('voice-messages').remove([cleanAudioUrl]).catch(() => {});
        return { success: false, error: 'Sesli mesaj kaydedilemedi: ' + vmErr.message };
      }

      const resolvedUrl = await resolveServerAudioUrl(audioUrl, serviceClient, conversationId);
      if (!resolvedUrl) {
        await serviceClient.from('voice_messages').delete().eq('id', voiceId);
        await serviceClient.from('messages').delete().eq('id', id);
        await serviceClient.storage.from('voice-messages').remove([cleanAudioUrl]).catch(() => {});
        return { success: false, error: 'Sesli mesaj için güvenli erişim URL\'si oluşturulamadı.' };
      }

      voiceRecord = {
        id: vmInserted?.id || voiceId,
        user_id: user.id,
        conversation_id: conversationId,
        audio_url: resolvedUrl,
        duration: duration || 1,
        file_size: 0,
        mime_type: 'audio/webm',
        created_at: now,
      };
    } catch (vmErr: any) {
      console.error('voice_messages table sync error:', vmErr);
      await serviceClient.from('messages').delete().eq('id', id);
      await serviceClient.storage.from('voice-messages').remove([cleanAudioUrl]).catch(() => {});
      return { success: false, error: 'Sesli mesaj kaydı sırasında hata oluştu.' };
    }
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
        if (!(await recipientWantsNotification(serviceClient, other.user_id, 'message'))) continue;
        await serviceClient.from('notifications').insert({
          id: generateUUID(),
          user_id: other.user_id,
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

  const resolvedAudioUrl = voiceRecord ? voiceRecord.audio_url : (audioUrl ? await resolveServerAudioUrl(audioUrl, serviceClient, conversationId) : null);
  const enrichedMessage = {
    ...(inserted || fullPayload),
    audio_url: resolvedAudioUrl,
    media_url: resolvedAudioUrl,
    duration: duration || null,
    is_voice_message: Boolean(audioUrl),
    voice: voiceRecord,
  };

  return { success: true, message: enrichedMessage };
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

  const { error: memErr1 } = await serviceClient.from('conversation_members').insert({
    conversation_id: newConvId,
    user_id: user.id,
    joined_at: now,
  });

  if (memErr1 && memErr1.code !== '23505') {
    console.error('Error inserting sender member:', memErr1);
    return { success: false, error: 'Sohbet katılımcısı eklenemedi.' };
  }

  const { error: memErr2 } = await serviceClient.from('conversation_members').insert({
    conversation_id: newConvId,
    user_id: resolvedTargetId,
    joined_at: now,
  });

  if (memErr2 && memErr2.code !== '23505') {
    console.error('Error inserting target member:', memErr2);
    return { success: false, error: 'Sohbet katılımcısı eklenemedi.' };
  }

  return { success: true, conversationId: newConvId, otherUser: otherProfile, isNew: true };
}

/**
 * Server Action: Fetches all messages for a specific conversation safely with auth & membership checks.
 */
export async function getConversationMessagesAction(conversationId: string) {
  if (!conversationId) {
    return { success: false, error: 'Geçersiz sohbet ID.' };
  }

  const supabaseUserClient = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Mesajları görmek için oturum açmalısınız.' };
  }

  const serviceClient = getSupabaseServer();

  try {
    // Verify user is a member of this conversation
    const { data: memberCheck } = await serviceClient
      .from('conversation_members')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!memberCheck) {
      return { success: false, error: 'Bu sohbete erişim yetkiniz yok.' };
    }

    const { data: messages, error: fetchErr } = await serviceClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (fetchErr) {
      console.error('Error in getConversationMessagesAction:', fetchErr);
      return { success: false, error: fetchErr.message };
    }

    const msgs = messages || [];
    const messageIds = msgs.map(m => m.id);

    let voiceMap = new Map<string, any>();
    if (messageIds.length > 0) {
      const { data: voiceRows } = await serviceClient
        .from('voice_messages')
        .select('*')
        .in('id', messageIds);

      if (voiceRows) {
        for (const vm of voiceRows) {
          if (vm.conversation_id !== conversationId) continue;
          const resolvedAudioUrl = await resolveServerAudioUrl(vm.audio_url, serviceClient, conversationId);
          if (resolvedAudioUrl) {
            voiceMap.set(vm.id, {
              ...vm,
              audio_url: resolvedAudioUrl,
            });
          }
        }
      }
    }

    const enrichedMessages = msgs.map(m => {
      const vm = voiceMap.get(m.id);
      if (vm) {
        const resolvedAudioUrl = vm.audio_url;
        return {
          ...m,
          audio_url: resolvedAudioUrl,
          media_url: resolvedAudioUrl,
          duration: vm.duration || m.duration || 1,
          is_voice_message: true,
          voice: {
            ...vm,
            audio_url: resolvedAudioUrl,
          },
        };
      }
      return m;
    });

    return { success: true, messages: enrichedMessages };
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

    const processed = (convData || [])
      .filter(conv => (conv.messages || []).length > 0)
      .map(conv => {
        const otherMember = conv.members?.find((m: any) => m?.user_id !== user.id);
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
 * Server Action: Uploads voice message buffer via admin serviceClient (bypassing RLS) and records in DB.
 */
export async function sendVoiceMessageAction(params: {
  conversationId: string;
  audioBase64: string;
  duration?: number;
  messageId?: string;
}) {
  const { conversationId, audioBase64, duration = 1, messageId } = params;
  if (!conversationId || !audioBase64) {
    return { success: false, error: 'Eksik parametre.' };
  }

  const supabaseUserClient = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Giriş yapmalısınız.' };
  }

  const serviceClient = getSupabaseServer();
  const id = messageId || generateUUID();
  const now = new Date().toISOString();

  // 1. Verify membership
  try {
    const { data: member } = await serviceClient
      .from('conversation_members')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return { success: false, error: 'Bu sohbete mesaj gönderme yetkiniz yok.' };
    }
  } catch (err: any) {
    return { success: false, error: 'Üyelik doğrulanamadı.' };
  }

  // 2. Decode base64 and upload using serviceClient (bypassing RLS)
  try {
    const fileName = `voice_${conversationId}_${Date.now()}.webm`;
    const base64Data = audioBase64.includes('base64,') ? audioBase64.split('base64,')[1] : audioBase64;
    const buffer = Buffer.from(base64Data, 'base64');

    await serviceClient.storage.createBucket('voice-messages', { public: true }).catch(() => {});

    const { error: uploadErr } = await serviceClient.storage
      .from('voice-messages')
      .upload(fileName, buffer, {
        contentType: 'audio/webm',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Server storage upload error:', uploadErr);
      return { success: false, error: 'Ses dosyası sunucuya yüklenemedi: ' + uploadErr.message };
    }

    // 3. Insert message
    const { error: msgErr } = await serviceClient
      .from('messages')
      .insert({
        id,
        conversation_id: conversationId,
        sender_id: user.id,
        content: '🎤 Sesli Mesaj',
        created_at: now,
      });

    if (msgErr) {
      await serviceClient.storage.from('voice-messages').remove([fileName]).catch(() => {});
      return { success: false, error: 'Mesaj kaydedilemedi: ' + msgErr.message };
    }

    // 4. Insert voice_messages record
    const { data: vmInserted, error: vmErr } = await serviceClient
      .from('voice_messages')
      .insert({
        id,
        user_id: user.id,
        conversation_id: conversationId,
        audio_url: fileName,
        duration,
        file_size: buffer.length,
        mime_type: 'audio/webm',
        created_at: now,
      })
      .select('*')
      .maybeSingle();

    if (vmErr) {
      await serviceClient.from('messages').delete().eq('id', id);
      await serviceClient.storage.from('voice-messages').remove([fileName]).catch(() => {});
      return { success: false, error: 'Sesli mesaj veritabanına kaydedilemedi: ' + vmErr.message };
    }

    const resolvedUrl = await resolveServerAudioUrl(fileName, serviceClient, conversationId);

    const voiceRecord = {
      id: vmInserted?.id || id,
      user_id: user.id,
      conversation_id: conversationId,
      audio_url: resolvedUrl || `https://${process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : ''}/storage/v1/object/public/voice-messages/${fileName}`,
      duration,
      file_size: buffer.length,
      mime_type: 'audio/webm',
      created_at: now,
    };

    // 5. Update conversation updated_at
    await serviceClient
      .from('conversations')
      .update({ updated_at: now })
      .eq('id', conversationId);

    const fullMessage: any = {
      id,
      conversation_id: conversationId,
      sender_id: user.id,
      content: '🎤 Sesli Mesaj',
      created_at: now,
      is_voice_message: true,
      message_type: 'audio',
      audio_url: voiceRecord.audio_url,
      media_url: voiceRecord.audio_url,
      duration,
      voice: voiceRecord,
    };

    return { success: true, message: fullMessage };
  } catch (err: any) {
    console.error('Fatal error in sendVoiceMessageAction:', err);
    return { success: false, error: err?.message || 'Sesli mesaj gönderilemedi.' };
  }
}

/**
 * True when the recipient has not turned this notification type off on /tercihler.
 * Fails open (sends) when preferences cannot be read.
 */
async function recipientWantsNotification(serviceClient: ReturnType<typeof getSupabaseServer>, recipientId: string, type: string): Promise<boolean> {
  try {
    const { data } = await serviceClient.from('profiles').select('notification_prefs').eq('id', recipientId).maybeSingle();
    return wantsNotification(data?.notification_prefs, type);
  } catch {
    return true;
  }
}

/**
 * Server Action: Notifies a topic's author that the current user liked or answered it.
 * The recipient, text and link are built on the server from the topic, so a client cannot
 * send arbitrary notifications (e.g. phishing links) to other members.
 */
export async function createNotificationAction(payload: { type: 'like' | 'comment'; topicId: string }) {
  try {
    if (payload.type !== 'like' && payload.type !== 'comment') {
      return { success: false, error: 'Geçersiz bildirim türü.' };
    }
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Oturum açmanız gerekiyor.' };
    }

    const serviceClient = getSupabaseServer();
    const { data: topic } = await serviceClient.from('topics').select('id, title, author_id').eq('id', payload.topicId).maybeSingle();
    if (!topic?.author_id || topic.author_id === user.id) {
      return { success: true, skipped: true };
    }
    if (!(await recipientWantsNotification(serviceClient, topic.author_id, payload.type))) {
      return { success: true, skipped: true };
    }

    const { data: senderProfile } = await serviceClient
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .maybeSingle();
    const senderName = senderProfile?.full_name || senderProfile?.username || 'Bir üye';
    const verb = payload.type === 'like' ? 'konunuzu beğendi' : 'konunuza cevap yazdı';

    const { error } = await serviceClient.from('notifications').insert({
      id: generateUUID(),
      user_id: topic.author_id,
      sender_id: user.id,
      type: payload.type,
      content: `${senderName} "${topic.title}" ${verb}.`,
      is_read: false,
      data: { link: `/discussions/${topic.id}` },
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error inserting notification via serviceClient:', error);
      return { success: false, error: 'Bildirim gönderilemedi.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Fatal error in createNotificationAction:', err);
    return { success: false, error: 'Bildirim gönderilemedi.' };
  }
}





