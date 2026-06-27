'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Search, MessageSquare, Filter, ArrowRight, Loader2, Mic } from 'lucide-react';
import { Topic } from '@/types/database';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*, category:categories(*), author:profiles(*)')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(20);
      
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
      alert('Tarayıcınız ses tanımayı desteklemiyor.');
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
      performSearch(transcript);
    };

    recognition.start();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
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
                placeholder="TARTIŞMA VEYA TOPLULUK ARA..." 
                className="vibe-input !pl-16 md:!pl-20 !pr-20 md:!pr-56 h-16 md:h-20 text-base md:text-xl uppercase"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
            {/* Mobile Submit Button */}
            <div className="md:hidden">
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
              ) : !loading && query && (
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
