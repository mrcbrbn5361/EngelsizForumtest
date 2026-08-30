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
          { id: '11111111-1111-1111-1111-111111111111', name: 'Haklar ve Mevzuat', slug: 'haklar-ve-mevzuat', description: 'Engelli hakları, yasal süreçler, SGK, ÖTV muafiyeti ve istihdam rehberleri.', icon_name: 'Scale', order_index: 1 },
          { id: '22222222-2222-2222-2222-222222222222', name: 'Sağlık ve Medikal', slug: 'saglik-ve-medikal', description: 'Sağlık raporları, tedavi süreçleri, medikal donanım ve rehabilitasyon.', icon_name: 'HeartPulse', order_index: 2 },
          { id: '33333333-3333-3333-3333-333333333333', name: 'Erişilebilirlik ve Teknoloji', slug: 'erisilebilirlik-ve-teknoloji', description: 'Ekran okuyucular, yardımcı yazılımlar ve erişilebilir yaşam çözümleri.', icon_name: 'Accessibility', order_index: 3 },
          { id: '44444444-4444-4444-4444-444444444444', name: 'Sosyal Yaşam ve Dayanışma', slug: 'sosyal-yasam-ve-dayanisma', description: 'Sosyal aktiviteler, deneyim paylaşımları, spor, sanat ve dayanışma ağları.', icon_name: 'Users', order_index: 4 }
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

      // Seed default expert profiles for discussions
      const seedProfiles = [
        { id: '88888888-8888-8888-8888-888888888888', username: 'Aria', display_name: 'Aria (Erişilebilirlik Uzmanı)', full_name: 'Aria Demir', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'moderator', xp: 450, level: 8, reputation_points: 120, bio: 'UI/UX ve Erişilebilirlik Danışmanı' },
        { id: '99999999-9999-9999-9999-999999999999', username: 'Bora', display_name: 'Bora (Hukuk Danışmanı)', full_name: 'Bora Yılmaz', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'admin', xp: 820, level: 12, reputation_points: 340, bio: 'Sosyal Haklar ve Engelli Mevzuatı Uzmanı' },
        { id: '77777777-7777-7777-7777-777777777777', username: 'Felix', display_name: 'Felix (Yazılım Geliştirici)', full_name: 'Felix Tan', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'moderator', xp: 620, level: 10, reputation_points: 190, bio: 'Engelsiz Teknoloji ve Web Geliştirici' }
      ];

      for (const p of seedProfiles) {
        const { data: pExists } = await supabase.from('profiles').select('id').eq('id', p.id).maybeSingle();
        if (!pExists) {
          await supabase.from('profiles').insert([p]);
        }
      }

      // Fetch Threads/Topics
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

      // Auto-seed default threads if empty
      if (!threadData || threadData.length === 0) {
        const defaultThreads = [
          {
            id: 'aaaa1111-1111-1111-1111-111111111111',
            title: '2026 Yılı ÖTV Muafiyetli Araç Alım Üst Limiti ve Merak Edilenler',
            slug: '2026-yili-otv-muafiyetli-arac-alim-ust-limiti-ve-merak-edilenler',
            content: 'Değerli dostlar, 2026 yılı ÖTV muafiyetli araç alım üst limiti Resmi Gazete yayını ile güncellendi. Yeni limit, yeniden değerleme oranı kapsamında 2.300.000 TL olarak belirlenmiştir. Bu limit dahilinde alınabilecek SUV, Sedan ve Hatchback model seçeneklerini, bayi bayi dolaşarak teyit ettiğimiz stok durumlarını ve rapor onay süreçlerini bu başlık altında güncel olarak paylaşıyoruz. Rapor onayında gecikme yaşayan arkadaşlarımızın bölge SGK veya il sağlık müdürlüklerine yazılı dilekçeyle başvuru yapması süreci hızlandırabilir.',
            category_id: '11111111-1111-1111-1111-111111111111',
            author_id: '99999999-9999-9999-9999-999999999999',
            is_pinned: true,
            is_locked: false,
            is_solved: true,
            views_count: 342,
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            id: 'bbbb2222-2222-2222-2222-222222222222',
            title: 'Balthazard Formülü Hesaplama Tablosu ve Çoklu Engel Oranı Belirleme',
            slug: 'balthazard-formulu-hesaplama-tablosu-ve-coklu-engel-orani-belirleme',
            content: 'Birden fazla uzuv kaybı veya kronik rahatsızlığı bulunan bireylerin engellilik oranlarının birleştirilmesinde kullanılan Balthazard Formülü, en yüksek engel oranından başlanarak sırasıyla kalan sağlam vücut yüzdesi üzerinden hesaplama yapmaktadır. Örneğin %40 ve %30 iki oran varsa toplam %70 yapmaz, %58 yapar. Bu başlıkta, heyete giren arkadaşlarımızın rapor oranlarını hesaplayabilmesi için canlı örnekler sunuyor ve sorularınızı yanıtlıyoruz.',
            category_id: '22222222-2222-2222-2222-222222222222',
            author_id: '88888888-8888-8888-8888-888888888888',
            is_pinned: false,
            is_locked: false,
            is_solved: true,
            views_count: 189,
            created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
          },
          {
            id: 'cccc3333-3333-3333-3333-333333333333',
            title: 'Görme Engelliler İçin En İyi NVDA ve JAWS Ekran Okuyucu Eklentileri',
            slug: 'gorme-engelliler-icin-en-iyi-nvda-ve-jaws-ekran-okuyucu-eklentileri',
            content: 'İnternet gezintilerinde ve günlük bilgisayar kullanımında ekran okuyucuların performansını ve erişilebilirliğini artıran en popüler eklentileri derledik. OCR (Optik Karakter Tanıma) entegrasyonu, yapay zeka betimleme modülleri ve Türkçe ses paketleri kurulum yönergelerini burada bulabilirsiniz. Eklenti paketlerini ve yapılandırma dosyalarını indirmek için aşağıdaki rehberi inceleyebilirsiniz.',
            category_id: '33333333-3333-3333-3333-333333333333',
            author_id: '77777777-7777-7777-7777-777777777777',
            is_pinned: false,
            is_locked: false,
            is_solved: false,
            views_count: 124,
            created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
          },
          {
            id: 'dddd4444-4444-4444-4444-444444444444',
            title: 'SGK Engelli Erken Emeklilik Şartları ve Başvuru Süreci (Yıl/Gün Tablosu)',
            slug: 'sgk-engelli-erken-emeklilik-sartlari-ve-basvuru-sureci-yil-gun-tablosu',
            content: 'İlk sigorta giriş tarihinize, prim gün sayınıza ve vergi indirimi derecenize (1., 2. veya 3. derece) göre ne zaman emekli olabileceğinizi gösteren güncel SGK engelli erken emeklilik rehberi. Yaş şartı aranmaksızın, sadece sigortalılık süresi ve prim gün sayısı ile emeklilik hakkı kazanma adımlarını adım adım inceliyoruz.',
            category_id: '11111111-1111-1111-1111-111111111111',
            author_id: '99999999-9999-9999-9999-999999999999',
            is_pinned: false,
            is_locked: false,
            is_solved: false,
            views_count: 245,
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ];

        const { error: seedThreadsErr } = await supabase
          .from('threads')
          .insert(defaultThreads);

        if (seedThreadsErr) {
          await supabase.from('topics').insert(defaultThreads);
        }

        // Re-fetch
        const threadsRes2 = await supabase
          .from('threads')
          .select(`
            *,
            author:profiles(id, username, avatar_url, display_name, full_name, role, last_seen_at),
            category:categories(id, name, slug)
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(25);

        if (threadsRes2.data && threadsRes2.data.length > 0) {
          threadData = threadsRes2.data;
        } else {
          const topicsRes2 = await supabase
            .from('topics')
            .select(`
              *,
              author:profiles(id, username, avatar_url, display_name, full_name, role, last_seen_at),
              category:categories(id, name, slug)
            `)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(25);
          if (topicsRes2.data) {
            threadData = topicsRes2.data;
          }
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
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" aria-hidden="true" />
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
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
