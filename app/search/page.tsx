'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Search, Filter, Loader2, Mic, Sparkles, ChevronRight, X, Home, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { expandSearchQuery, matchQueryWithText } from '@/lib/search-dictionary';
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
      {/* XenForo Breadcrumbs */}
      <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mb-2">
        <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/discussions" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
        <span className="opacity-50">/</span>
        <span className="font-bold text-slate-800">Arama</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Search Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-3">
            <h1 className="text-xl font-black text-[#185886] uppercase tracking-wide flex items-center gap-2">
              <Search size={20} className="text-[#185886]" />
              FORUMDA ARA
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mevzuat maddesi, başlık veya anahtar kelimelere göre gelişmiş forum araması
            </p>
          </div>

          {/* Search Form Box */}
          <div className="xf-block border border-slate-200 rounded-sm bg-white p-4 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Konularda veya mesajlarda ara..."
                    className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-sm text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#185886] outline-none font-medium"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-9 bg-slate-50 border border-slate-300 rounded-sm px-3 text-xs font-semibold text-slate-700 focus:border-[#185886] outline-none cursor-pointer sm:w-48"
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
                    className={`h-9 px-3 border border-slate-300 rounded-sm flex items-center justify-center transition-colors ${
                      isListening ? 'bg-rose-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}
                    title="Sesli Ara"
                  >
                    <Mic size={14} />
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-9 px-6 bg-[#185886] hover:bg-[#104f75] text-white text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : 'Ara'}
                  </button>
                </div>
              </div>

              {expandedTermsUsed.length > 1 && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#185886] bg-sky-50 p-2 rounded-sm border border-sky-100 font-semibold">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Eş Anlamlı Genişletme:</span>
                  <span className="text-slate-600 font-normal">{expandedTermsUsed.join(', ')}</span>
                </div>
              )}
            </form>
          </div>

          {/* Results Block */}
          {searched && (
            <div className="xf-block border border-slate-200 rounded-sm bg-white shadow-sm overflow-hidden">
              <div className="xf-block-header bg-gradient-to-b from-[#f8f9fa] to-[#eef2f7] border-b border-slate-200 py-3 px-4 flex items-center justify-between text-[#185886] font-black text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MessageSquare size={13} />
                  <span>ARAMA SONUÇLARI ({results.length})</span>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                {loading ? (
                  <div className="p-10 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-[#185886]" />
                    <span className="text-xs font-medium">Sonuçlar taranıyor...</span>
                  </div>
                ) : results.length > 0 ? (
                  results.map((topic) => (
                    <article key={topic.id} className="p-4 hover:bg-[#f8fafc] transition-colors">
                      <div className="flex items-baseline gap-2 mb-1">
                        {topic.category && (
                          <Link 
                            href={`/category/${topic.category.slug}`}
                            className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#eef2f7] text-[#185886] border border-[#cbd5e1] font-bold uppercase tracking-wider hover:underline"
                          >
                            {topic.category.name}
                          </Link>
                        )}
                        <Link 
                          href={`/discussions/${topic.id}`}
                          className="font-bold text-sm text-[#185886] hover:underline"
                        >
                          {topic.title}
                        </Link>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                        {topic.content?.replace(/[#*`_\[\]]/g, '')}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>Yazar: <span className="font-bold text-slate-600">@{topic.author?.username || 'Anonim'}</span></span>
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
                  <div className="p-10 text-center text-slate-500 italic text-xs bg-slate-50/50">
                    "{query}" için arama kriterlerinize uygun hiçbir sonuç bulunamadı.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Breadcrumbs */}
          <div className="bg-[#eef2f7] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mt-4">
            <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/discussions" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
            <span className="opacity-50">/</span>
            <span className="font-bold text-slate-800">Arama</span>
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
        <Loader2 size={24} className="animate-spin text-[#185886]" />
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Yükleniyor...</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
