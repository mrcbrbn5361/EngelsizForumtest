'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Real-time Topic hook
 * Synchronizes single topic data and its posts across all connected clients.
 */
export function useRealtimeTopic(topicId: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;

    async function fetchInitialData() {
      setLoading(true);
      try {
        const { data: topicData } = await supabase
          .from('topics')
          .select('*, author:profiles(username, avatar_url), category:categories(name, slug)')
          .eq('id', topicId)
          .single();
        
        const { data: postsData } = await supabase
          .from('posts')
          .select('*, author:profiles(username, avatar_url, role)')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });

        setTopic(topicData);
        setPosts(postsData || []);
      } catch (err) {
        console.error('Real-time topic fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    // Subscribe to new posts
    const channel = supabase
      .channel(`topic_realtime_${topicId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts', filter: `topic_id=eq.${topicId}` },
        async (payload) => {
          const { data } = await supabase
            .from('posts')
            .select('*, author:profiles(username, avatar_url, role)')
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setPosts(prev => [...prev, data]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'topics', filter: `id=eq.${topicId}` },
        (payload) => {
          setTopic((prev: any) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId]);

  return { topic, posts, loading };
}
