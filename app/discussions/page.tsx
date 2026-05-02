'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { Topic } from '@/types/database';
import Link from 'next/link';
import { Search, Plus, Filter, MessageSquareCode, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export default function DiscussionsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string, text: string } | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const fetchTopics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*, author:profiles(*), category:categories(*), comments(id)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching topics:', error);
        return;
      }
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      if (data) setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await fetchTopics();
        await fetchCategories();
      }
    };
    init();
    return () => { isMounted = false; };
  }, [fetchTopics, fetchCategories]);

  const handleSummarize = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    setSummarizingId(id);
    setSummaryResult(null);

    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

      const prompt = `Aşağıdaki forum tartışmasını bir cümleyle özetle ve en önemli 3 noktayı madde imiyle belirt. 
      Tartışma: ${topic.title}
      ${topic.content}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      
      if (response.text) {
        setSummaryResult({ id, text: response.text });
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      alert('AI Özetlenirken bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="text-left w-full md:w-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <MessageSquareCode className="text-primary h-6 w-6 md:h-10 md:w-10" /> Tartışmalar
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground font-medium">Topluluğumuzdaki güncel başlıkları ve yardım taleplerini inceleyin.</p>
          </div>
          
          <Link 
            href="/discussions/new"
            className="vibe-button-primary w-full md:w-auto py-3 md:py-4 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Yeni Başlık Aç
          </Link>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar / Filters */}
          <aside className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Başlıklarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </div>

            <div className="w-full">
              <h2 className="px-1 text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={14} className="text-primary" /> Kategoriler
              </h2>
              <nav className="relative -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 md:pb-6 lg:pb-0 scrollbar-hide snap-x touch-pan-x no-scrollbar">
                  <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0 pr-8 lg:pr-0">
                    <CategoryLink label="Hepsi" active count={topics.length} />
                    {categories.map(cat => (
                      <CategoryLink key={cat.id} label={cat.name} count={topics.filter(t => t.category_id === cat.id).length} />
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none lg:hidden" />
              </nav>
            </div>
          </aside>

          {/* Discussion List */}
          <section className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 md:py-20 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="font-bold text-muted-foreground text-sm">Tartışmalar yükleniyor...</p>
              </div>
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <DiscussionCard 
                    topic={topic} 
                    onSummarize={handleSummarize}
                    isLoading={summarizingId === topic.id}
                  />
                  {summaryResult && summaryResult.id === topic.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-4 md:p-6 bg-primary/5 border border-primary/10 rounded-2xl"
                    >
                      <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-3">
                        <Sparkles size={14} /> AI ÖZETİ
                      </div>
                      <div className="text-xs md:text-sm leading-relaxed prose prose-sm max-w-none">
                        {summaryResult.text.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('-') || line.startsWith('•') ? 'ml-4' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <button 
                        onClick={() => setSummaryResult(null)}
                        className="mt-3 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
                      >
                        Özeti Kapat
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 md:py-20 bg-card rounded-2xl md:rounded-[3rem] border border-dashed border-border px-4">
                <MessageSquareCode className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
                <h3 className="text-lg md:text-xl font-bold mb-2">Henüz tartışma bulunamadı</h3>
                <p className="text-sm text-muted-foreground">Bir tartışma başlatmak için &quot;Yeni Başlık Aç&quot; butonunu kullanabilirsiniz.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <AccessibilityToolbar />
      <Footer />
    </div>
  );
}

function CategoryLink({ label, active, count }: { label: string, active?: boolean, count: number }) {
  return (
    <button
      className={`flex items-center justify-between rounded-full lg:rounded-xl px-5 py-2.5 lg:py-3.5 text-[11px] md:text-sm font-bold transition-all whitespace-nowrap shrink-0 lg:w-full min-w-fit snap-start ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 lg:scale-[1.02]' 
          : 'bg-card lg:bg-transparent border border-border lg:border-none text-muted-foreground hover:bg-muted hover:text-foreground lg:hover:translate-x-1 outline-none focus:ring-2 focus:ring-primary/20'
      }`}
    >
      <span className="mr-4 lg:mr-2">{label}</span>
      <span className={`text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${active ? 'bg-white/20' : 'bg-muted'}`}>
        {count}
      </span>
    </button>
  );
}
