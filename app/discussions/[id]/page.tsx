'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AccessibilityToolbar } from '@/components/ui/accessibility-toolbar';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, User, Calendar, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
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
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-6 md:py-8 max-w-4xl">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> Geri Dön
        </button>
        <article className="bg-card border-4 border-border rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 shadow-2xl mb-12 overflow-hidden relative">
          <header className="mb-10 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                {topic.category?.name || 'Genel'}
              </span>
            </div>
            <h1 className="text-3xl md:text-6xl font-black mb-8 md:mb-12 tracking-tighter leading-[1.1]">{topic.title}</h1>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 border-y border-border py-8">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-[1.5rem] bg-muted flex items-center justify-center overflow-hidden border-2 border-border shadow-xl shrink-0">
                  {topic.author?.avatar_url ? (
                    <Image 
                      src={topic.author.avatar_url} 
                      alt={topic.author.username || ''} 
                      width={64}
                      height={64}
                      unoptimized
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={24} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black text-xl md:text-2xl leading-none mb-2 truncate">{topic.author?.username || 'Anonim'}</span>
                  <span className="flex items-center gap-2 text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                    <Calendar size={14} /> {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="group flex-shrink-0 flex items-center justify-center gap-3 text-sm md:text-lg font-black text-primary bg-primary/5 hover:bg-primary/10 px-8 py-4 md:py-5 rounded-full transition-all border-2 border-primary/10 shadow-lg hover:shadow-primary/5 active:scale-95 uppercase tracking-widest"
              >
                <Sparkles size={20} className={isSummarizing ? "animate-spin" : "group-hover:rotate-12 transition-transform"} /> 
                {isSummarizing ? 'Özetleniyor...' : 'AI Özetle'}
              </button>
            </div>
          </header>

          <AnimatePresence>
            {summary && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-12 p-8 md:p-12 bg-primary/5 border-2 border-primary/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-inner relative"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
                  <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em]">Yapay Zeka Erişilebilirlik Özeti</h3>
                </div>
                <p className="text-lg md:text-2xl font-bold leading-relaxed text-foreground italic decoration-primary/20 underline-offset-8">
                  &ldquo;{summary}&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="prose prose-slate dark:prose-invert max-w-none mb-16 md:mb-24 leading-loose md:text-xl font-medium text-foreground/90">
             {topic.content ? (
               <ReactMarkdown>{topic.content}</ReactMarkdown>
             ) : (
               <p className="text-muted-foreground italic">İçerik yüklenemedi.</p>
             )}
          </div>

          <div className="border-t-4 border-muted pt-12 md:pt-20 space-y-12">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h2 className="text-2xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <MessageSquare size={32} className="text-primary md:size-12" /> Yanıtlar 
                <span className="text-primary opacity-30">{comments.length}</span>
              </h2>
            </div>

            <div className="space-y-10 md:space-y-16">
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 md:gap-8 group"
                >
                  <div className="h-10 w-10 md:h-16 md:w-16 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative border-2 border-border group-hover:rotate-3 transition-transform shadow-sm">
                    {comment.author?.avatar_url ? (
                      <Image 
                        src={comment.author.avatar_url} 
                        alt={comment.author.username || ''} 
                        fill
                        className="object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User size={20} className="md:size-8" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="font-black text-sm md:text-xl truncate">{comment.author?.username || 'Anonim'}</span>
                      <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50 bg-muted px-2 py-0.5 rounded">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-muted/30 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] text-sm md:text-lg leading-relaxed font-medium break-words border-2 border-transparent hover:border-primary/5 transition-colors">
                      {comment.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed border-border/50">
                  <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4 opacity-10" />
                  <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Henüz Yanıt Yok</p>
                </div>
              )}
            </div>

            {user ? (
              <form onSubmit={handleSendMessage} className="bg-card p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-4 border-primary shadow-2xl relative mt-20 group">
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-6 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest -translate-y-full rounded-t-2xl">
                  Fikrini Paylaş
                </div>
                <div className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Eşit ve erişilebilir bir gelecek için tartışmaya katıl..."
                    disabled={sending}
                    className="w-full py-4 text-base md:text-2xl font-bold bg-transparent min-h-[150px] md:min-h-[250px] outline-none focus:ring-0 placeholder:text-muted-foreground/30 resize-none disabled:opacity-50"
                  />
                  <div className="flex justify-end mt-6">
                    <button 
                      type="submit"
                      disabled={sending || !newComment.trim()}
                      className="group flex items-center justify-center gap-4 bg-primary text-primary-foreground px-10 py-5 rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-1 transition-all disabled:opacity-50 active:scale-95 text-lg font-black"
                    >
                      {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                      {sending ? 'Yollanıyor...' : 'Gönder'}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-20 bg-primary/5 rounded-[4rem] border-4 border-dashed border-primary/20 mt-20">
                <h3 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">Tartışmaya Katılın</h3>
                <p className="text-muted-foreground font-bold mb-10 max-w-md mx-auto">Topluluğumuza sesini duyurmak için giriş yapmalısın.</p>
                <button 
                  onClick={() => router.push('/auth')}
                  className="bg-primary text-primary-foreground px-12 py-5 rounded-full font-black text-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
                >
                  Giriş Yap
                </button>
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
