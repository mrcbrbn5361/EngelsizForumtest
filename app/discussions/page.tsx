'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Search, Plus, MessageSquare,
  Home, CheckCircle2, Pin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ClassicThreadRow from '@/components/forum/classic-thread-row';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { expandSearchQuery, matchQueryWithText } from '@/lib/search-dictionary';

function DiscussionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [topics, setTopics] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('kategori') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'popular' | 'pinned'>('all');
  
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(true);

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true });
        if (!error && data) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch topics
  const fetchTopics = useCallback(async (isLoadMore = false) => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      if (!isLoadMore) setLoading(true);

      const currentPage = isLoadMore ? page + 1 : 1;
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('topics')
        .select(`
          id, title, content, author_id, category_id, is_pinned, is_locked, is_solved,
          views_count, comments_count, created_at, updated_at, slug,
          author:profiles(id, username, avatar_url, role, level),
          category:categories(name, slug, id)
        `);

      if (selectedCategory) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedCategory);
        if (isUUID) {
          query = query.eq('category_id', selectedCategory);
        } else {
          const matched = categories.find(c => c.slug === selectedCategory);
          if (matched) {
            query = query.eq('category_id', matched.id);
          }
        }
      }

      if (activeTab === 'solved') {
        query = query.eq('is_solved', true);
      } else if (activeTab === 'pinned') {
        query = query.eq('is_pinned', true);
      }

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        const mapped = data.map(item => ({
          ...item,
          replyCount: item.comments_count || 0,
          viewCount: item.views_count || 0,
        }));

        if (isLoadMore) {
          setTopics(prev => [...prev, ...mapped]);
          setPage(currentPage);
        } else {
          setTopics(mapped);
          setPage(1);
        }

        setHasMore(data.length === pageSize);
      }
    } catch (err: any) {
      console.error('Error fetching discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activeTab, categories, page]);

  useEffect(() => {
    fetchTopics(false);
  }, [selectedCategory, activeTab]);

  const filteredTopics = topics.filter(topic => {
    if (!searchQuery.trim()) return true;
    const terms = expandSearchQuery(searchQuery);
    return matchQueryWithText(topic.title, terms) || matchQueryWithText(topic.content, terms);
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Link href="/" className="hover:text-white transition-colors">
          Forum
        </Link>
        <span>/</span>
        <span className="text-white font-semibold">Tartışmalar</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363d]">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Topluluk Tartışmaları
              </h1>
              <p className="text-sm text-slate-300 mt-1 font-medium">
                Engelli hakları, ÖTV muafiyeti, Balthazard ve mevzuat deneyim paylaşımları.
              </p>
            </div>
            <Link 
              href="/discussions/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-100 text-black text-xs font-bold self-start sm:self-auto transition-colors"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Yeni Konu</span>
            </Link>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-3 border-b border-[#30363d]">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'solved', label: 'Çözülenler' },
                { id: 'pinned', label: 'Sabitler' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-slate-200 hover:text-white hover:bg-[#21262d] bg-[#161b22] border border-[#30363d]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 bg-[#161b22] border border-[#30363d] rounded-md px-2.5 text-xs font-semibold text-white focus:outline-none focus:border-sky-400 cursor-pointer"
                aria-label="Kategori filtresi"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-48">
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Başlıklarda ara..."
                  className="w-full h-9 pl-8 pr-2.5 text-xs bg-[#161b22] border border-[#30363d] rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Topics List */}
          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-300">
              Tartışmalar yükleniyor...
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="space-y-1">
              {filteredTopics.map((topic) => (
                <ClassicThreadRow key={topic.id} topic={topic} />
              ))}

              {hasMore && (
                <div className="pt-6 text-center">
                  <button
                    onClick={() => fetchTopics(true)}
                    className="px-4 py-2 rounded-md bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Daha Fazla Göster
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-300 space-y-2">
              <MessageSquare size={28} className="mx-auto text-slate-400" />
              <div className="text-sm font-bold">Bu kriterlerde konu bulunamadı.</div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-slate-300 font-bold">Yükleniyor...</div>}>
      <DiscussionsContent />
    </Suspense>
  );
}
