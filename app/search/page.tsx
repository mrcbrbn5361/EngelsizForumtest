'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Search, Filter, ArrowRight, Loader2, Mic, Sparkles, ChevronRight } from 'lucide-react';
import { Topic } from '@/types/database';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { expandSearchQuery } from '@/lib/search-dictionary';

// Empty fallback for clean database-only mode
const FALLBACK_TOPICS: Topic[] = [];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTermsUsed, setExpandedTermsUsed] = useState<string[]>([]);

  // Load Categories on mount
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
        // Gelişmiş Türkçe Arama Sözlüğü ile sorguyu eş anlamlılar ve eşdeş kelimelerle genişlet
        const terms = expandSearchQuery(searchQuery).slice(0, 8);
        setExpandedTermsUsed(terms);
        
        // Supabase için .or formatında koşul zinciri oluştur (title veya content alanında terimlerden biri geçmeli)
        const orConditions = terms
          .map(term => `title.ilike.%${term}%,content.ilike.%${term}%`)
          .join(',');
        
        queryBuilder = queryBuilder.or(orConditions);
      } else {
        setExpandedTermsUsed([]);
      }
      
      if (catId) {
        // Query can match UUID or slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(catId);
        if (isUuid) {
          queryBuilder = queryBuilder.eq('category_id', catId);
        } else {
          // If slug, match with nested query or lookup beforehand
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
    <DashboardLayout>
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={12} className="text-muted-foreground/50" />
          <span className="text-foreground font-black">Forum İçi Arama</span>
        </div>

        <header className="bg-card border border-border/80 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles size={12} /> Akıllı Arama & Filtreleme
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Forumda Keşfedin ve Arayın
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal mt-1 max-w-2xl">
              Hukuki haklar, mevzuat maddeleri, Balthazard ve ÖTV konuları dahil tüm topluluk arşivinde arama yapın.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-4xl space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" size={18} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Başlık, mevzuat maddesi veya kelime ara..." 
                  className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-xl border border-border/80 bg-background text-foreground outline-none focus:border-sky-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-11 px-3.5 rounded-xl transition-all border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer",
                    showFilters ? 'bg-sky-500 text-white border-sky-500' : 'bg-background hover:bg-muted/60 text-muted-foreground border-border/80 hover:text-foreground'
                  )}
                  title="Filtreler"
                >
                  <Filter className="size-3.5" />
                  <span>Filtrele</span>
                </button>

                <button 
                  type="button"
                  onClick={startVoiceSearch}
                  className={cn(
                    "h-11 w-11 rounded-xl transition-all border flex items-center justify-center cursor-pointer",
                    isListening ? 'bg-rose-500 text-white animate-pulse border-rose-500' : 'bg-background hover:bg-muted/60 text-muted-foreground border-border/80 hover:text-foreground'
                  )}
                  title="Sesli Ara"
                >
                  <Mic className="size-4" />
                </button>

                <button 
                  type="submit"
                  disabled={loading}
                  className="h-11 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ara'}
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
                  <div className="p-4 bg-muted/20 border border-border/80 rounded-xl flex flex-col gap-2 mt-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Kategori Filtresi</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-10 bg-background border border-border/80 rounded-lg px-3 text-xs font-semibold outline-none focus:border-sky-500 cursor-pointer"
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

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-border/60 pb-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {loading ? 'Aranıyor...' : `${results.length} Sonuç Bulundu`}
            </h2>
            {!loading && expandedTermsUsed.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400 bg-sky-500/10 px-3 py-1 rounded-lg border border-sky-500/20">
                <Sparkles className="size-3.5 shrink-0" />
                <span className="font-semibold">İlişkili Terimler:</span>
                <span className="font-normal text-muted-foreground">{expandedTermsUsed.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="block p-4 sm:p-5 rounded-2xl bg-card border border-border/80 hover:border-sky-500/40 hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold group-hover:text-sky-400 transition-colors tracking-tight leading-snug line-clamp-2 text-foreground">
                            {topic.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-sky-500 group-hover:text-white transition-all shrink-0 flex items-center justify-center h-8 w-8">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && (query || categoryId) && (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80 px-6">
                  <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-base font-bold text-foreground mb-1">Sonuç Bulunamadı</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Aradığınız kriterlere uygun bir içerik bulunamadı. Lütfen farklı anahtar kelimeler kullanarak tekrar deneyin.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
