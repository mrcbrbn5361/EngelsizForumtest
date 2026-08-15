'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Search, Filter, ArrowRight, Loader2, Mic, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { expandSearchQuery } from '@/lib/search-dictionary';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTermsUsed, setExpandedTermsUsed] = useState<string[]>([]);

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
    if (!searchQuery.trim() && !catId) {
      setResults([]);
      setExpandedTermsUsed([]);
      return;
    }
    setLoading(true);

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setResults([]);
        setLoading(false);
      }, 400);
      return;
    }

    try {
      let queryBuilder = supabase
        .from('topics')
        .select(`
          id, title, content, author_id, category_id, views_count, created_at, updated_at, slug,
          category:categories(id, name, slug, color, icon),
          author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified)
        `)
        .limit(25);

      if (searchQuery.trim()) {
        const terms = expandSearchQuery(searchQuery).slice(0, 8);
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
            
      const { data, error } = await queryBuilder;
      if (error) throw error;
      setResults((data as any || []).filter((t: any) => t.author));
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  const startVoiceSearch = () => {
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
    };
    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, categoryId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-5xl space-y-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={13} className="text-slate-600" />
          <span className="text-slate-200 font-medium">Arama</span>
        </div>

        <header className="space-y-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
              <Sparkles size={12} /> Akıllı Arama & Filtreleme
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              Topluluk İçinde Arayın
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Mevzuat, haklar, ÖTV, rapor oranları veya genel konularda binlerce deneyim arasında arama yapın.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Başlık, mevzuat maddesi veya konu ara..." 
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#111726]/90 text-slate-200 text-xs sm:text-sm focus:ring-1 focus:ring-sky-500 outline-none placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-10 px-3 rounded-xl transition-all border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer",
                    showFilters ? 'bg-sky-600 text-white border-sky-500' : 'bg-[#111726]/80 hover:bg-slate-800 text-slate-300 border-white/[0.08]'
                  )}
                  title="Filtreler"
                >
                  <Filter size={13} />
                  <span>Filtrele</span>
                </button>

                <button 
                  type="button"
                  onClick={startVoiceSearch}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all border flex items-center justify-center cursor-pointer",
                    isListening ? 'bg-rose-600 text-white animate-pulse border-rose-500' : 'bg-[#111726]/80 hover:bg-slate-800 text-slate-300 border-white/[0.08]'
                  )}
                  title="Sesli Ara"
                >
                  <Mic size={14} />
                </button>

                <button 
                  type="submit"
                  disabled={loading}
                  className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : 'Ara'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 bg-[#111726]/90 border border-white/[0.08] rounded-xl flex flex-col gap-1.5 mt-1 backdrop-blur-md">
                    <label className="text-[11px] font-semibold text-slate-300">Kategoriye Göre Sınırla</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-9 bg-slate-900 border border-white/[0.08] rounded-lg px-3 text-xs font-medium text-slate-200 outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
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

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
            <h2 className="text-xs font-semibold text-slate-400">
              {loading ? 'Aranıyor...' : `${results.length} Sonuç Bulundu`}
            </h2>
            {!loading && expandedTermsUsed.length > 1 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20">
                <Sparkles size={11} className="shrink-0" />
                <span className="font-medium text-[11px]">Eş Anlamlılar:</span>
                <span className="text-[11px] text-slate-300">{expandedTermsUsed.join(", ")}</span>
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
                      className="block p-4 sm:p-5 rounded-2xl bg-[#111726]/80 border border-white/[0.08] hover:border-sky-500/40 transition-all group backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.2 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-medium">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-sky-400 transition-colors tracking-tight leading-snug line-clamp-2">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 text-slate-400 group-hover:bg-sky-600 group-hover:text-white transition-all shrink-0 flex items-center justify-center size-7 border border-white/[0.06]">
                          <ArrowRight size={13} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && (query || categoryId) && (
                <div className="text-center py-16 bg-[#111726]/40 rounded-2xl border border-dashed border-white/[0.08] px-6 space-y-2">
                  <Search size={36} className="mx-auto text-slate-600 mb-2" />
                  <h3 className="text-sm font-semibold text-slate-200">Sonuç Bulunamadı</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Aradığınız kriterlere uygun bir içerik bulunamadı. Lütfen farklı anahtar kelimeler kullanarak tekrar deneyin.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
