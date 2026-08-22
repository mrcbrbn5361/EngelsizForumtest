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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase server ortam değişkenleri yapılandırılmamış.');
  }

  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component bağlamında cookie yazımı middleware tarafından tamamlanır.
          }
        },
      },
    }
  );
}

function isStaffRole(role: unknown): boolean {
  return role === 'admin' || role === 'moderator';
}

async function getAuthenticatedActor() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase, user: null, role: null as string | null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return { supabase, user, role: (profile?.role || 'user') as string };
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

  const { data: actorProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  const canModerate = isStaffRole(actorProfile?.role);

  const topicId = generateUUID();
  let slug = generateUniqueSlug(title);

  const payload: any = {
    id: topicId,
    title,
    category_id: categoryId,
    content,
    author_id: user.id,
    slug,
    is_pinned: canModerate && Boolean(formData.isPinned),
    is_locked: canModerate && Boolean(formData.isLocked),
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
      break;
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

  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, is_locked, author_id')
    .eq('id', topicId)
    .maybeSingle();

  if (topicError || !topic) {
    return { success: false, error: 'Tartışma bulunamadı.' };
  }
  if (topic.is_locked) {
    return { success: false, error: 'Bu tartışma kilitli; yeni yorum gönderilemez.' };
  }

  const commentId = generateUUID();
  const payload: Record<string, unknown> = {
    id: commentId,
    topic_id: topicId,
    author_id: user.id,
    content,
  };
  if (formData.parentCommentId) {
    payload.parent_id = formData.parentCommentId;
  }

  const { error: commentErr } = await supabase
    .from('comments')
    .insert(payload);

  if (commentErr) {
    return { success: false, error: commentErr.message || 'Cevap gönderilemedi.' };
  }

  // XP and notification are best-effort side effects; a failed notification must not
  // turn a successfully persisted canonical comment into a false failure.
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', user.id)
      .maybeSingle();
    if (profile) {
      const nextXp = Math.max(0, Number(profile.xp || 0)) + 10;
      const nextLevel = Math.floor(nextXp / 200) + 1;
      await supabase.from('profiles').update({ xp: nextXp, level: nextLevel }).eq('id', user.id);
    }
  } catch (xpError) {
    console.warn('Comment XP update skipped:', xpError);
  }

  if (topic.author_id !== user.id) {
    try {
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .maybeSingle();
      const senderName = senderProfile?.full_name || senderProfile?.username || user.email?.split('@')[0] || 'Bir üye';
      await supabase.from('notifications').insert({
        id: generateUUID(),
        recipient_id: topic.author_id,
        sender_id: user.id,
        type: 'comment',
        title: 'Yeni Yorum',
        body: `${senderName} başlığınıza yanıt verdi.`,
        content: `${senderName} başlığınıza yanıt verdi.`,
        data: { link: `/discussions/${topicId}` },
        created_at: new Date().toISOString(),
      });
    } catch (notificationError) {
      console.warn('Comment notification skipped:', notificationError);
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/** Server Action: Increments one canonical topic view through the server-only RPC. */
export async function incrementTopicViewAction(topicId: string) {
  const normalizedId = (topicId || '').trim();
  if (!isUuid(normalizedId)) return { success: false, error: 'Geçersiz konu ID.' };
  try {
    const { error } = await supabaseServer.rpc('increment_views', { topic_id: normalizedId });
    if (error) {
      console.warn('Topic view RPC unavailable:', error.message);
      return { success: false, error: 'Görüntülenme sayacı güncellenemedi.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Görüntülenme sayacı güncellenemedi.' };
  }
}

/** Server Action: Updates a topic for its author or staff. */
export async function updateTopicAction(params: {
  topicId: string;
  title: string;
  content: string;
}) {
  const topicId = (params.topicId || '').trim();
  const title = (params.title || '').trim();
  const content = (params.content || '').trim();
  if (!isUuid(topicId)) return { success: false, error: 'Geçersiz konu ID.' };
  if (title.length < 5 || title.length > 200) return { success: false, error: 'Başlık 5–200 karakter arasında olmalıdır.' };
  if (content.length < 10 || content.length > 100000) return { success: false, error: 'Konu içeriği 10–100.000 karakter arasında olmalıdır.' };

  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Düzenlemek için oturum açmalısınız.' };

  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, author_id')
    .eq('id', topicId)
    .maybeSingle();
  if (topicError || !topic) return { success: false, error: 'Konu bulunamadı.' };
  if (topic.author_id !== user.id && !isStaffRole(role)) {
    return { success: false, error: 'Bu konuyu düzenleme yetkiniz yok.' };
  }

  const { error } = await supabase
    .from('topics')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', topicId);
  if (error) return { success: false, error: 'Konu güncellenemedi.' };

  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/discussions');
  return { success: true };
}

/** Server Action: Updates a comment for its author or staff. */
export async function updateCommentAction(params: { commentId: string; content: string }) {
  const commentId = (params.commentId || '').trim();
  const content = (params.content || '').trim();
  if (!isUuid(commentId)) return { success: false, error: 'Geçersiz yorum ID.' };
  if (!content || content.length > 100000) return { success: false, error: 'Yorum 1–100.000 karakter arasında olmalıdır.' };

  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Düzenlemek için oturum açmalısınız.' };

  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('id, author_id, topic_id')
    .eq('id', commentId)
    .maybeSingle();
  if (commentError || !comment) return { success: false, error: 'Yorum bulunamadı.' };
  if (comment.author_id !== user.id && !isStaffRole(role)) {
    return { success: false, error: 'Bu yorumu düzenleme yetkiniz yok.' };
  }

  const { error } = await supabase
    .from('comments')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', commentId);
  if (error) return { success: false, error: 'Yorum güncellenemedi.' };

  revalidatePath(`/discussions/${comment.topic_id}`);
  return { success: true };
}

/** Server Action: Deletes a comment for its author or staff. */
export async function deleteCommentAction(commentId: string) {
  const normalizedId = (commentId || '').trim();
  if (!isUuid(normalizedId)) return { success: false, error: 'Geçersiz yorum ID.' };

  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Silmek için oturum açmalısınız.' };

  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('id, author_id, topic_id')
    .eq('id', normalizedId)
    .maybeSingle();
  if (commentError || !comment) return { success: false, error: 'Yorum bulunamadı.' };
  if (comment.author_id !== user.id && !isStaffRole(role)) {
    return { success: false, error: 'Bu yorumu silme yetkiniz yok.' };
  }

  const { error } = await supabase.from('comments').delete().eq('id', normalizedId);
  if (error) return { success: false, error: 'Yorum silinemedi.' };

  revalidatePath(`/discussions/${comment.topic_id}`);
  return { success: true };
}

/** Server Action: Performs staff-only pin/lock moderation. */
export async function moderateTopicAction(params: {
  topicId: string;
  isPinned?: boolean;
  isLocked?: boolean;
}) {
  const topicId = (params.topicId || '').trim();
  if (!isUuid(topicId)) return { success: false, error: 'Geçersiz konu ID.' };
  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user || !isStaffRole(role)) return { success: false, error: 'Bu moderasyon işlemi için staff yetkisi gerekir.' };

  const updates: Record<string, boolean | string> = { updated_at: new Date().toISOString() };
  if (typeof params.isPinned === 'boolean') updates.is_pinned = params.isPinned;
  if (typeof params.isLocked === 'boolean') updates.is_locked = params.isLocked;
  if (Object.keys(updates).length === 1) return { success: false, error: 'Değiştirilecek moderasyon alanı yok.' };

  const { error } = await supabase.from('topics').update(updates).eq('id', topicId);
  if (error) return { success: false, error: 'Moderasyon işlemi başarısız.' };
  revalidatePath(`/discussions/${topicId}`);
  revalidatePath('/discussions');
  return { success: true };
}

/** Server Action: Toggles a user's own topic bookmark with checked errors. */
export async function toggleBookmarkAction(topicId: string) {
  const normalizedId = (topicId || '').trim();
  if (!isUuid(normalizedId)) return { success: false, error: 'Geçersiz konu ID.' };
  const { supabase, user } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Kaydetmek için oturum açmalısınız.' };

  const { data: existing, error: selectError } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('topic_id', normalizedId)
    .maybeSingle();
  if (selectError) return { success: false, error: 'Kayıt durumu alınamadı.' };

  if (existing) {
    const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id);
    if (error) return { success: false, error: 'Kayıt kaldırılamadı.' };
    return { success: true, bookmarked: false };
  }

  const { error } = await supabase.from('bookmarks').insert({ user_id: user.id, topic_id: normalizedId });
  if (error && error.code !== '23505') return { success: false, error: 'Konu kaydedilemedi.' };
  return { success: true, bookmarked: true };
}

/** Server Action: Marks exactly one comment as the topic solution. */
export async function markSolutionAction(topicId: string, commentId: string) {
  if (!isUuid(topicId) || !isUuid(commentId)) return { success: false, error: 'Geçersiz konu veya yorum ID.' };
  const { supabase, user } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Çözüm seçmek için oturum açmalısınız.' };

  const { data: topic } = await supabase.from('topics').select('id, author_id').eq('id', topicId).maybeSingle();
  if (!topic || topic.author_id !== user.id) return { success: false, error: 'Çözümü yalnızca konu sahibi seçebilir.' };
  const { data: comment } = await supabase.from('comments').select('id, topic_id').eq('id', commentId).maybeSingle();
  if (!comment || comment.topic_id !== topicId) return { success: false, error: 'Yorum bu konuya ait değil.' };

  const { error: clearError } = await supabase.from('comments').update({ is_solution: false }).eq('topic_id', topicId);
  if (clearError) return { success: false, error: 'Mevcut çözüm kaldırılamadı.' };
  const { error: markError } = await supabase.from('comments').update({ is_solution: true }).eq('id', commentId);
  if (markError) return { success: false, error: 'Yeni çözüm işaretlenemedi.' };
  const { error: topicError } = await supabase.from('topics').update({ is_solved: true, updated_at: new Date().toISOString() }).eq('id', topicId);
  if (topicError) return { success: false, error: 'Konu çözüm durumu güncellenemedi.' };

  revalidatePath(`/discussions/${topicId}`);
  return { success: true };
}

/** Server Action: Creates a community/category for staff users only. */
export async function createCommunityAction(input: {
  name: string;
  description?: string;
  icon?: string;
  slug?: string;
}) {
  const name = (input.name || '').trim();
  const description = (input.description || '').trim();
  const slug = (input.slug || '').trim().toLowerCase();
  if (name.length < 2 || name.length > 120 || description.length > 5000 || !/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: 'Topluluk alanları geçersiz.' };
  }
  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user || !isStaffRole(role)) return { success: false, error: 'Topluluk oluşturmak için staff yetkisi gerekir.' };
  const { data, error } = await supabase.from('categories').insert({
    id: generateUUID(),
    name,
    description,
    icon: (input.icon || 'users').trim(),
    slug,
  }).select('id, slug').single();
  if (error) return { success: false, error: 'Topluluk oluşturulamadı.' };
  revalidatePath('/communities');
  return { success: true, community: data };
}

