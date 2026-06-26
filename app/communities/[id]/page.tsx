'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ArrowLeft, Users, MessageSquare, Shield, Globe, Loader2, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { Topic } from '@/types/database';
import { DiscussionCard } from '@/components/forum/discussion-card';
import { GoogleGenAI } from '@google/genai';
import Link from 'next/link';

interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export default function CommunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<{ id: string, text: string } | null>(null);
  
  const fetchCommunityData = useCallback(async () => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setCommunity(data);

      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .select(`
          *,
          author:profiles(username, avatar_url),
          category:categories(name),
          comments(count)
        `)
        .eq('category_id', id)
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCommunityData();
    }
  }, [id, fetchCommunityData]);

  const handleSummarize = async (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert('AI Özeti için gerekli veriler eksik.');
      return;
    }

    setSummarizingId(id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Lütfen aşağıdaki forum başlığı içeriğini kısa ve öz bir şekilde (maksimum 3 cümle) Türkçe özetle:\n\n${topic.content}`,
      });
      
      if (response.text) {
        setSummaryResult({ id, text: response.text });
      }
    } catch (error: any) {
      console.error('Summarization failed:', error);
      alert('Özet oluşturulurken bir hata oluştu: ' + error.message);
    } finally {
      setSummarizingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-primary" size={64} />
          <p className="mt-6 font-black text-muted-foreground uppercase tracking-widest text-sm">Yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-6">
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Topluluk Bulunamadı</h1>
          <button 
            onClick={() => router.push('/communities')} 
            className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
          >
            Topluluklara Geri Dön
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <button 
          onClick={() => router.push('/communities')}
          className="mb-8 flex items-center gap-3 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-[0.2em] px-2"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> TOPLULUKLAR
        </button>

        <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-10 md:gap-16">
          <div className="space-y-16">
            <header className="vibe-card p-8 md:p-16 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
              <div className="relative z-10 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                  <div className="w-20 h-20 md:w-28 md:h-28 bg-primary/10 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-primary shrink-0 transition-all group-hover:scale-105">
                    <Users size={48} />
                  </div>
                  <div className="min-w-0">
                    <p className="vibe-label ml-0 mb-3">TOPLULUK</p>
                    <h1 className="vibe-section-title text-4xl md:text-6xl">{community.name}</h1>
                  </div>
                </div>
                <p className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                  {community.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <button className="vibe-button-primary h-20 px-12 text-xl">
                    GRUBA KATIL
                  </button>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="h-20 px-12 rounded-[2rem] bg-muted border-2 border-transparent hover:border-primary/20 text-foreground font-black text-xl flex items-center justify-center gap-4 hover:bg-muted/80 hover:scale-[1.02] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-primary/10"
                  >
                    <Plus size={28} /> BAŞLIK AÇ
                  </Link>
                </div>
              </div>
            </header>

            <section className="space-y-12">
              <h2 className="vibe-section-title px-4 flex items-center gap-6">
                <MessageSquare size={48} className="text-primary" /> Tartışmalar 
                <span className="text-primary/20">{topics.length}</span>
              </h2>
              
              <div className="grid gap-6">
                {topics.length > 0 ? (
                  topics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <DiscussionCard 
                        topic={topic} 
                        onSummarize={handleSummarize}
                        isLoading={summarizingId === topic.id}
                      />
                      <AnimatePresence>
                        {summaryResult && summaryResult.id === topic.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-3 p-6 md:p-8 bg-primary/5 border border-primary/10 rounded-2xl relative overflow-hidden ring-1 ring-primary/20"
                          >
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-4">
                              <Sparkles size={16} /> AI ÖZETİ
                            </div>
                            <div className="text-base md:text-lg leading-relaxed font-bold text-foreground italic">
                              &ldquo;{summaryResult.text}&rdquo;
                            </div>
                            <button 
                              onClick={() => setSummaryResult(null)}
                              className="mt-6 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors underline uppercase tracking-widest"
                            >
                              Özeti Kapat
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-24 bg-card rounded-[2rem] border-2 border-dashed border-border px-8">
                    <MessageSquare size={80} className="mx-auto text-muted-foreground/10 mb-8" />
                    <p className="text-xl md:text-3xl font-black text-muted-foreground/40 mb-10 tracking-tighter">Henüz tartışma başlatılmadı.</p>
                    <Link 
                      href={`/discussions/new?category_id=${community.id}`}
                      className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 inline-block"
                    >
                      İlk tartışmayı sen başlat!
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-10">
            <section className="vibe-card p-8 md:p-12">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-4 tracking-tighter text-foreground">
                <Shield size={32} className="text-primary" /> KURALLAR
              </h2>
              <ul className="space-y-10">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik" description="Paylaşılan içeriğin herkes tarafından anlaşılır olduğundan emin olun." />
                <RuleItem title="Güvenlik" description="Topluluk güvenliğini sarsacak her türlü davranıştan kaçının." />
              </ul>
            </section>

            <div className="vibe-card p-8 md:p-12">
              <h3 className="vibe-label ml-0 mb-10">İSTATİSTİKLER</h3>
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><Users size={24} /> Üyeler</span>
                  <span className="text-2xl font-black text-primary tracking-tighter">2.5K+</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><Globe size={24} /> Görünürlük</span>
                  <span className="vibe-label ml-0">AÇIK TOPLULUK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg text-muted-foreground font-black flex items-center gap-4 tracking-tight"><Shield size={24} /> Durum</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">GÜVENLİ</span>
                </div>
              </div>
            </div>

            <div className="bg-primary p-12 rounded-[2.5rem] text-primary-foreground relative overflow-hidden shadow-2xl group">
              <div className="absolute -right-16 -bottom-16 opacity-10 group-hover:scale-110 transition-transform">
                <Shield size={220} />
              </div>
              <div className="relative z-10">
                <h3 className="vibe-label ml-0 mb-6 text-white/70">HIZLI YARDIM</h3>
                <p className="text-2xl font-black mb-10 leading-tight tracking-tight">Topluluk hakkında sorun mu var? Moderatörlere hemen yaz.</p>
                <button className="w-full h-18 bg-white text-primary rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-black/20">
                  BİZE ULAŞIN
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RuleItem({ title, description }: { title: string, description: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary mt-1 border border-primary/20">
        ✓
      </div>
      <div>
        <h4 className="text-lg md:text-xl font-black mb-1 text-foreground tracking-tight">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
      </div>
    </li>
  );
}
