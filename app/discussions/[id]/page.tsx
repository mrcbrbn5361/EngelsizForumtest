'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
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
        <article className="bg-card border border-border rounded-2xl sm:rounded-3xl p-5 md:p-8 shadow-sm mb-8 overflow-hidden">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-6 break-words tracking-tight">{topic.title}</h1>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                {topic.author?.avatar_url ? (
                   <Image 
                     src={topic.author.avatar_url} 
                     alt={topic.author.username || ''} 
                     width={40}
                     height={40}
                     unoptimized
                     className="h-full w-full object-cover" 
                     referrerPolicy="no-referrer"
                   />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground leading-none mb-1 text-sm sm:text-base truncate">{topic.author?.username || 'Anonim'}</span>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs opacity-70"><Calendar size={10} /> {new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
              </div>
            </div>
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-primary bg-primary/10 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-primary/20 transition-all border border-primary/10 shadow-sm active:scale-95"
            >
              <Sparkles size={14} className={isSummarizing ? "animate-pulse" : ""} /> {isSummarizing ? 'Özetleniyor...' : 'AI Özetle'}
            </button>
          </div>
          <AnimatePresence>
            {summary && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                className="mb-8 p-5 bg-primary/5 border border-primary/10 rounded-2xl overflow-hidden shadow-inner"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Yapay Zeka Özeti</h3>
                </div>
                <p className="text-sm md:text-base italic leading-relaxed text-foreground/80">{summary}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="prose prose-slate dark:prose-invert max-w-none mb-12 break-words">
            <div className="markdown-body prose max-w-none dark:prose-invert overflow-x-hidden min-h-[100px]">
               {topic.content ? (
                 <ReactMarkdown>{topic.content}</ReactMarkdown>
               ) : (
                 <p className="text-muted-foreground italic">İçerik yok.</p>
               )}
            </div>
          </div>

          <div className="border-t border-border pt-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" /> Yanıtlar ({comments.length})
              </h2>
            </div>

            <div className="space-y-6">
              {comments.map((comment) => (
                <motion.div 
                  key={comment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3 sm:gap-4"
                >
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {comment.author?.avatar_url ? (
                      <Image 
                        src={comment.author.avatar_url} 
                        alt={comment.author.username || ''} 
                        fill
                        className="object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{comment.author?.username || 'Anonim'}</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase opacity-70">
                        {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed break-words overflow-hidden">
                      {comment.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-10 text-muted-foreground italic">
                  Henüz yanıt yok. İlk yanıtı siz verin!
                </div>
              )}
            </div>

            {user ? (
              <form onSubmit={handleSendMessage} className="bg-muted/30 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-border mt-12">
                <h3 className="text-xs sm:text-sm font-bold mb-4">Cevap Yaz</h3>
                <div className="relative">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Düşüncelerinizi paylaşın..."
                    disabled={sending}
                    className="w-full p-4 rounded-xl sm:rounded-2xl border border-border bg-card min-h-[100px] sm:min-h-[120px] text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary transition-all resize-none disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={sending || !newComment.trim()}
                    className="absolute bottom-3 right-3 bg-primary text-primary-foreground p-2.5 sm:p-3 rounded-xl shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
                    aria-label="Gönder"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-3xl border border-dashed border-border mt-12">
                <p className="text-muted-foreground font-medium mb-4">Tartışmaya katılmak için giriş yapmalısınız.</p>
                <button 
                  onClick={() => router.push('/auth')}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold"
                >
                  Giriş Yap
                </button>
              </div>
            )}
          </div>
        </article>
      </main>
      <AccessibilityToolbar />
    </div>
  );
}