/** Server Action: Toggles current-user membership in one community safely. */
export async function toggleCommunityMembershipAction(communityId: string) {
  const normalizedId = (communityId || '').trim();
  if (!isUuid(normalizedId)) return { success: false, error: 'Geçersiz topluluk ID.' };
  const { user } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Topluluğa katılmak için giriş yapmalısınız.' };

  // Use the privileged client only after the actor is authenticated; no caller-supplied user ID is trusted.
  const serviceClient = getSupabaseServer();
  const { data: community } = await serviceClient.from('categories').select('id').eq('id', normalizedId).maybeSingle();
  if (!community) return { success: false, error: 'Topluluk bulunamadı.' };
  const { data: existing, error: existingError } = await serviceClient
    .from('community_members')
    .select('community_id')
    .eq('community_id', normalizedId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (existingError) return { success: false, error: 'Üyelik durumu alınamadı.' };

  if (existing) {
    const { error } = await serviceClient.from('community_members').delete().eq('community_id', normalizedId).eq('user_id', user.id);
    if (error) return { success: false, error: 'Topluluktan ayrılamadınız.' };
    revalidatePath('/communities');
    return { success: true, joined: false };
  }

  const { error } = await serviceClient.from('community_members').insert({ community_id: normalizedId, user_id: user.id });
  if (error && error.code !== '23505') return { success: false, error: 'Topluluğa katılamadınız.' };
  revalidatePath('/communities');
  return { success: true, joined: true };
}

type CategorySeed = {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  parent_slug?: string;
};

/** Server Action: Creates a category only for an authenticated admin. */
export async function adminCreateCategoryAction(input: CategorySeed) {
  const name = (input.name || '').trim();
  const slug = (input.slug || '').trim().toLowerCase();
  if (name.length < 2 || name.length > 120 || !/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: 'Kategori adı veya slug geçersiz.' };
  }
  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user || role !== 'admin') return { success: false, error: 'Yalnızca admin kategori oluşturabilir.' };
  const payload: Record<string, unknown> = {
    id: generateUUID(),
    name,
    slug,
    icon: (input.icon || 'MessageSquare').trim(),
    description: (input.description || '').trim(),
  };
  if (typeof input.sort_order === 'number') payload.sort_order = input.sort_order;
  const { error } = await supabase.from('categories').insert(payload);
  if (error) return { success: false, error: 'Kategori oluşturulamadı.' };
  revalidatePath('/discussions');
  return { success: true };
}

