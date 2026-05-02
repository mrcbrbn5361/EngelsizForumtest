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
        <header className="mb-12 md:mb-20">
          <h1 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-tight">Forumda Ara</h1>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Eşit ve erişilebilir içerikleri ara..." 
              className="w-full pl-16 md:pl-24 pr-40 md:pr-48 py-6 md:py-8 rounded-[2rem] md:rounded-[3rem] border-4 border-border bg-card shadow-2xl shadow-primary/5 focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg md:text-3xl font-black tracking-tight"
              autoFocus
            />
            <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-3">
              <button 
                type="button"
                onClick={startVoiceSearch}
                className={`p-4 md:p-5 rounded-2xl md:rounded-3xl transition-all shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted hover:bg-zinc-200 text-muted-foreground active:scale-90 border-2 border-border'}`}
                title="Sesli Ara"
              >
                <Mic size={24} />
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-8 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-3xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 text-base md:text-xl uppercase tracking-widest"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : 'Ara'}
              </button>
            </div>
          </form>
        </header>

        <section>
          <div className="flex items-center justify-between mb-8 border-b-4 border-muted pb-4">
            <h2 className="text-xs md:text-sm font-black text-muted-foreground uppercase tracking-[0.4em]">
              {loading ? 'ARANIYOR...' : `${results.length} SONUÇ BULUNDU`}
            </h2>
          </div>

          <div className="space-y-6 md:space-y-10">
            <AnimatePresence mode="popLayout">
              {results.length > 0 ? (
                results.map((topic, index) => (
                  <motion.div
                    key={topic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="block group bg-card border-4 border-border rounded-[2.5rem] p-8 md:p-12 hover:border-primary/30 transition-all shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] md:text-xs font-black px-3 py-1 bg-primary/5 border border-primary/10 rounded-full text-primary uppercase tracking-widest">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-2xl md:text-4xl font-black group-hover:text-primary transition-colors tracking-tight leading-none">{topic.title}</h3>
                          <p className="text-base md:text-xl text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-4 md:p-6 rounded-3xl bg-muted group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-12 transition-all shadow-inner">
                          <ArrowRight size={24} className="md:size-32" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && query && (
                <div className="text-center py-24 md:py-32 bg-muted/20 rounded-[3rem] border-4 border-dashed border-border/50">
                  <Search size={64} className="mx-auto text-muted-foreground/10 mb-6" />
                  <p className="text-xl md:text-3xl font-black text-muted-foreground mb-4 tracking-tight">Eşleşme Bulunamadı</p>
                  <p className="text-sm md:text-base text-muted-foreground font-bold tracking-widest uppercase opacity-60">Farklı anahtar kelimeler denemeyi deneyin</p>
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
