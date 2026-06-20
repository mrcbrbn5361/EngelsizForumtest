'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
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
    <DashboardLayout>
      <main className="max-w-4xl mx-auto py-8 md:py-16 px-4">
        <header className="mb-10 md:mb-16">
          <h1 className="text-3xl md:text-6xl font-bold mb-6 md:mb-10 tracking-tight leading-tight text-[#1A1A1A]">Forumda Ara</h1>
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-5 md:left-6 transition-colors group-focus-within:text-[#D91B5C]" size={20} style={{ top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Arama yapın..." 
              className="w-full h-[48px] pl-12 md:pl-16 pr-32 md:pr-40 py-4 md:py-6 rounded-[12px] border border-[#E5E7EB] bg-[#FAFAFA] focus:ring-1 focus:ring-[#D91B5C] outline-none transition-all text-base md:text-2xl font-bold tracking-tight"
              autoFocus
            />
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 md:gap-2">
              <button 
                type="button"
                onClick={startVoiceSearch}
                className={`p-2 md:p-3 rounded-[8px] transition-all ${isListening ? 'bg-red-500 text-[#FFFFFF] animate-pulse' : 'bg-[#FAFAFA] hover:bg-[#E5E7EB] text-[#999999] active:scale-95 border border-[#E5E7EB]'}`}
                title="Sesli Ara"
              >
                <Mic size={18} />
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="bg-[#D91B5C] text-[#FFFFFF] px-4 md:px-8 py-2 md:py-3.5 rounded-[8px] font-bold font-sm md:text-lg hover:bg-[#D91B5C]/90 transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Ara'}
              </button>
            </div>
          </form>
        </header>

        <section>
          <div className="flex items-center justify-between mb-6 border-b border-[#E5E7EB] pb-3">
            <h2 className="text-xs font-bold text-[#999999] uppercase tracking-widest">
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
                      className="block group bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-5 md:p-8 hover:border-[#D91B5C] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3 min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold px-2.5 py-0.5 bg-[#FFF1F2] border border-[#D91B5C]/10 rounded-[8px] text-[#D91B5C] uppercase tracking-widest">
                              {topic.category?.name || 'Genel'}
                            </span>
                            <span className="text-xs font-medium text-[#999999] uppercase tracking-widest opacity-60">
                              {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-2xl font-bold group-hover:text-[#D91B5C] transition-colors tracking-tight leading-tight line-clamp-1 text-[#1A1A1A]">{topic.title}</h3>
                          <p className="text-sm md:text-base text-[#666666] line-clamp-2 leading-relaxed font-medium">
                            {topic.content}
                          </p>
                        </div>
                        <div className="p-3 md:p-4 rounded-[8px] bg-[#F9F9FB] group-hover:bg-[#D91B5C] group-hover:text-[#FFFFFF] transition-all shadow-sm shrink-0">
                          <ArrowRight size={20} className="md:size-6" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : !loading && query && (
                <div className="text-center py-16 md:py-24 bg-[#F9F9FB] rounded-[8px] border border-dashed border-[#E5E7EB]">
                  <Search size={48} className="mx-auto text-[#999999]/30 mb-4" />
                  <p className="text-lg md:text-2xl font-bold text-[#666666] mb-2">Sonuç Bulunamadı</p>
                  <p className="text-xs text-[#999999] font-medium uppercase tracking-widest opacity-60">Farklı anahtar kelimeler deneyin</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