/** Server Action: Seeds or adds categories without deleting existing data. */
export async function adminSeedCategoriesAction(input: { parents: CategorySeed[]; children: CategorySeed[] }) {
  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user || role !== 'admin') return { success: false, error: 'Yalnızca admin kategori düzenleyebilir.' };
  const parentIds = new Map<string, string>();
  for (const parent of input.parents || []) {
    const slug = (parent.slug || '').trim().toLowerCase();
    if (!slug || !parent.name) continue;
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (existing?.id) {
      parentIds.set(slug, existing.id);
      continue;
    }
    const id = generateUUID();
    const { error } = await supabase.from('categories').insert({
      id,
      name: parent.name.trim(),
      slug,
      icon: parent.icon || 'MessageSquare',
      description: (parent.description || '').trim(),
      sort_order: parent.sort_order || 0,
    });
    if (!error) parentIds.set(slug, id);
  }
  for (const child of input.children || []) {
    const slug = (child.slug || '').trim().toLowerCase();
    const parentId = child.parent_slug ? parentIds.get(child.parent_slug) : undefined;
    if (!slug || !child.name || !parentId) continue;
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (existing?.id) continue;
    await supabase.from('categories').insert({
      id: generateUUID(),
      name: child.name.trim(),
      slug,
      icon: child.icon || 'MessageSquare',
      description: (child.description || '').trim(),
      sort_order: child.sort_order || 0,
      parent_id: parentId,
    });
  }
  revalidatePath('/discussions');
  revalidatePath('/communities');
  return { success: true };
}

