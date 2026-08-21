'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseServer, getSupabaseServer } from '@/lib/supabase-server';
import { generateUUID, slugify, generateUniqueSlug } from '@/lib/utils';

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
 * Helper to resolve audio URL from storage path on server side
 */
function resolveServerAudioUrl(storagePathOrUrl?: string | null, serviceClient?: any): string {
  if (!storagePathOrUrl) return '';
  const trimmed = storagePathOrUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  try {
    const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    if (serviceClient?.storage) {
      const { data } = serviceClient.storage.from('voice-messages').getPublicUrl(cleanPath);
      return data?.publicUrl || trimmed;
    }
    return trimmed;
  } catch {
    return trimmed;
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
  // 2.1. If audioUrl is present, record in voice_messages table using exact existing schema columns
  if (audioUrl) {
    try {
      const voiceId = generateUUID();
      const { data: vmInserted } = await serviceClient
        .from('voice_messages')
        .insert({
          id: voiceId,
          message_id: id,
          storage_path: audioUrl,
          duration: duration || 1,
          mime_type: 'audio/webm',
          created_at: now,
        })
        .select('*')
        .maybeSingle();

      const resolvedUrl = resolveServerAudioUrl(audioUrl, serviceClient);
      voiceRecord = {
        id: vmInserted?.id || voiceId,
        message_id: id,
        storage_path: audioUrl,
        duration: duration || 1,
        mime_type: 'audio/webm',
        created_at: now,
        audio_url: resolvedUrl,
      };
    } catch (vmErr) {
      console.warn('voice_messages table sync notice:', vmErr);
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

  const resolvedAudioUrl = voiceRecord ? voiceRecord.audio_url : (audioUrl ? resolveServerAudioUrl(audioUrl, serviceClient) : null);
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

    const msgs = messages || [];
    const messageIds = msgs.map(m => m.id);

    let voiceMap = new Map<string, any>();
    if (messageIds.length > 0) {
      const { data: voiceRows } = await serviceClient
        .from('voice_messages')
        .select('*')
        .in('message_id', messageIds);

      if (voiceRows) {
        voiceRows.forEach(vm => {
          voiceMap.set(vm.message_id, vm);
        });
      }
    }

    const enrichedMessages = msgs.map(m => {
      const vm = voiceMap.get(m.id);
      if (vm) {
        const resolvedAudioUrl = resolveServerAudioUrl(vm.storage_path, serviceClient);
        return {
          ...m,
          audio_url: resolvedAudioUrl,
          media_url: resolvedAudioUrl,
          duration: vm.duration || m.duration || 1,
          is_voice_message: true,
          voice: {
            id: vm.id,
            message_id: vm.message_id,
            storage_path: vm.storage_path,
            duration: vm.duration || 1,
            mime_type: vm.mime_type || 'audio/webm',
            created_at: vm.created_at,
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


