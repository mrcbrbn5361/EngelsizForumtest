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
          id, title, content, author_id, category_id, views_count, likes_count, comments_count, created_at, updated_at, slug,
          category:categories!topics_category_id_fkey(id, name, slug, color, icon),
          author:profiles!topics_author_id_fkey(id, username, avatar_url, full_name, role, level, xp, is_verified)
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
      <main className="vibe-container py-8 md:py-12">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-primary transition-colors">ANA SAYFA</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-black">FORUM İÇİNDE ARAMA & FİLTRELEME</span>
        </div>

        <header className="mb-12">
          <p className="vibe-label ml-0">GELİŞMİŞ ARAMA</p>
          <h1 className="vibe-section-title mb-8 uppercase">Toplulukta Keşfedin</h1>

          <form onSubmit={handleSearch} className="w-full max-w-5xl space-y-4">
            {/* Optimized layout for search row preventing any overflow on screens */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="TARTIŞMA VEYA İÇERİK ARA..." 
                  className="vibe-input vibe-input-pl-12 h-12 text-sm uppercase rounded border border-border bg-background w-full"
                  autoFocus
                />
              </div>

              {/* Action buttons side-by-side cleanly */}
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-12 px-4 rounded-xl transition-all border shadow-sm flex items-center justify-center gap-2",
                    showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border'
                  )}
                  title="Filtreler"
                >
                  <Filter className="size-4" />
                  <span className="font-bold text-xs uppercase tracking-widest">Filtrele</span>
                </button>

                <button 
                  type="button"
                  onClick={startVoiceSearch}
                  className={cn(
                    "h-12 w-12 rounded-xl transition-all border border-border shadow-sm flex items-center justify-center",
                    isListening ? 'bg-destructive text-white animate-pulse border-destructive' : 'bg-muted/50 hover:bg-muted text-muted-foreground active:scale-95'
                  )}
                  title="Sesli Ara"
                >
                  <Mic className="size-4" />
                </button>

                <button 
                  type="submit"
                  disabled={loading}
                  className="vibe-button-primary h-12 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'ARA'}
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
                  <div className="p-6 bg-card border border-border rounded-xl shadow-sm flex flex-col gap-3 mt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori Filtresi</label>
                    <select 
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer uppercase"
                    >
                      <option value="">TÜM KATEGORİLER</option>
                      {categories.map(c => (
                        <option key={c.id || c.slug} value={c.slug || c.id}>{c.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </header>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-border pb-4">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              {loading ? 'ARANIYOR...' : `${results.length} SONUÇ BULUNDU`}
            </h2>
            {!loading && expandedTermsUsed.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                <Sparkles className="size-3.5 shrink-0 text-primary" />
                <span className="font-bold">Arama Kelimeleri Genişletildi:</span>
                <span className="font-medium text-muted-foreground">{expandedTermsUsed.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="vibe-card vibe-card-hover block p-6 md:p-8"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-4 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="vibe-badge bg-primary/10 text-primary uppercase text-[10px] px-2.5 py-1 rounded-full font-bold">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-2xl font-bold group-hover:text-primary transition-colors tracking-tight leading-snug line-clamp-2 text-foreground whitespace-normal break-words">{topic.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium pointer-events-none">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm shrink-0 flex items-center justify-center h-10 w-10">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && (query || categoryId) && (
                <div className="text-center py-24 bg-card rounded-2xl border-2 border-dashed border-border px-8">
                  <Search size={64} className="mx-auto text-muted-foreground/15 mb-6" />
                  <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 tracking-tight">Sonuç Bulunamadı</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Aradığınız kriterlere uygun bir içerik bulamadık. Lütfen farklı anahtar kelimeler kullanarak tekrar deneyin.
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
