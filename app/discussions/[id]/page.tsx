'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import Link from 'next/link';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, User, Calendar, MessageSquare, Sparkles, Loader2, Flag, Heart, Lock, Pin, CheckCircle } from 'lucide-react';
import { ReactionButton } from '@/components/forum/reaction-button';
import { ReportButton } from '@/components/forum/report-button';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

/**
 * Discussion Detail Page
 */
export default function DiscussionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => setProfile(data));
    }
  }, [user]);

  const handleUpdateTopic = async (updates: Partial<Topic>) => {
    if (!topic || !user) return;
    try {
      const { error } = await supabase.from('topics').update(updates).eq('id', topic.id);
      if (error) throw error;
      setTopic({ ...topic, ...updates } as Topic);
    } catch (err: any) {
      alert('Güncelleme hatası: ' + err.message);
    }
  };

  const [sending, setSending] = useState(false);

  const fetchTopic = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*, author:profiles(*), category:categories(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setTopic(data);
    } catch (err) {
      console.error('Error fetching topic:', err);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('topic_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (id && isMounted) {
        await fetchTopic();
        await fetchComments();
      }
    };
    init();
    return () => { isMounted = false; };
  }, [id, fetchTopic, fetchComments]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !id) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          topic_id: id,
          author_id: user.id,
          content: newComment
        })
        .select('*, author:profiles(*)')
        .single();
      
      if (error) throw error;
      
      setComments([...comments, data]);
      setNewComment('');
    } catch (err: any) {
      alert('Yorum gönderilirken hata oluştu: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSummarize = async () => {
    if (!topic) return;
    setIsSummarizing(true);
    setSummary(null);
    
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const prompt = `Lütfen aşağıdaki forum tartışmasını engelli bireyler için çok kısa, net ve anlaşılır özetle. Yanıtın sadece Türkçe ve tek bir paragraf olsun. 
      Başlık: ${topic.title}
      İçerik: ${topic.content}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      
      const text = response.text;
      
      if (text) {
        setSummary(text);
      }
    } catch (error: any) {
      console.error('AI Summary Error:', error);
      if (error.message?.includes('503') || error.message?.includes('high demand')) {
        setSummary("Sistem şu an çok yoğun. Lütfen birkaç dakika sonra tekrar deneyin.");
      } else {
        setSummary("Üzgünüz, şu an özet oluşturulamıyor. Lütfen içeriği okumaya devam edin.");
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Tartışma bulunamadı.</h1>
          <button onClick={() => router.push('/discussions')} className="text-primary underline">Tartışmalara Geri Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Geri Dön
        </button>
        <article className="bg-background rounded-none md:rounded-lg border border-border/50 shadow-sm mb-8 md:mb-12 relative p-6 md:p-12">
          <header className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                {topic.category?.name || 'Genel'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">{topic.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-y border-border/50 py-4">
               <span>{topic.author?.username || 'Anonim'}</span>
               <span>•</span>
               <span>{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
               <div className="flex items-center gap-2 ml-auto">
                 {topic.is_pinned && <span className="text-primary text-xs">Sabit</span>}
                 {topic.is_solved && <span className="text-green-600 text-xs">Çözüldü</span>}
                 {topic.is_locked && <span className="text-red-500 text-xs">Kilitli</span>}
               </div>
            </div>
          </header>

          <AnimatePresence>
            {summary && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-8 p-6 md:p-10 bg-primary/5 border border-primary/10 rounded-2xl md:rounded-3xl shadow-inner relative"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-primary" />
                  <h3 className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">Yapay Zeka Erişilebilirlik Özeti</h3>
                </div>
                <p className="text-base md:text-xl font-medium leading-relaxed text-foreground italic">
                  &ldquo;{summary}&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="prose prose-slate dark:prose-invert max-w-none mb-12 md:mb-20 leading-relaxed md:text-lg font-medium text-foreground/90">
             {topic.content ? (
               <ReactMarkdown>{topic.content}</ReactMarkdown>
             ) : (
               <p className="text-muted-foreground italic">İçerik yüklenemedi.</p>
             )}
          </div>

          <div className="border-t border-border pt-10 md:pt-16 space-y-8 md:space-y-12">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <MessageSquare size={24} className="text-primary md:size-8" /> Yanıtlar 
              <span className="text-primary opacity-40">{comments.length}</span>
            </h2>

            <div className="space-y-6 md:space-y-10">
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 md:gap-6 group"
                >
                  <div className="h-9 w-9 md:h-12 md:w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border shadow-sm">
                    {comment.author?.avatar_url ? (
                      <Image 
                        src={comment.author.avatar_url} 
                        alt="" 
                        width={48}
                        height={48}
                        className="object-cover" 
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                    ) : (
                      <User size={18} className="md:size-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm md:text-base lg:text-lg truncate">{comment.author?.username || 'Anonim'}</span>
                      <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-muted/30 p-4 md:p-6 rounded-xl md:rounded-2xl text-sm md:text-base leading-relaxed font-medium break-words">
                      {comment.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/50">
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Henüz Yanıt Yok</p>
                </div>
              )}
            </div>

            {user ? (
              topic.is_locked ? (
                <div className="bg-muted/30 p-8 rounded-3xl border border-dashed border-border mt-12 text-center">
                  <Lock size={32} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] md:text-xs">Bu tartışma kilitlendi. Yeni yanıt gönderilemez.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="bg-card p-6 md:p-10 rounded-2xl md:rounded-3xl border border-primary/20 shadow-lg mt-12">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Fikrini Paylaş</h3>
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tartışmaya katıl..."
                    disabled={sending}
                    className="w-full py-3 text-base md:text-xl font-medium bg-transparent min-h-[120px] md:min-h-[180px] outline-none placeholder:text-muted-foreground/30 resize-none disabled:opacity-50"
                  />
                  <div className="flex justify-end mt-4">
                    <button 
                      type="submit"
                      disabled={sending || !newComment.trim()}
                      className="vibe-button-primary px-8 py-3 gap-2"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {sending ? 'Yollanıyor...' : 'Gönder'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <div className="text-center py-12 bg-primary/5 rounded-3xl border border-dashed border-primary/20 mt-12">
                <p className="text-muted-foreground font-bold mb-6">Topluluğa sesini duyurmak için giriş yapmalısın.</p>
                <Link href="/auth" className="vibe-button-primary">Giriş Yap</Link>
              </div>
            )}
          </div>
        </article>
      </main>
      <AccessibilityToolbar />
      <Footer />
    </div>
  );
}