/** Server Action: Deletes a category only for an authenticated admin. */
export async function adminDeleteCategoryAction(categoryId: string) {
  const normalizedId = (categoryId || '').trim();
  if (!isUuid(normalizedId)) return { success: false, error: 'Geçersiz kategori ID.' };
  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user || role !== 'admin') return { success: false, error: 'Yalnızca admin kategori silebilir.' };
  const { error } = await supabase.from('categories').delete().eq('id', normalizedId);
  if (error) return { success: false, error: 'Kategori silinemedi.' };
  revalidatePath('/discussions');
  return { success: true };
}

/** Server Action: Changes a role with admin-only and last-admin protection. */
export async function adminUpdateRoleAction(userId: string, newRole: 'user' | 'moderator' | 'admin') {
  const targetId = (userId || '').trim();
  if (!isUuid(targetId)) return { success: false, error: 'Geçersiz kullanıcı ID.' };
  const { supabase, user, role } = await getAuthenticatedActor();
  if (!user || role !== 'admin') return { success: false, error: 'Yalnızca admin rol değiştirebilir.' };
  if (targetId === user.id) return { success: false, error: 'Kendi admin yetkinizi bu ekrandan değiştiremezsiniz.' };

  const { data: target, error: targetError } = await supabase.from('profiles').select('id, role').eq('id', targetId).maybeSingle();
  if (targetError || !target) return { success: false, error: 'Kullanıcı bulunamadı.' };
  if (target.role === 'admin' && newRole !== 'admin') {
    const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'admin');
    if ((count || 0) <= 1) return { success: false, error: 'Son admin yetkisi kaldırılamaz.' };
  }

  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetId);
  if (error) return { success: false, error: 'Rol güncellenemedi.' };
  revalidatePath('/admin');
  return { success: true };
}

