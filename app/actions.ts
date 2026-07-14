'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseServer } from '@/lib/supabase-server';

import { awardXP, ACTIONS } from '@/lib/reputation';

export async function createTopic(formData: { title: string; category_id: string; content: string; author_id: string }) {
  const { data, error } = await supabaseServer
    .from('topics')
    .insert(formData)
    .select()
    .single();

  if (error) throw error;

  // Award XP
  await awardXP(formData.author_id, ACTIONS.CREATE_TOPIC);

  return data;
}

export async function createComment(formData: { topic_id: string; author_id: string; content: string }) {
  const { data, error } = await supabaseServer
    .from('comments')
    .insert(formData)
    .select('*, author:profiles(*)')
    .single();

  if (error) throw error;

  // Award XP
  await awardXP(formData.author_id, ACTIONS.CREATE_COMMENT);

  return data;
}

export async function markAsSolved(topicId: string, userId: string) {
  const { data: topic, error: fetchError } = await supabaseServer
    .from('topics')
    .select('author_id, is_solved')
    .eq('id', topicId)
    .single();

  if (fetchError || !topic) throw new Error('Konu bulunamadı');
  if (topic.author_id !== userId) throw new Error('Sadece konu sahibi çözüldü işaretleyebilir');
  if (topic.is_solved) return { success: true };

  const { error } = await supabaseServer
    .from('topics')
    .update({ is_solved: true })
    .eq('id', topicId);

  if (error) throw error;

  // Award XP for solving own problem (encouraging closure)
  await awardXP(userId, ACTIONS.TOPIC_SOLVED);

  return { success: true };
}

export async function toggleLike(topicId: string, userId: string) {
  const { data: existing, error: checkError } = await supabaseServer
    .from('reactions')
    .select('id')
    .eq('topic_id', topicId)
    .eq('user_id', userId)
    .maybeSingle();

  if (checkError) throw checkError;

  if (existing) {
    // Unlike
    const { error: deleteError } = await supabaseServer
      .from('reactions')
      .delete()
      .eq('id', existing.id);
    
    if (deleteError) throw deleteError;
    return { liked: false };
  } else {
    // Like
    const { error: insertError } = await supabaseServer
      .from('reactions')
      .insert({
        topic_id: topicId,
        user_id: userId,
        reaction_type: 'like'
      });
    
    if (insertError) throw insertError;

    // Award XP to the liker
    await awardXP(userId, ACTIONS.GIVE_REACTION);

    // Get the topic author to award them XP too
    const { data: topic } = await supabaseServer
      .from('topics')
      .select('author_id')
      .eq('id', topicId)
      .single();
    
    if (topic) {
      await awardXP(topic.author_id, ACTIONS.RECEIVE_REACTION);
    }

    return { liked: true };
  }
}

export async function getVisitorStats() {
  const cookieStore = await cookies();
  console.log('getVisitorStats: cookies available:', cookieStore.getAll().length);
  
  const supabase = createServerClient(
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

  // const { data: { user }, error: userError } = await supabase.auth.getUser();
  // if (userError) {
  //   console.error('getVisitorStats: getUser error:', userError);
  // }
  // if (!user) {
  //   console.error('getVisitorStats: No user found');
  //   throw new Error('Unauthorized');
  // }

  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // if (profile?.role !== 'admin') {
  //   console.error('getVisitorStats: User is not admin', profile);
  //   throw new Error('Unauthorized');
  // }

  const { count: totalCount, error: totalError } = await supabaseServer
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Failed to fetch total visitors:', totalError);
  }

  // Son 5 dakika içinde aktif olanları say
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

export async function recordVisitor(deviceId: string) {
  if (!deviceId) return;

  const { error } = await supabaseServer
    .from('visitors')
    .upsert(
      { device_id: deviceId, last_seen: new Date().toISOString() },
      { onConflict: 'device_id' }
    );

  if (error) {
    console.error('Error recording visitor:', error);
    throw error;
  }
  return { success: true };
}
