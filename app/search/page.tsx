'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { SiteLayout } from '@/components/layout/site-layout';
import { Search, Filter, ArrowRight, Loader2, Mic, Sparkles, ChevronRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn, formatCompactNumber } from '@/lib/utils';
import { toast } from 'sonner';
import { expandSearchQuery } from '@/lib/search-dictionary';

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
  const [showFilters, setShowFilters] = useState(Boolean(initialCat));
  const [expandedTermsUsed, setExpandedTermsUsed] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isSupabaseConfigured) {
        setCategories([]);
        return;
      }

      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching search categories:', err);
        setCategories([]);
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
      setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 300);
      return;
    }

    try {
      let queryBuilder = supabase
        .from('topics')
        .select(`
          id, title, content, author_id, category_id, views_count, created_at, updated_at, slug, comments_count,
          category:categories(id, name, slug, color, icon),
          author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified)
        `)
        .limit(30);

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
          const matchedCat = categories.find(c => c.slug === catId || c.id === catId);
          if (matchedCat) {
            queryBuilder = queryBuilder.eq('category_id', matchedCat.id);
          }
        }
      }
            
      const { data, error } = await queryBuilder.order('created_at', { ascending: false });
      if (error) throw error;
      setResults((data as any || []).filter((t: any) => t.author));
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  // Initial trigger from URL params
  useEffect(() => {
    if (initialQ || initialCat) {
      performSearch(initialQ, initialCat);
    }
  }, [initialQ, initialCat, performSearch]);

  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Tarayıcınız ses tanımayı desteklemiyor.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      performSearch(transcript, categoryId);
      updateUrl(transcript, categoryId);
    };
    recognition.start();
  };

  const updateUrl = (q: string, cat: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    const queryString = params.toString();
    router.replace(`/search${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, categoryId);
    updateUrl(query, categoryId);
  };

  const clearSearch = () => {
    setQuery('');
    setCategoryId('');
    setResults([]);
    setExpandedTermsUsed([]);
    setSearched(false);
    router.replace('/search', { scroll: false });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <nav aria-label="Erişim yolu" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-[#185886] hover:underline transition-colors">Ana Sayfa</Link>
        <ChevronRight size={13} className="text-muted-foreground/60" aria-hidden="true" />
        <span className="text-foreground font-bold">Arama</span>
      </nav>

      <header className="space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-[#185886] border border-slate-200 text-xs font-semibold">
            <Sparkles size={12} aria-hidden="true" /> Akıllı Arama &amp; Filtreleme
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#185886] tracking-tight">
            Topluluk İçinde Arayın
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Mevzuat, haklar, ÖTV, rapor oranları veya genel konularda binlerce deneyim arasında arama yapın.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full space-y-3" role="search" aria-label="Forum arama formu">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" size={16} aria-hidden="true" />
              <input 
                type="search" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Başlık, mevzuat maddesi veya konu ara..." 
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-card text-foreground text-xs sm:text-sm focus:ring-1 focus:ring-[#185886] outline-none placeholder:text-muted-foreground"
                aria-label="Arama sorgusu"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label="Arama metnini temizle"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-10 px-3 rounded-xl transition-all border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer",
                  showFilters ? 'bg-[#185886] text-white border-[#185886]' : 'bg-card hover:bg-muted text-foreground border-border/80'
                )}
                aria-expanded={showFilters}
                aria-controls="search-filters-panel"
                title="Filtreleri göster veya gizle"
              >
                <Filter size={13} aria-hidden="true" />
                <span>Filtrele</span>
              </button>

              <button 
                type="button"
                onClick={startVoiceSearch}
                className={cn(
                  "h-10 w-10 rounded-xl transition-all border flex items-center justify-center cursor-pointer",
                  isListening ? 'bg-rose-600 text-white animate-pulse border-rose-500' : 'bg-card hover:bg-muted text-foreground border-border/80'
                )}
                aria-label={isListening ? "Ses dinleniyor, durdurmak için tıklayın" : "Sesli arama başlat"}
                title="Sesli Ara"
              >
                <Mic size={14} aria-hidden="true" />
              </button>

              <button 
                type="submit"
                disabled={loading}
                className="h-10 px-4 rounded-xl bg-[#185886] hover:bg-[#104f75] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : 'Ara'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                id="search-filters-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 bg-card border border-slate-200 rounded-xl flex flex-col gap-1.5 mt-1 backdrop-blur-md">
                  <label htmlFor="search-category-select" className="text-[11px] font-semibold text-foreground">
                    Kategoriye Göre Sınırla
                  </label>
                  <select 
                    id="search-category-select"
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      performSearch(query, e.target.value);
                      updateUrl(query, e.target.value);
                    }}
                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-[#185886] cursor-pointer"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(c => (
                      <option key={c.id || c.slug} value={c.slug || c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </header>

      <section className="space-y-4" aria-label="Arama Sonuçları">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-xs font-semibold text-muted-foreground" aria-live="polite">
            {loading ? 'Aranıyor...' : `${results.length} Sonuç Bulundu`}
          </h2>
          {!loading && expandedTermsUsed.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#185886] bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200">
              <Sparkles size={11} className="shrink-0" aria-hidden="true" />
              <span className="font-medium text-[11px]">Eş Anlamlı Taraması:</span>
              <span className="text-[11px] text-muted-foreground">{expandedTermsUsed.join(", ")}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {results.length > 0 ? (
              results.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <Link 
                    href={`/discussions/${topic.id}`}
                    className="block p-4 sm:p-5 rounded-2xl bg-card border border-slate-200 hover:border-[#185886] transition-all group shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#eef2f7] text-[#185886] border border-[#cbd5e1] text-[10px] font-medium">
                            {topic.category?.name || 'Genel'}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-[#185886] group-hover:underline transition-colors tracking-tight leading-snug line-clamp-2">
                          {topic.title}
                        </h3>
                        {topic.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                            {topic.content}
                          </p>
                        )}
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-[#185886] group-hover:text-white transition-all shrink-0 flex items-center justify-center size-7 border border-slate-200">
                        <ArrowRight size={13} aria-hidden="true" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : !loading && searched && (
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-slate-200 px-6 space-y-2" role="status">
                <Search size={36} className="mx-auto text-muted-foreground/60 mb-2" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground">Sonuç Bulunamadı</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Aradığınız kriterlere uygun bir içerik bulunamadı. Lütfen farklı anahtar kelimeler kullanarak tekrar deneyin.
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[#185886] hover:underline cursor-pointer font-bold"
                >
                  Aramayı Temizle
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <SiteLayout>
      <Suspense fallback={
        <div className="w-full max-w-5xl mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#185886]" size={32} />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </SiteLayout>
  );
}
