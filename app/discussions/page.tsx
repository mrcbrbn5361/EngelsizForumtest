'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Topic, Category } from '@/types/database';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { GoogleGenAI } from '@google/genai';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DiscussionCard } from '@/components/forum/discussion-card';

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'Latest' | 'Popular' | 'Categories'>('Latest');
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string, text: string } | null>(null);

  const fetchTopics = useCallback(async () => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('topics')
        .select(`
          *,
          author:profiles(username, avatar_url, full_name),
          category:categories(name),
          comments(count)
        `);

      if (selectedCategoryId) {
        query = query.eq('category_id', selectedCategoryId);
      }

      if (sortBy === 'Latest') {
        query = query
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, sortBy]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      await fetchCategories();
      await fetchTopics();
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchTopics, fetchCategories]);

  const handleSummarize = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    setSummarizingId(id);
    setSummaryResult(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: topic.title, 
          content: topic.content,
          type: 'topic_summary'
        }),
      });
      
      const data = await response.json();
      
      if (data.text) {
        setSummaryResult({ id, text: data.text });
      } else {
        throw new Error(data.error || 'Özet oluşturulamadı.');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      alert(error.message || 'Özet oluşturulurken bir hata oluştu.');
    } finally {
      setSummarizingId(null);
    }
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/discussions#webpage",
                "url": "https://engelsizforum.miracdeveloper.com.tr/discussions",
                "name": "Tartışmalar | EngelsizForum",
                "description": "Erişilebilirlik, yardımcı teknolojiler ve engelsiz yaşam üzerine yapılan topluluk tartışmaları.",
                "isPartOf": { "@id": "https://engelsizforum.miracdeveloper.com.tr/#website" },
                "inLanguage": "tr-TR"
              },
              {
                "@type": "BreadcrumbList",
                "@id": "https://engelsizforum.miracdeveloper.com.tr/discussions#breadcrumb",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Ana Sayfa",
                    "item": "https://engelsizforum.miracdeveloper.com.tr"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Tartışmalar",
                    "item": "https://engelsizforum.miracdeveloper.com.tr/discussions"
                  }
                ]
              }
            ]
          })
        }}
      />
      <div className="vibe-container py-12 md:py-16">
        <header className="mb-16">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 transition-all hover:bg-primary/10">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl">🔥</span> POPÜLER KONULAR
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                Yardımcı teknolojiler, erişilebilir oyun dünyası ve engelli hakları bu hafta en çok konuşulan başlıklar arasında.
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 transition-all hover:bg-primary/10">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl">🤖</span> AI ANALİZİ
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                Topluluğumuzdaki tartışmaların %80'i pratik çözüm önerileri içeriyor. AI özetleme özelliği ile saniyeler içinde bilgiye ulaşın.
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 transition-all hover:bg-primary/10">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                <span className="text-xl">🤝</span> ÜYE DAYANIŞMASI
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                Her gün ortalama 50+ yeni çözüm önerisi paylaşılıyor. Kendi deneyiminizi paylaşarak topluluğa uzmanlık katın.
              </p>
            </div>
          </div>

          <div className="vibe-card p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="space-y-6">
                <p className="vibe-label ml-0">TARTIŞMA PLATFORMU</p>
                <h1 className="vibe-section-title uppercase">Topluluk Konuşmaları</h1>
                <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                  Yardımlaşmak, deneyim paylaşmak ve yeni insanlarla tanışmak için en doğru yerdesiniz.
                </p>
              </div>
              <Link 
                href="/discussions/new"
                className="vibe-button-primary h-20 px-10 text-xl shrink-0"
              >
                <Plus size={32} /> YENİ BAŞLIK
              </Link>
            </div>
            
            <div className="mt-16 relative group/search">
              <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-primary transition-colors size-6 md:size-7" />
              <input 
                type="text"
                placeholder="TARTIŞMALARDA ARA..."
                aria-label="Tartışma başlıklarında ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vibe-input vibe-input-search h-16 md:h-20 text-base md:text-xl uppercase"
              />
            </div>
          </div>
        </header>

        <nav className="mb-12" aria-label="Kategori filtreleri">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-10">
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-6 -my-2 no-scrollbar snap-x relative min-w-0 flex-1 -mx-4 px-4 sm:mx-0 sm:px-0" role="list">
              {[
                { label: 'TÜMÜ', id: null },
                ...categories.filter(c => !c.parent_id).map(c => ({ label: c.name.toUpperCase(), id: c.id }))
              ].map(item => (
                <button 
                  key={item.id || 'all'} 
                  onClick={() => setSelectedCategoryId(item.id)}
                  role="listitem"
                  aria-label={`${item.label} kategorisini filtrele`}
                  aria-pressed={selectedCategoryId === item.id}
                  className={cn(
                    "px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-2xl text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all whitespace-nowrap border-2 shrink-0 snap-start active:scale-95 outline-none focus:ring-4 focus:ring-primary/20 shadow-sm",
                    selectedCategoryId === item.id 
                      ? 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' 
                      : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-row flex-nowrap items-center bg-muted/50 p-1.5 rounded-[2rem] shrink-0 self-start xl:self-auto w-full xl:w-auto border-2 border-border/50">
              {[
                { label: 'EN YENİ', value: 'Latest' },
                { label: 'POPÜLER', value: 'Popular' },
                { label: 'GRUPLAR', value: 'Categories' }
              ].map(item => (
                <button 
                  key={item.label} 
                  onClick={() => setSortBy(item.value as any)}
                  className={`flex-1 xl:flex-none px-3 sm:px-5 md:px-8 py-2.5 sm:py-3 rounded-[1.5rem] text-[10px] sm:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] transition-all whitespace-nowrap shrink-0 ${
                    sortBy === item.value 
                      ? 'bg-background text-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <section className="space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-card p-6 md:p-8 rounded-[2rem] border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4 md:gap-6 min-w-0 flex-1">
                    <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded-2xl shrink-0" />
                    <div className="min-w-0 space-y-3 flex-1">
                      <Skeleton className="h-8 w-3/4 rounded-lg" />
                      <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-4 w-32 rounded-md" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-10 w-28 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortBy === 'Categories' ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {categories.filter(c => !c.parent_id).map(category => (
                <button 
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSortBy('Latest');
                  }}
                  className="p-8 rounded-[2rem] border border-border bg-card hover:border-primary/50 transition-all text-left flex flex-col gap-6 group hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-primary transition-colors">
                    <MessageSquare size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-foreground tracking-tight mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                    <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed line-clamp-2">
                      {category.description || 'Bu grup henüz bir açıklamaya sahip değil.'}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest text-center">
                    GÖRÜNTÜLE
                  </div>
                </button>
              ))}
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="grid gap-6">
              {filteredTopics.map((topic) => (
                <DiscussionCard 
                  key={topic.id}
                  topic={topic}
                  onSummarize={handleSummarize}
                  isLoading={summarizingId === topic.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-card rounded-[3rem] border-4 border-dashed border-border px-8">
              <MessageSquare size={120} className="mx-auto text-muted-foreground/10 mb-8" />
              <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter text-foreground">Başlık Bulunamadı</h3>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                Aradığınız kriterlere uygun bir tartışma henüz başlatılmamış. İlk adımı siz atmak ister misiniz?
              </p>
            </div>
          )}
        </section>

        <AnimatePresence>
          {summaryResult && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-[450px] z-50"
            >
              <div className="bg-card border-2 border-primary/20 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden ring-4 ring-primary/5">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-primary font-black text-sm uppercase tracking-widest">
                    <Sparkles size={20} /> AI TARTIŞMA ÖZETİ
                  </div>
                  <button 
                    onClick={() => setSummaryResult(null)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>
                <div className="text-lg leading-relaxed font-bold text-foreground italic">
                  &ldquo;{summaryResult.text}&rdquo;
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
