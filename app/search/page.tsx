'use client';

import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { Search, Filter, Loader2, Mic, Sparkles, ChevronRight, X, Home, MessageSquare, Calculator, ArrowRight, Building2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { expandSearchQuery, matchQueryWithText } from '@/lib/search-dictionary';
import { searchWithTypoTolerance } from '@/lib/seo-keyword-matrix';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQ = searchParams?.get('q') || searchParams?.get('query') || '';
  const initialCat = searchParams?.get('category') || searchParams?.get('kategori') || '';

  const [query, setQuery] = useState(initialQ);
  const [categoryId, setCategoryId] = useState<string>(initialCat);
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [expandedTermsUsed, setExpandedTermsUsed] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching search categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const performSearch = useCallback(async (searchQuery: string, catId: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed && !catId) {
      setResults([]);
      setExpandedTermsUsed([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);

    if (!isSupabaseConfigured) {
      setResults([]);
      setLoading(false);
      return;
    }

    try {
      let queryBuilder = supabase
        .from('topics')
        .select(`
          id, title, content, author_id, category_id, views_count, comments_count, created_at, updated_at, slug,
          category:categories(id, name, slug),
          author:profiles(id, username, avatar_url, full_name, role)
        `)
        .limit(50);

      if (trimmed) {
        const terms = expandSearchQuery(trimmed).slice(0, 8);
        setExpandedTermsUsed(terms);
        
        const orConditions = terms
          .map(term => `title.ilike.%${term}%,content.ilike.%${term}%`)
          .join(',');
        
        queryBuilder = queryBuilder.or(orConditions);
      } else {
        setExpandedTermsUsed([]);
      }
      
      if (catId) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId);
        if (isUuid) {
          queryBuilder = queryBuilder.eq('category_id', catId);
        } else {
          const matched = categories.find(c => c.slug === catId);
          if (matched) {
            queryBuilder = queryBuilder.eq('category_id', matched.id);
          }
        }
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        toast.error('Arama sırasında bir hata oluştu.');
        setResults([]);
      } else {
        setResults(data || []);
      }
    } catch (err) {
      console.error('Search crash:', err);
      toast.error('Arama servisine ulaşılamadı.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const updateUrl = (q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    router.replace(`/search?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, categoryId);
    performSearch(query, categoryId);
  };

  useEffect(() => {
    if (initialQ || initialCat) {
      performSearch(initialQ, initialCat);
    }
  }, []);

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
      toast.info("Ses dinleniyor, lütfen konuşun...");
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      toast.success(`Aranan: "${transcript}"`);
      performSearch(transcript, categoryId);
      updateUrl(transcript, categoryId);
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl mb-2 shadow-xs">
        <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
          <Home size={14} />
          <span>Ana Sayfa</span>
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/discussions" className="hover:text-sky-600 font-semibold">Forumlar</Link>
        <span className="opacity-40">/</span>
        <span className="font-extrabold text-slate-950 dark:text-white">Arama</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Search Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Header */}
          <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-3">
            <h1 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-wide flex items-center gap-2">
              <Search size={20} className="text-sky-700 dark:text-sky-400" />
              <span>FORUMDA ARA</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Mevzuat maddesi, başlık veya anahtar kelimelere göre gelişmiş forum araması
            </p>
          </div>

          {/* Search Form Box */}
          <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Konularda veya mesajlarda ara..."
                    className="w-full h-10 pl-10 pr-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-sky-600 focus:outline-none font-medium"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-10 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-sky-600 focus:outline-none cursor-pointer sm:w-48"
                  aria-label="Kategoriye göre filtrele"
                >
                  <option value="">Tüm Forumlar</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className={`h-10 px-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isListening ? 'bg-rose-600 text-white' : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                    title="Sesli Ara"
                  >
                    <Mic size={15} />
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-10 px-6 bg-sky-700 hover:bg-sky-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : 'Ara'}
                  </button>
                </div>
              </div>

              {expandedTermsUsed.length > 1 && (
                <div className="flex items-center gap-1.5 text-[11px] text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 font-semibold">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Eş Anlamlı Genişletme:</span>
                  <span className="text-slate-600 dark:text-slate-400 font-normal">{expandedTermsUsed.join(', ')}</span>
                </div>
              )}
            </form>
          </div>

          {/* Akıllı Mevzuat & Hesaplama Robotu Eşleşmesi (Fuzzy / Typo Toleransı) */}
          {searched && query.trim() && (
            (() => {
              const matched = searchWithTypoTolerance(query).slice(0, 2);
              if (matched.length === 0) return null;

              return (
                <div className="space-y-2.5">
                  {matched.map((item) => (
                    <div 
                      key={item.id}
                      className="p-3.5 bg-sky-50 dark:bg-sky-950/50 border-2 border-sky-200 dark:border-sky-800/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 bg-sky-700 text-white rounded-md">
                            Resmi Eşleşme
                          </span>
                          <span className="text-xs font-black text-sky-900 dark:text-sky-300">
                            {item.primaryTerm}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 font-medium">
                          {item.definition}
                        </p>
                      </div>

                      <Link
                        href={item.targetUrl}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        <Calculator size={14} className="text-sky-200" />
                        <span>Sayfayı / Robotu Aç</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              );
            })()
          )}

          {/* Results Block */}
          {searched && (
            <div className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/80 border-b-2 border-slate-200 dark:border-slate-800 py-3 px-4 flex items-center justify-between text-slate-950 dark:text-white font-black text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-sky-600" />
                  <span>ARAMA SONUÇLARI ({results.length})</span>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-sky-600" />
                    <span className="text-xs font-medium">Sonuçlar taranıyor...</span>
                  </div>
                ) : results.length > 0 ? (
                  results.map((topic) => (
                    <article key={topic.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-baseline gap-2 mb-1">
                        {topic.category && (
                          <Link 
                            href={`/category/${topic.category.slug}`}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-bold uppercase tracking-wider hover:underline"
                          >
                            {topic.category.name}
                          </Link>
                        )}
                        <Link 
                          href={`/discussions/${topic.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-sky-600 transition-colors"
                        >
                          {topic.title}
                        </Link>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 font-medium">
                        {topic.content?.replace(/[#*`_\[\]]/g, '')}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>Yazar: <span className="font-bold text-slate-700 dark:text-slate-300">@{topic.author?.username || 'Anonim'}</span></span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
                        <span>•</span>
                        <span>{topic.comments_count || 0} Cevap</span>
                        <span>•</span>
                        <span>{topic.views_count || 0} Görüntülenme</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-500 italic text-xs bg-slate-50/50 dark:bg-slate-800/20">
                    "{query}" için arama kriterlerinize uygun hiçbir sonuç bulunamadı.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Breadcrumbs */}
          <div className="bg-white dark:bg-slate-900 px-4 py-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 rounded-xl mt-4 shadow-xs">
            <Link href="/" className="hover:text-sky-600 flex items-center gap-1 font-bold">
              <Home size={13} />
              <span>Ana Sayfa</span>
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/discussions" className="hover:text-sky-600 font-semibold">Forumlar</Link>
            <span className="opacity-40">/</span>
            <span className="font-extrabold text-slate-950 dark:text-white">Arama</span>
          </div>
        </div>

        {/* Right Sidebar */}
        <ClassicSidebar />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-sky-600 dark:text-sky-400" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Yükleniyor...</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
