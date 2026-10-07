'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Search, Plus, MessageSquare, Mic, Loader2, X,
  Filter, Home, CheckCircle2, Pin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ClassicThreadRow from '@/components/forum/classic-thread-row';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { Button } from '@/components/ui/button';
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

  useEffect(() => {
    const cat = searchParams?.get('kategori');
    if (cat !== null && cat !== undefined && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

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

  const filteredTopics = topics.filter(topic => {
    if (!searchQuery.trim()) return true;
    const terms = expandSearchQuery(searchQuery);
    return matchQueryWithText(topic.title, terms) || matchQueryWithText(topic.content, terms);
  });

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Tartışmalar &amp; Dayanışma</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                <MessageSquare size={22} className="text-sky-600 dark:text-sky-400" />
                <span>Topluluk Tartışmaları</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Mevzuat, Balthazard formülü, ÖTV 2026, erken emeklilik ve erişilebilir yaşam tecrübeleri
              </p>
            </div>
            <Link href="/new-thread" className="shrink-0">
              <Button variant="primary" size="default" className="gap-2 font-bold w-full sm:w-auto">
                <Plus size={15} />
                <span>Yeni Konu Aç</span>
              </Button>
            </Link>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setActiveTab('solved')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'solved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 size={13} /> Çözülenler
              </button>
              <button
                onClick={() => setActiveTab('pinned')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pinned'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Pin size={13} /> Sabitler
              </button>
            </div>

            {/* Filters: Category dropdown + Search input */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl px-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-600 cursor-pointer max-w-[180px]"
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
                  className="w-full h-9 pl-8 pr-7 bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Temizle"
                  >
                    <X size={13} />
                  </button>
                ) : (
                  <button
                    onClick={startVoiceSearch}
                    className={`absolute right-2 top-2 p-0.5 text-slate-400 hover:text-sky-600 cursor-pointer ${isListening ? 'text-rose-600 animate-pulse' : ''}`}
                    title="Sesli Ara"
                  >
                    <Mic size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Thread List Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white py-3.5 px-5 flex items-center justify-between border-b-2 border-slate-800">
              <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                <MessageSquare size={15} className="text-sky-400" />
                <span>GÜNCEL TARTIŞMALAR</span>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">
                {filteredTopics.length} Konu
              </span>
            </div>

            <div className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {loading && topics.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={24} className="animate-spin text-sky-600" />
                  <span className="text-xs font-semibold">Tartışmalar yükleniyor...</span>
                </div>
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <ClassicThreadRow key={topic.id} topic={topic} />
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-bold bg-slate-50/50 dark:bg-slate-950/20">
                  Arama kriterlerinize uygun tartışma konusu bulunamadı.
                </div>
              )}
            </div>
          </div>

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center pt-2">
              <Button
                onClick={() => fetchTopics(true)}
                variant="secondary"
                size="default"
                className="font-bold text-xs"
              >
                Daha Fazla Tartışma Göster
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4">
          <ClassicSidebar />
        </div>
      </div>
    </div>
  );
}

export default function DiscussionsPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-sky-600" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Yükleniyor...</span>
      </div>
    }>
      <DiscussionsContent />
    </Suspense>
  );
}
