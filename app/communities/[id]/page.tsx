'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
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
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setCommunity(data);
    } catch (err) {
      console.error('Error fetching community:', err);
    }
  }, [id]);

  const fetchTopicsData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*, author:profiles(*), category:categories(*), comments(id)')
        .eq('category_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (id && isMounted) {
        await Promise.all([fetchCommunityData(), fetchTopicsData()]);
      }
    };
    init();
    return () => { isMounted = false; };
  }, [id, fetchCommunityData, fetchTopicsData]);

  const handleSummarize = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    setSummarizingId(topicId);
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
        setSummaryResult({ id: topicId, text: response.text });
      }
    } catch (error: any) {
      console.error('AI Error:', error);
    } finally {
      setSummarizingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Topluluk bulunamadı.</h1>
          <button onClick={() => router.push('/communities')} className="text-primary underline">Topluluklara Geri Dön</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        <button 
          onClick={() => router.push('/communities')}
          className="mb-8 md:mb-12 flex items-center gap-3 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-widest"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Topluluklar
        </button>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 md:gap-16">
          <div className="space-y-12 md:space-y-16">
            <header className="vibe-card p-8 md:p-16 overflow-hidden relative">
              <div className="relative z-10 space-y-8 md:space-y-10">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="p-5 md:p-8 bg-primary/10 rounded-[2rem] md:rounded-[3rem] text-primary shadow-inner">
                    <Users size={40} className="md:size-16" />
                  </div>
                  <h1 className="text-3xl md:text-7xl vibe-heading truncate leading-none">{community.name}</h1>
                </div>
                <p className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-3xl">
                  {community.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <button className="vibe-button-primary bg-primary text-primary-foreground px-12 text-lg md:text-xl">
                    Gruba Katıl
                  </button>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="vibe-button-secondary bg-card border-4 border-border px-12 flex items-center justify-center gap-3 text-sm md:text-base font-black uppercase tracking-widest"
                  >
                    <Plus size={24} /> Başlık Aç
                  </Link>
                </div>
              </div>
              <Users className="absolute -bottom-20 -right-20 size-[400px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
            </header>

            <section className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black flex items-center gap-6 px-4 tracking-tight">
                <MessageSquare size={36} className="text-primary md:size-12" /> Tartışmalar 
                <span className="text-primary opacity-20">{topics.length}</span>
              </h2>
              
              <div className="grid gap-6 md:gap-8">
                {topics.length > 0 ? (
                  topics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
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
                            className="mt-6 p-8 md:p-12 bg-primary/5 border-4 border-primary/10 rounded-[2.5rem] md:rounded-[4rem] shadow-inner relative overflow-hidden"
                          >
                            <div className="flex items-center gap-4 text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-6">
                              <div className="size-2 bg-primary rounded-full animate-ping"></div>
                              AI ÖZETİ
                            </div>
                            <div className="text-lg md:text-2xl font-bold leading-relaxed text-foreground italic decoration-primary/10 underline-offset-8">
                              &ldquo;{summaryResult.text}&rdquo;
                            </div>
                            <button 
                              onClick={() => setSummaryResult(null)}
                              className="mt-8 text-sm font-black text-muted-foreground hover:text-primary transition-colors underline underline-offset-4 uppercase tracking-widest"
                            >
                              Özeti Kapat
                            </button>
                            <Sparkles className="absolute top-4 right-4 text-primary/10 size-12" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-32 bg-card rounded-[4rem] border-4 border-dashed border-border/50 px-8">
                    <MessageSquare size={64} className="mx-auto text-muted-foreground/20 mb-8" />
                    <p className="text-2xl md:text-3xl font-black text-muted-foreground/60 mb-10 tracking-tight">Bu toplulukta henüz tartışma yok.</p>
                    <Link 
                      href={`/discussions/new?category_id=${community.id}`}
                      className="vibe-button-primary"
                    >
                      İlk tartışmayı sen başlat!
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8 md:space-y-12">
            <section className="vibe-card p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-black mb-10 flex items-center gap-4 tracking-tight">
                <Shield size={28} className="text-primary" /> Topluluk Kuralları
              </h2>
              <ul className="space-y-8">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik Odaklılık" description="Paylaşılan içeriğin erişilebilir olduğundan emin olun." />
                <RuleItem title="Gizlilik" description="Üyelerin özel bilgilerini izinsiz paylaşmayın." />
              </ul>
            </section>

            <div className="vibe-card !bg-muted/10 p-8 md:p-12">
              <h3 className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-8">İstatistikler</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-sm md:text-lg text-muted-foreground font-bold flex items-center gap-3"><Users size={20} /> Üyeler</span>
                  <span className="text-lg md:text-2xl font-black text-primary tracking-tight">2.5K+</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-sm md:text-lg text-muted-foreground font-bold flex items-center gap-3"><Globe size={20} /> Görünürlük</span>
                  <span className="text-lg md:text-2xl font-black text-primary tracking-tight">AÇIK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-lg text-muted-foreground font-bold flex items-center gap-3"><Shield size={20} /> Güvenlik</span>
                  <span className="text-lg md:text-2xl font-black text-primary tracking-tight">DOĞRULANMIŞ</span>
                </div>
              </div>
            </div>

            <div className="vibe-card !bg-primary p-8 md:p-12 text-primary-foreground relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.4em] mb-4 opacity-70">HIZLI YARDIM</h3>
                <p className="text-lg md:text-xl font-bold mb-8 leading-relaxed">Topluluk hakkında sorun mu var? Moderatörlere hemen yaz.</p>
                <button className="w-full py-5 bg-white text-primary rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl group-hover:scale-105 transition-all active:scale-95">
                  Moderatöre Mesaj
                </button>
              </div>
              <Sparkles className="absolute -top-6 -right-6 size-24 opacity-20 rotate-12" />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <AccessibilityToolbar />
    </div>
  );
}

function RuleItem({ title, description }: { title: string, description: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary mt-1">
        ✓
      </div>
      <div>
        <h4 className="text-sm font-bold mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </li>
  );
}
