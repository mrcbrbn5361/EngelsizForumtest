'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { 
  Search, Plus, Sparkles, MessageSquare, Mic, Loader2, X,
  Filter, ChevronRight, Home, CheckCircle2, Pin, Flame
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ClassicThreadRow from '@/components/forum/classic-thread-row';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { toast } from 'sonner';
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
  const [isListening, setIsListening] = useState(false);

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
        const formatted = data.map((t: any) => ({
          ...t,
          replyCount: t.comments_count || 0,
          viewCount: t.views_count || 0,
          author: t.author || { id: t.author_id, username: 'Anonim' }
        }));

        if (isLoadMore) {
          setTopics(prev => [...prev, ...formatted]);
          setPage(currentPage);
        } else {
          setTopics(formatted);
          setPage(1);
        }

        setHasMore(data.length === pageSize);
      }
    } catch (err: any) {
      console.error('Error fetching discussions:', err);
      toast.error('Tartışmalar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedCategory, activeTab, categories]);

  useEffect(() => {
    fetchTopics(false);
  }, [selectedCategory, activeTab]);

  // Sync category from search params
  useEffect(() => {
    const cat = searchParams?.get('kategori');
    if (cat !== null && cat !== undefined && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Voice Search handler
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Sesle arama dinleniyor, lütfen konuşun...');
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Aranan: "${transcript}"`);
    };
    recognition.start();
  };

  // Local filter for quick search
  const filteredTopics = topics.filter(topic => {
    if (!searchQuery.trim()) return true;
    const terms = expandSearchQuery(searchQuery);
    return matchQueryWithText(topic.title, terms) || matchQueryWithText(topic.content, terms);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* XenForo Breadcrumbs */}
      <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mb-2">
        <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
        <span className="opacity-50">/</span>
        <span className="font-bold text-slate-800">Tartışmalar &amp; Danışma</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Feed Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Header & New Thread Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h1 className="text-xl font-black text-[#185886] uppercase tracking-wide flex items-center gap-2">
                <MessageSquare size={20} className="text-[#185886]" />
                Topluluk Tartışmaları
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Mevzuat, ÖTV 2026, erken emeklilik ve engelsiz yaşam tecrübeleri
              </p>
            </div>
            <Link 
              href="/discussions/new" 
              className="bg-[#f2930d] hover:bg-[#d5800a] text-white px-4.5 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              <span>Yeni Konu Aç</span>
            </Link>
          </div>

          {/* XenForo Filter & Search Toolbar */}
          <div className="bg-white border border-slate-200 rounded-sm p-3 flex flex-col md:flex-row gap-3 items-center justify-between shadow-2xs">
            {/* XenForo Navigation Tabs */}
            <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-[#185886] text-white shadow-2xs'
                    : 'bg-[#eef2f7] hover:bg-slate-200 text-slate-700'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setActiveTab('solved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  activeTab === 'solved'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-[#eef2f7] hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CheckCircle2 size={12} /> Çözülenler
              </button>
              <button
                onClick={() => setActiveTab('pinned')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                  activeTab === 'pinned'
                    ? 'bg-[#185886] text-white shadow-2xs'
                    : 'bg-[#eef2f7] hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Pin size={12} /> Sabitler
              </button>
            </div>

            {/* Filters: Category dropdown + Search input */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 bg-slate-50 border border-slate-300 rounded-sm px-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#185886] cursor-pointer max-w-[180px]"
                aria-label="Kategoriye göre filtrele"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug || c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-48">
                <input
                  type="text"
                  placeholder="Başlıkta filtrele..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-7 pr-7 bg-slate-50 border border-slate-300 rounded-sm text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#185886]"
                />
                <Search size={12} className="absolute left-2 top-2.5 text-slate-400" />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    title="Temizle"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <button
                    onClick={startVoiceSearch}
                    className={`absolute right-1.5 top-1 p-1 text-slate-400 hover:text-[#185886] ${isListening ? 'text-rose-600 animate-pulse' : ''}`}
                    title="Sesli Ara"
                  >
                    <Mic size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* XenForo Thread List Container */}
          <div className="xf-block rounded-sm overflow-hidden border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="xf-block-header bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 py-3 px-4 flex items-center justify-between text-[#185886] font-black text-xs uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <MessageSquare size={13} />
                <span>KONULAR</span>
              </div>
              <div className="hidden md:flex items-center gap-12 pr-6 text-slate-500 font-bold text-[11px]">
                <span>CEVAP / GÖRÜNTÜLENME</span>
                <span className="w-28 text-left">SON MESAJ</span>
              </div>
            </div>

            {/* Thread Rows */}
            <div className="flex flex-col divide-y divide-slate-100">
              {loading && topics.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={24} className="animate-spin text-[#185886]" />
                  <span className="text-xs font-medium">Tartışmalar yükleniyor...</span>
                </div>
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <ClassicThreadRow key={topic.id} topic={topic} />
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 italic text-xs bg-slate-50/50">
                  Arama kriterlerinize uygun tartışma konusu bulunamadı.
                </div>
              )}
            </div>
          </div>

          {/* Pagination / Load More */}
          {hasMore && !loading && (
            <div className="text-center pt-2">
              <button
                onClick={() => fetchTopics(true)}
                className="bg-white hover:bg-slate-50 text-[#185886] border border-slate-300 px-6 py-2 rounded-sm text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
              >
                Daha Fazla Tartışma Göster
              </button>
            </div>
          )}

          {/* Bottom Breadcrumbs */}
          <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mt-4">
            <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
            <span className="opacity-50">/</span>
            <span className="font-bold text-slate-800">Tartışmalar &amp; Danışma</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <ClassicSidebar />
      </div>
    </div>
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#185886]" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Yükleniyor...</span>
      </div>
    }>
      <DiscussionsContent />
    </Suspense>
  );
}
