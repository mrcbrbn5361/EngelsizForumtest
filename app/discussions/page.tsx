'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
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
      
      if (error) throw error;
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
      if (!error && data) setCategories(data);
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
        model: 'gemini-3.0-flash',
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <MessageSquareCode className="text-primary" /> Tartışmalar
            </h1>
            <p className="text-muted-foreground">Topluluğumuzdaki güncel başlıkları ve yardım taleplerini inceleyin.</p>
          </div>
          
          <Link 
            href="/discussions/new"
            className="flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1"
          >
            <Plus size={18} /> Yeni Başlık Aç
          </Link>
        </header>

        <div className="grid lg:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar / Filters */}
          <aside className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text"
                placeholder="Başlıklarda ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <nav className="space-y-1" aria-label="Kategoriler">
              <h2 className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <Filter size={14} /> Kategoriler
              </h2>
              <CategoryLink label="Tüm Tartışmalar" active count={topics.length} />
              {categories.map(cat => (
                <CategoryLink key={cat.id} label={cat.name} count={topics.filter(t => t.category_id === cat.id).length} />
              ))}
            </nav>
          </aside>

          {/* Discussion List */}
          <section className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="font-bold text-muted-foreground">Tartışmalar yükleniyor...</p>
              </div>
            ) : filteredTopics.length > 0 ? (
              filteredTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                      className="mt-2 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]"
                    >
                      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
                        <Sparkles size={14} /> AI ÖZETİ (Gemini)
                      </div>
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        {summaryResult.text.split('\n').map((line, i) => (
                          <p key={i} className={line.startsWith('-') || line.startsWith('•') ? 'ml-4' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                      <button 
                        onClick={() => setSummaryResult(null)}
                        className="mt-4 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                      >
                        Özeti Kapat
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-card rounded-[3rem] border border-dashed border-border">
                <MessageSquareCode className="mx-auto text-muted-foreground mb-4 opacity-20" size={64} />
                <h3 className="text-xl font-bold mb-2">Henüz tartışma bulunamadı</h3>
                <p className="text-muted-foreground">Bir tartışma başlatmak için &quot;Yeni Başlık Aç&quot; butonunu kullanabilirsiniz.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <AccessibilityToolbar />
    </div>
  );
}

function CategoryLink({ label, active, count }: { label: string, active?: boolean, count: number }) {
  return (
    <button
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-all ${
        active 
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1'
      }`}
    >
      <span>{label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${active ? 'bg-white/20' : 'bg-muted'}`}>
        {count}
      </span>
    </button>
  );
}
