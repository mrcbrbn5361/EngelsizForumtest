'use client';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Search, Filter, ArrowRight, Loader2, Mic } from 'lucide-react';
import { Topic } from '@/types/database';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const performSearch = useCallback(async (searchQuery: string, catId: string) => {
    if (!searchQuery.trim() && !catId) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('topics')
        .select('*, category:categories(*), author:profiles(*)')
        .limit(20);

      if (searchQuery.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      if (catId) {
        queryBuilder = queryBuilder.eq('category_id', catId);
      }
            
      const { data, error } = await queryBuilder;
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
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
      <main className="vibe-container py-12 md:py-24">
        <header className="mb-16">
          <p className="vibe-label ml-0">GELİŞMİŞ ARAMA</p>
          <h1 className="vibe-section-title mb-12 uppercase">Toplulukta Keşfedin</h1>

          <form onSubmit={handleSearch} className="w-full max-w-5xl space-y-4">
            <div className="relative group">
              <Search className="absolute left-6 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} style={{ top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="TARTIŞMA VEYA İÇERİK ARA..." 
                className="vibe-input vibe-input-search-full h-16 md:h-20 text-base md:text-xl uppercase pr-[120px] md:pr-[220px]"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
                <button 
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "p-2.5 md:p-4 rounded-xl transition-all border shadow-sm flex items-center gap-2",
                    showFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 hover:bg-muted text-muted-foreground border-border md:border-2'
                  )}
                  title="Filtreler"
                >
                  <Filter className="size-5 md:size-6" />
                  <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Filtrele</span>
                </button>

                <button 
                  type="button"
                  onClick={startVoiceSearch}
                  className={cn(
                    "p-2.5 md:p-4 rounded-xl transition-all border border-border md:border-2 shadow-sm",
                    isListening ? 'bg-destructive text-white animate-pulse border-destructive' : 'bg-muted/50 hover:bg-muted text-muted-foreground active:scale-95'
                  )}
                  title="Sesli Ara"
                >
                  <Mic className="size-5 md:size-6" />
                </button>
                <div className="hidden md:block">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="vibe-button-primary h-14 px-8 text-sm flex items-center justify-center"
                  >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : 'ARA'}
                  </button>
                </div>
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
                  <div className="p-6 bg-card border-2 border-border rounded-2xl md:rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-6 mt-4">
                    <div className="flex-1 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori Filtresi</label>
                      <select 
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full h-14 bg-muted border border-border rounded-xl px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/20 appearance-none cursor-pointer"
                      >
                        <option value="">TÜM KATEGORİLER</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Submit Button */}
            <div className="md:hidden pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full vibe-button-primary h-14 text-base font-black tracking-widest uppercase"
              >
                {loading ? <Loader2 size={24} className="animate-spin mr-2 inline" /> : 'ARA'}
              </button>
            </div>
          </form>
        </header>

        <section>
          <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              {loading ? 'ARANIYOR...' : `${results.length} SONUÇ BULUNDU`}
            </h2>
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="vibe-card vibe-card-hover block p-8"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-4 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="vibe-badge bg-primary/10 text-primary">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-xl md:text-3xl font-black group-hover:text-primary transition-colors tracking-tighter leading-tight line-clamp-1 text-foreground">{topic.title}</h3>
                          <p className="text-sm md:text-lg text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm shrink-0">
                          <ArrowRight size={24} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && (query || categoryId) && (
                <div className="text-center py-32 bg-card rounded-[3rem] border-4 border-dashed border-border px-8">
                  <Search size={80} className="mx-auto text-muted-foreground/10 mb-8" />
                  <h3 className="text-2xl md:text-4xl font-black text-foreground mb-4 tracking-tight">Sonuç Bulunamadı</h3>
                  <p className="text-base md:text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
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
