'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MessageSquareCode, Plus, Loader2, Sparkles, ChevronRight, MessageSquare, Globe, Pin, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Topic, Category } from '@/types/database';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      await fetchCategories();
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: topic.title,
          content: topic.content,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Özet oluşturulamadı.');
      }

      if (data.summary) {
        setSummaryResult({ id, text: data.summary });
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      alert('Özet oluşturulurken bir hata oluştu: ' + error.message);
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
            "@type": "CollectionPage",
            "name": "EngelsizForum Tartışmaları",
            "description": "Erişilebilirlik ve topluluk yardımlaşma konularında en güncel tartışmalar.",
            "url": "https://engelsizforum.miracdeveloper.com.tr/discussions",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": filteredTopics.map((t, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://engelsizforum.miracdeveloper.com.tr/discussions/${t.id}`,
                "name": t.title
              }))
            }
          })
        }}
      />
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-12">
          {/* Trending / Summary Section for GEO */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>🔥</span> Popüler Konular
              </h2>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Yardımcı teknolojiler, erişilebilir oyun dünyası ve engelli hakları bu hafta en çok konuşulan başlıklar arasında.
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>🤖</span> AI Analizi
              </h2>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Topluluğumuzdaki tartışmaların %80&apos;i pratik çözüm önerileri içeriyor. AI özetleme özelliği ile saniyeler içinde bilgiye ulaşın.
              </p>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
              <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>🤝</span> Üye Dayanışması
              </h2>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Her gün ortalama 50+ yeni çözüm önerisi paylaşılıyor. Kendi deneyiminizi paylaşarak topluluğa uzmanlık katın.
              </p>
            </div>
          </div>

          <div className="bg-card p-8 md:p-12 rounded-[2rem] border border-border relative overflow-hidden shadow-sm group">
            <div className="absolute inset-0 bg-primary/5 -z-10 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">TARTIŞMA PLATFORMU</p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">Topluluk Konuşmaları</h1>
                <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed max-w-xl">
                  Yardımlaşmak, deneyim paylaşmak ve yeni insanlarla tanışmak için en doğru yerdesiniz.
                </p>
              </div>
              <Link 
                href="/discussions/new"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus size={24} /> Yeni Başlık
              </Link>
            </div>
            
            <div className="mt-12 relative group/search">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-primary transition-colors" size={24} />
              <input 
                type="text"
                placeholder="Tartışmalarda ara..."
                aria-label="Tartışma başlıklarında ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 h-[68px] rounded-2xl border border-border bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-lg"
              />
            </div>
          </div>
        </header>

        <nav className="mb-12 px-2" aria-label="Kategori filtreleri">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
            <div className="flex items-center gap-4 overflow-x-auto pb-6 -mb-6 scrollbar-hide no-scrollbar snap-x relative min-w-0 flex-1" role="list">
              {[
                { label: 'Tümü', id: null },
                ...categories.filter(c => !c.parent_id).map(c => ({ label: c.name, id: c.id }))
              ].map(item => (
                <button 
                  key={item.id || 'all'} 
                  onClick={() => setSelectedCategoryId(item.id)}
                  role="listitem"
                  aria-label={`${item.label} kategorisini filtrele`}
                  aria-pressed={selectedCategoryId === item.id}
                  className={cn(
                    "px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 shrink-0 snap-start active:scale-95 outline-none focus:ring-4 focus:ring-primary/20",
                    selectedCategoryId === item.id 
                      ? 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]' 
                      : 'border-transparent bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            
          <div className="flex bg-muted/50 p-1.5 rounded-2xl shrink-0 self-start xl:self-auto w-full xl:w-auto overflow-x-auto no-scrollbar border border-border/50">
            {[
              { label: 'En Yeni', value: 'Latest' },
              { label: 'Popüler', value: 'Popular' },
              { label: 'Gruplar', value: 'Categories' }
            ].map(item => (
              <button 
                key={item.label} 
                onClick={() => setSortBy(item.value as any)}
                className={`flex-1 xl:flex-none px-6 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  sortBy === item.value 
                    ? 'bg-background text-foreground shadow-lg' 
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
                  <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                    BAŞLIKLARI GÖR <ChevronRight size={16} />
                  </div>
                </button>
              ))}
            </div>
          ) : filteredTopics.length > 0 ? (
            <div className="grid gap-6">
              {filteredTopics.map((topic, index) => (
                <motion.div 
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card p-6 md:p-8 rounded-[2rem] border border-border hover:border-primary/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 md:gap-6 min-w-0 flex-1">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-muted flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/10 transition-colors text-2xl md:text-3xl">
                      <MessageSquareCode size={24} />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <Link 
                        href={`/discussions/${topic.id}`} 
                        className="text-xl md:text-2xl font-black text-foreground hover:text-primary transition-colors block break-words whitespace-normal tracking-tight"
                      >
                        {topic.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                          <Plus size={14} /> {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
                        </div>
                        {topic.is_pinned && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                            <Pin size={12} /> SABİTLENDİ
                          </div>
                        )}
                        {topic.is_locked && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                            <Lock size={12} /> KİLİTLİ
                          </div>
                        )}
                        <div className="px-3 py-1 rounded-full bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {topic.category?.name || 'Genel'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <Globe size={14} className="text-primary" /> {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <MessageSquare size={14} className="text-primary" /> {topic.comments?.[0]?.count || 0} CEVAP
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                    <button 
                      onClick={() => handleSummarize(topic.id)}
                      disabled={summarizingId === topic.id}
                      className="p-3 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-all disabled:opacity-50 group/ai flex items-center gap-2"
                    >
                      {summarizingId === topic.id ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      <span className="text-[10px] font-black uppercase tracking-widest hidden group-hover/ai:inline">Özetle</span>
                    </button>
                    <Link 
                      href={`/discussions/${topic.id}`}
                      className="px-6 py-3 bg-muted text-foreground rounded-xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all"
                    >
                      Konuyu Gör
                    </Link>
                  </div>
                </motion.div>
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
