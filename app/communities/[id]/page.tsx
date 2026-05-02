'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
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

      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <button 
          onClick={() => router.push('/communities')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Topluluklar
        </button>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6 md:gap-8">
          <div className="space-y-6 md:space-y-8">
            <header className="bg-card border border-border rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                  <div className="p-2.5 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl text-primary shrink-0">
                    <Users size={24} className="md:w-8 md:h-8" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold truncate">{community.name}</h1>
                </div>
                <p className="text-sm md:text-lg text-muted-foreground mb-6 leading-relaxed">
                  {community.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm md:text-base">
                    Gruba Katıl
                  </button>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="w-full sm:w-auto flex items-center justify-center bg-card border border-border px-8 py-3 rounded-full font-bold hover:bg-muted transition-all active:scale-95 text-sm md:text-base text-muted-foreground"
                  >
                    <Plus size={18} className="mr-2" /> Başlık Aç
                  </Link>
                </div>
              </div>
              <Users className="absolute -bottom-10 -right-10 size-64 opacity-5 pointer-events-none" />
            </header>

            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4 px-2">
                <MessageSquare size={20} className="text-primary" /> Tartışmalar ({topics.length})
              </h2>
              
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
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 p-6 bg-primary/5 border border-primary/10 rounded-[2rem]"
                        >
                          <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-3">
                            <Sparkles size={14} /> AI ÖZETİ
                          </div>
                          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                            {summaryResult.text.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
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
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-card rounded-[2rem] border border-dashed border-border px-4">
                  <p className="text-muted-foreground italic mb-4">Bu toplulukta henüz tartışma başlatılmamış.</p>
                  <Link 
                    href={`/discussions/new?category_id=${community.id}`}
                    className="text-primary font-bold hover:underline"
                  >
                    İlk tartışmayı siz başlatın!
                  </Link>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4 md:space-y-6">
            <section className="bg-card border border-border rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-3">
                <Shield size={20} className="text-primary" /> Kurallar
              </h2>
              <ul className="space-y-4">
                <RuleItem title="Saygı ve Nezaket" description="Tüm üyelere saygılı davranın ve yapıcı geri bildirimler verin." />
                <RuleItem title="Erişilebilirlik Odaklılık" description="Paylaşılan içeriğin erişilebilir olduğundan emin olun." />
                <RuleItem title="Gizlilik" description="Üyelerin özel bilgilerini izinsiz paylaşmayın." />
              </ul>
            </section>

            <div className="bg-card border border-border rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm">
              <h3 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Grup Bilgileri</h3>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2"><Users size={14} /> Üyeler</span>
                  <span className="text-xs md:text-sm font-bold">Keşfediliyor...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2"><Globe size={14} /> Görünürlük</span>
                  <span className="text-xs md:text-sm font-bold">Açık</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-2"><Shield size={14} /> Tür</span>
                  <span className="text-xs md:text-sm font-bold">Destek Grubu</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-5 md:p-6">
              <h3 className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest mb-2">Hızlı Destek</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-4 leading-relaxed">Bu grup hakkında sorunuz mu var? Moderatörlere ulaşın.</p>
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-[10px] md:text-xs font-bold shadow-lg active:scale-95 transition-transform">
                Yöneticiye Yaz
              </button>
            </div>
          </aside>
        </div>
      </main>

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