/** Server Action: Toggles a topic reaction for the authenticated user. */
export async function toggleReactionAction(topicId: string) {
  const normalizedId = (topicId || '').trim();
  if (!isUuid(normalizedId)) return { success: false, error: 'Geçersiz konu ID.' };
  const { supabase, user } = await getAuthenticatedActor();
  if (!user) return { success: false, error: 'Beğenmek için giriş yapmalısınız.' };

  const { data: existing, error: selectError } = await supabase
    .from('reactions')
    .select('id')
    .eq('topic_id', normalizedId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (selectError) return { success: false, error: 'Beğeni durumu alınamadı.' };

  if (existing) {
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id);
    if (error) return { success: false, error: 'Beğeni kaldırılamadı.' };
    return { success: true, reacted: false };
  }

  const { error } = await supabase.from('reactions').insert({
    id: generateUUID(),
    topic_id: normalizedId,
    user_id: user.id,
    reaction_type: 'like',
  });
  if (error && error.code !== '23505') return { success: false, error: 'Beğeni eklenemedi.' };
  return { success: true, reacted: true };
}

/**
 * Server Action: Updates user profile details securely with validation.
 */
export async function updateProfileServerAction(profileData: {
  username?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string | null;
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
    const bio = profileData.bio.trim();
    if (bio.length > 5000) return { success: false, error: 'Biyografi en fazla 5.000 karakter olabilir.' };
    updates.bio = bio || null;
  }

  if (profileData.avatarUrl !== undefined) {
    const avatarUrl = (profileData.avatarUrl || '').trim();
    if (avatarUrl && !/^https:\/\//i.test(avatarUrl)) {
      return { success: false, error: 'Avatar yalnızca güvenli HTTPS URL olabilir.' };
    }
    updates.avatar_url = avatarUrl || null;
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
    return { success: false, error: 'Profil güncellenemedi.' };
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

  const targetId = (reportData.targetId || '').trim();
  const reason = (reportData.reason || '').trim();
  const description = (reportData.description || '').trim();
  if (!isUuid(targetId)) return { success: false, error: 'Geçersiz içerik ID.' };
  if (!['topic', 'comment', 'user'].includes(reportData.targetType)) return { success: false, error: 'Geçersiz bildirim türü.' };
  if (!reason || reason.length > 200) return { success: false, error: 'Bildirim nedeni geçersiz.' };
  if (description.length > 2000) return { success: false, error: 'Açıklama en fazla 2.000 karakter olabilir.' };

  const { error } = await supabase
    .from('reports')
    .insert({
      id: generateUUID(),
      reporter_id: user.id,
      target_id: targetId,
      target_type: reportData.targetType,
      reason,
      description: description || null,
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
export async function getAdminVisitorStatsAction() {
  const { user, role } = await getAuthenticatedActor();
  if (!user || !isStaffRole(role)) {
    return { success: false, error: 'Bu istatistikleri görme yetkiniz yok.' };
  }
  return { success: true, ...(await getVisitorStats()) };
}

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
  if (fileConvId !== conversationId) {
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


