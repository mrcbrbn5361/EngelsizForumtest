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
          className="mb-6 md:mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Topluluklar
        </button>

        <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-8 md:gap-10">
          <div className="space-y-8 md:space-y-12">
            <header className="vibe-card p-6 md:p-10 lg:p-12 overflow-hidden relative">
              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="p-4 md:p-6 bg-primary/10 rounded-2xl md:rounded-3xl text-primary shrink-0">
                    <Users size={32} className="md:size-10" />
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold truncate tracking-tight">{community.name}</h1>
                </div>
                <p className="text-sm md:text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                  {community.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button className="vibe-button-primary px-8 py-3 text-sm md:text-base">
                    Gruba Katıl
                  </button>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="vibe-button-primary bg-card border border-border text-foreground hover:bg-muted px-8 py-3 flex items-center justify-center gap-2 text-xs md:text-sm"
                  >
                    <Plus size={18} /> Başlık Aç
                  </Link>
                </div>
              </div>
            </header>

            <section className="space-y-6 md:space-y-8">
              <h2 className="text-xl md:text-3xl font-bold flex items-center gap-3 px-2 tracking-tight">
                <MessageSquare size={24} className="text-primary md:size-8" /> Tartışmalar 
                <span className="text-primary opacity-30 text-lg md:text-2xl">{topics.length}</span>
              </h2>
              
              <div className="grid gap-4 md:gap-6">
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
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 p-4 md:p-6 bg-primary/5 border border-primary/10 rounded-xl md:rounded-2xl relative overflow-hidden"
                          >
                            <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-widest mb-3">
                              <Sparkles size={14} /> AI ÖZETİ
                            </div>
                            <div className="text-xs md:text-sm leading-relaxed font-medium text-foreground italic">
                              &ldquo;{summaryResult.text}&rdquo;
                            </div>
                            <button 
                              onClick={() => setSummaryResult(null)}
                              className="mt-3 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors underline uppercase tracking-widest"
                            >
                              Özeti Kapat
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border px-8">
                    <MessageSquare size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                    <p className="text-lg md:text-xl font-bold text-muted-foreground/60 mb-6">Bu toplulukta henüz tartışma yok.</p>
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

          <aside className="space-y-6 md:space-y-8">
            <section className="vibe-card p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-3 tracking-tight">
                <Shield size={20} className="text-primary" /> Topluluk Kuralları
              </h2>
              <ul className="space-y-6">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik Odaklılık" description="Paylaşılan içeriğin erişilebilir olduğundan emin olun." />
                <RuleItem title="Gizlilik" description="Üyelerin özel bilgilerini izinsiz paylaşmayın." />
              </ul>
            </section>

            <div className="vibe-card !bg-muted/10 p-6 md:p-8 pb-4 md:pb-6">
              <h3 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">İstatistikler</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs md:text-sm text-muted-foreground font-bold flex items-center gap-2"><Users size={16} /> Üyeler</span>
                  <span className="text-sm md:text-base font-bold text-primary">2.5K+</span>
                </div>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs md:text-sm text-muted-foreground font-bold flex items-center gap-2"><Globe size={16} /> Görünürlük</span>
                  <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">AÇIK</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground font-bold flex items-center gap-2"><Shield size={16} /> Güvenlik</span>
                  <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">DOĞRULANMIŞ</span>
                </div>
              </div>
            </div>

            <div className="vibe-card !bg-primary p-6 md:p-8 text-primary-foreground relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 opacity-70">HIZLI YARDIM</h3>
                <p className="text-sm md:text-base font-bold mb-6 leading-relaxed">Topluluk hakkında sorun mu var? Moderatörlere hemen yaz.</p>
                <button className="w-full py-3 bg-white text-primary rounded-full font-bold text-xs uppercase tracking-widest shadow-md hover:bg-white/90 transition-all active:scale-95">
                  Moderatöre Mesaj
                </button>
              </div>
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
