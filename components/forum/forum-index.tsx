'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ForumIndexClient } from './forum-index-client';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Topic, Category } from '@/types/database';

export function ForumIndex() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (catError) console.warn('Categories fetch error:', catError);

      if (catData && catData.length > 0) {
        setCategories(catData as Category[]);
      }

      const { data: threadData } = await supabase
        .from('topics')
        .select(`
          *,
          author:profiles(id, username, avatar_url, display_name, full_name, role),
          category:categories(id, name, slug)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(25);

      setTopics(threadData || []);

      // Fetch Real Database Statistics from Supabase (topics, comments, profiles)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayIso = todayStart.toISOString();

      // 1. Total & Today's Topics
      let totalTopics = 0;
      let todayTopics = 0;
      
      const { count: topicsCount } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true });
      totalTopics = topicsCount || 0;

      const { count: tTodayCount } = await supabase
        .from('topics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayIso);
      todayTopics = tTodayCount || 0;

      // 2. Total & Today's Posts / Comments
      let totalComments = 0;
      let todayComments = 0;

      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      totalComments = commentsCount || 0;

      const { count: pTodayCount } = await supabase
        .from('comments')
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

      // 4. Online & Active Members (5-minute presence threshold)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { count: onlineCountData } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen_at', fiveMinutesAgo);

      const { data: activeMembersData } = await supabase
        .from('profiles')
        .select('id, username, display_name, full_name, avatar_url, role, updated_at, last_seen_at')
        .order('last_seen_at', { ascending: false, nullsFirst: false })
        .limit(20);

      // 5. Top Contributors
      const { data: topContributorsData } = await supabase
        .from('profiles')
        .select('id, username, display_name, full_name, avatar_url, reputation_points, role')
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
        onlineCount: onlineCountData !== null && onlineCountData !== undefined ? onlineCountData : 0,
        topContributors: topContributorsData || [],
        trendingTags: trendingTags || []
      });

    } catch (err: any) {
      console.warn('Error fetching Supabase stats:', err);
      setError(err?.message || 'Veriler yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 flex flex-col items-center justify-center space-y-4" role="status">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" aria-hidden="true" />
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          EngelsizForum verileri yükleniyor...
        </p>
      </div>
    );
  }

  if (error && topics.length === 0 && categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center space-y-4 text-center" role="alert">
        <AlertCircle className="w-10 h-10 text-rose-400" aria-hidden="true" />
        <h2 className="text-lg font-bold text-slate-100">Veriler Yüklenemedi</h2>
        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
          {error}
        </p>
        <button
          onClick={() => fetchData()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Tekrar Dene
        </button>
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
