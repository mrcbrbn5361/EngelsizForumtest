'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ForumIndexClient } from './forum-index-client';
import { Loader2 } from 'lucide-react';

export function ForumIndex() {
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch Categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (catData && catData.length > 0) {
          setCategories(catData);
        }

        // Fetch Threads/Topics
        let threadData = null;
        const threadsRes = await supabase
          .from('threads')
          .select(`
            *,
            author:profiles(username, avatar_url, display_name, role),
            category:categories(name, slug)
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(20);

        if (threadsRes.data && threadsRes.data.length > 0) {
          threadData = threadsRes.data;
        } else {
          // Fallback to topics view if threads empty
          const topicsRes = await supabase
            .from('topics')
            .select(`
              *,
              author:profiles(username, avatar_url, display_name, role),
              category:categories(name, slug)
            `)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(20);
          if (topicsRes.data) {
            threadData = topicsRes.data;
          }
        }

        if (threadData && threadData.length > 0) {
          setTopics(threadData);
        }

        // Fetch Real Database Statistics from Supabase (threads, posts, profiles)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayIso = todayStart.toISOString();

        // 1. Total & Today's Topics (threads)
        let totalTopics = 0;
        let todayTopics = 0;
        
        const { count: threadsCount } = await supabase
          .from('threads')
          .select('*', { count: 'exact', head: true });
        
        if (threadsCount !== null && threadsCount !== undefined) {
          totalTopics = threadsCount;
        } else {
          const { count: topicsCount } = await supabase
            .from('topics')
            .select('*', { count: 'exact', head: true });
          totalTopics = topicsCount || 0;
        }

        const { count: tTodayCount } = await supabase
          .from('threads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayIso);
        todayTopics = tTodayCount || 0;

        // 2. Total & Today's Posts / Comments
        let totalComments = 0;
        let todayComments = 0;

        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        if (postsCount !== null && postsCount !== undefined) {
          totalComments = postsCount;
        } else {
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true });
          totalComments = commentsCount || 0;
        }

        const { count: pTodayCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', todayIso);
        todayComments = pTodayCount || 0;

        // 3. Total Members & Newest Member from profiles
        const { count: totalMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { data: newestMemberData } = await supabase
          .from('profiles')
          .select('username, display_name')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const newestMember = newestMemberData?.username || newestMemberData?.display_name || '';

        // 4. Active / Recent Members
        const { data: activeMembersData } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, role, updated_at')
          .order('updated_at', { ascending: false })
          .limit(10);

        // 5. Top Contributors
        const { data: topContributorsData } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, reputation_points, role')
          .order('reputation_points', { ascending: false })
          .limit(5);

        // 6. Trending Tags / Categories
        const trendingTags = (catData || []).slice(0, 6).map((c: any) => ({ name: c.name || c.title, slug: c.slug }));

        setStats({
          totalTopics: totalTopics || (threadData ? threadData.length : 0),
          todayTopics: todayTopics || 0,
          totalComments: totalComments || 0,
          todayComments: todayComments || 0,
          totalMembers: totalMembers || 0,
          newestMember: newestMember,
          activeMembers: activeMembersData || [],
          topContributors: topContributorsData || [],
          trendingTags: trendingTags || []
        });

      } catch (err) {
        console.warn('Error fetching Supabase stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          EngelsizForum verileri yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <ForumIndexClient 
      initialTopics={topics} 
      initialCategories={categories}
      stats={stats}
    />
  );
}

