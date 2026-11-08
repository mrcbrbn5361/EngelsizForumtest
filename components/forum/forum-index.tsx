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
      let { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (catError) console.warn('Categories fetch error:', catError);

      // Auto-seed default categories if empty
      if (!catData || catData.length === 0) {
        const defaultCategories = [
          { id: '11111111-1111-1111-1111-111111111111', name: 'Yazılım, WebMCP & Yapay Zeka', slug: 'yazilim-ai', description: 'Yapay zeka modelleri, WebMCP araçları, açık kaynak ve teknoloji tartışmaları.', icon_name: 'Cpu', order_index: 1 },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Engelli Hakları & 2026 Mevzuatı', slug: 'haklar-ve-mevzuat', description: '2.873.972 TL ÖTV araç istisnası, Balthazard cetveli, SGK erken emeklilik.', icon_name: 'Scale', order_index: 2 },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Donanım, Sistemler & Windows 11', slug: 'donanim-sistemler', description: 'Microsoft Windows 11 Fluent ekosistemi, bilgisayar ve yardımcı donanımlar.', icon_name: 'Monitor', order_index: 3 },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Kariyer, E-KPSS & Girişimcilik', slug: 'kariyer-istihdam', description: 'E-KPSS atamaları, uzaktan bilişim kariyerleri ve engelsiz girişimcilik.', icon_name: 'Briefcase', order_index: 4 },
          { id: '55555555-5555-5555-5555-555555555555', name: 'Sağlık, Medikal & Tedavi', slug: 'saglik-ve-medikal', description: 'Sağlık kurulu raporları, tedavi süreçleri ve medikal cihaz rehberleri.', icon_name: 'HeartPulse', order_index: 5 },
          { id: '66666666-6666-6666-6666-666666666666', name: 'Genel Sohbet & Topluluk', slug: 'genel-sohbet', description: 'Serbest sohbet, tanışma, deneyim paylaşımları ve dayanışma ağı.', icon_name: 'Users', order_index: 6 }
        ];

        const { error: seedCatErr } = await supabase
          .from('categories')
          .insert(defaultCategories);
        
        if (!seedCatErr) {
          const { data: reFetchedCats } = await supabase
            .from('categories')
            .select('*')
            .order('order_index', { ascending: true });
          if (reFetchedCats) {
            catData = reFetchedCats;
          }
        }
      }

      if (catData && catData.length > 0) {
        setCategories(catData as Category[]);
      }

      // Fetch Real Threads/Topics from Supabase
      let threadData: any = null;
      const threadsRes = await supabase
        .from('threads')
        .select(`
          *,
          author:profiles(id, username, avatar_url, display_name, full_name, role, last_seen_at),
          category:categories(id, name, slug)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(25);

      if (threadsRes.data && threadsRes.data.length > 0) {
        threadData = threadsRes.data;
      } else {
        // Fallback to topics view if threads empty
        const topicsRes = await supabase
          .from('topics')
          .select(`
            *,
            author:profiles(id, username, avatar_url, display_name, full_name, role, last_seen_at),
            category:categories(id, name, slug)
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(25);
        if (topicsRes.data && topicsRes.data.length > 0) {
          threadData = topicsRes.data;
        }
      }

      setTopics(threadData || []);

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
