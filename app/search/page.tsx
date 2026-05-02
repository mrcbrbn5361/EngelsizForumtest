'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Search, MessageSquare, Filter, ArrowRight, Loader2, Mic } from 'lucide-react';
import { Topic } from '@/types/database';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-4xl">
        <header className="mb-10 md:mb-16">
          <h1 className="text-3xl md:text-6xl font-bold mb-6 md:mb-10 tracking-tight leading-tight">Forumda Ara</h1>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-5 md:left-6 transition-colors group-focus-within:text-primary" size={20} style={{ top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Arama yapın..." 
              className="w-full pl-12 md:pl-16 pr-32 md:pr-40 py-4 md:py-6 rounded-2xl md:rounded-3xl border border-border bg-card shadow-lg focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-base md:text-2xl font-bold tracking-tight"
              autoFocus
            />
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
              <button 
                type="button"
                onClick={startVoiceSearch}
                className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted hover:bg-zinc-200 text-muted-foreground active:scale-95 border border-border'}`}
                title="Sesli Ara"
              >
                <Mic size={18} />
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 md:px-8 py-2 md:py-3.5 rounded-lg md:rounded-xl font-bold font-sm md:text-lg shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Ara'}
              </button>
            </div>
          </form>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
            <h2 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {loading ? 'ARANIYOR...' : `${results.length} SONUÇ BULUNDU`}
            </h2>
          </div>

          <div className="grid gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="block group bg-card border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 hover:border-primary/30 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-primary/5 border border-primary/10 rounded-full text-primary uppercase tracking-widest">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-2xl font-bold group-hover:text-primary transition-colors tracking-tight leading-tight line-clamp-1">{topic.title}</h3>
                          <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all shadow-sm shrink-0">
                          <ArrowRight size={20} className="md:size-6" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && query && (
                <div className="text-center py-16 md:py-24 bg-muted/10 rounded-3xl border border-dashed border-border/50">
                  <Search size={48} className="mx-auto text-muted-foreground/10 mb-4" />
                  <p className="text-lg md:text-2xl font-bold text-muted-foreground mb-2">Sonuç Bulunamadı</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Farklı anahtar kelimeler deneyin</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <Footer />

      <AccessibilityToolbar />
    </div>
  );
}
