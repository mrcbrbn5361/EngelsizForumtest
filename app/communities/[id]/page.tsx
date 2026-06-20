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
          className="mb-8 flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest px-2"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Topluluklar
        </button>

        <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 md:gap-12">
          <div className="space-y-12">
            <header className="bg-card p-6 md:p-12 rounded-[2rem] border border-border overflow-hidden relative shadow-sm">
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary shrink-0 text-3xl">
                    <Users size={32} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">TOPLULUK</p>
                    <h1 className="text-3xl md:text-5xl font-black break-words whitespace-normal tracking-tighter text-foreground leading-tight">{community.name}</h1>
                  </div>
                </div>
                <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                  {community.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button className="bg-primary text-primary-foreground px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary">
                    Gruba Katıl
                  </button>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="bg-muted text-foreground px-10 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-muted/80 hover:scale-[1.02] active:scale-95 transition-all outline-none focus:ring-2 focus:ring-primary"
                  >
                    <Plus size={20} /> Başlık Aç
                  </Link>
                </div>
              </div>
            </header>

            <section className="space-y-8">
              <h2 className="text-2xl md:text-4xl font-black flex items-center gap-4 px-2 tracking-tighter text-foreground">
                <MessageSquare size={32} className="text-primary" /> Tartışmalar 
                <span className="text-primary/30">{topics.length}</span>
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

          <aside className="space-y-8">
            <section className="bg-card p-6 md:p-10 rounded-[2rem] border border-border shadow-sm">
              <h2 className="text-xl md:text-2xl font-black mb-8 flex items-center gap-3 tracking-tighter text-foreground">
                <Shield size={24} className="text-primary" /> Kurallar
              </h2>
              <ul className="space-y-8">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik" description="Paylaşılan içeriğin herkes tarafından anlaşılır olduğundan emin olun." />
                <RuleItem title="Güvenlik" description="Topluluk güvenliğini sarsacak her türlü davranıştan kaçının." />
              </ul>
            </section>

            <div className="bg-muted/30 p-6 md:p-10 rounded-[2rem] border border-border">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-8">İstatistikler</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <span className="text-sm md:text-base text-muted-foreground font-bold flex items-center gap-3"><Users size={20} /> Üyeler</span>
                  <span className="text-lg font-black text-primary tracking-tighter">2.5K+</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <span className="text-sm md:text-base text-muted-foreground font-bold flex items-center gap-3"><Globe size={20} /> Görünürlük</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AÇIK TOPLULUK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base text-muted-foreground font-bold flex items-center gap-3"><Shield size={20} /> Durum</span>
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">GÜVENLİ</span>
                </div>
              </div>
            </div>

            <div className="bg-primary p-8 md:p-10 rounded-[2rem] text-primary-foreground relative overflow-hidden shadow-2xl group">
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
                <Shield size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 opacity-70">HIZLI YARDIM</h3>
                <p className="text-lg md:text-xl font-bold mb-8 leading-tight tracking-tight">Topluluk hakkında sorun mu var? Moderatörlere hemen yaz.</p>
                <button className="w-full py-4 bg-white text-primary rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-lg">
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
