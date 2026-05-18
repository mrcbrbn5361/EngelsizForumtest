'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, MessageSquare, Sparkles, Loader2, Heart, Shield, Globe, Users, User, ChevronRight, Plus, Lock, Trash2, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: true });
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { cn } from '@/lib/utils';

export default function DiscussionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isStaff } = useRole();
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const fetchLikeStatus = useCallback(async () => {
    if (!user || !id) return;
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('id')
        .eq('topic_id', id)
        .eq('user_id', user.id)
        .maybeSingle(); // maybeSingle results in null if not found, instead of error
      
      if (data) setIsLiked(true);
      else setIsLiked(false);
    } catch (err) {
      console.error('Error fetching like status:', err);
    }
  }, [id, user]);

  useEffect(() => {
    if (topic) {
      setLikesCount(topic.likes_count || 0);
      fetchLikeStatus();
    }
  }, [topic, fetchLikeStatus]);

  const handleToggleLike = async () => {
    if (!user) {
      alert('Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('topic_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('reactions')
          .insert({
            topic_id: id,
            user_id: user.id,
            reaction_type: 'like'
          });
        
        if (error) throw error;
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err: any) {
      alert('İşlem başarısız: ' + err.message);
    }
  };

  const deleteTopic = async () => {
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) alert('Silme işlemi başarısız: ' + error.message);
    else router.push('/discussions');
  };

  const togglePin = async () => {
    if (!topic) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_pinned: !topic.is_pinned })
      .eq('id', id);
    if (error) alert('Hata: ' + error.message);
    else setTopic({ ...topic, is_pinned: !topic.is_pinned });
  };

  const toggleLock = async () => {
    if (!topic) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_locked: !topic.is_locked })
      .eq('id', id);
    if (error) alert('Hata: ' + error.message);
    else setTopic({ ...topic, is_locked: !topic.is_locked });
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) alert('Silme işlemi başarısız: ' + error.message);
    else setComments(comments.filter(c => c.id !== commentId));
  };

  const fetchTopic = useCallback(async () => {
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

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
    const isSupabaseConfigured = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

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

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || sending) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          topic_id: id,
          author_id: user.id,
          content: newComment.trim()
        })
        .select('*, author:profiles(*)')
        .single();

      if (error) throw error;
      setComments([...comments, data]);
      setNewComment('');
    } catch (err: any) {
      alert('Yorum gönderilemedi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSummarize = async () => {
    if (!topic || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert('AI Özeti için API anahtarı ayarlanmamış.');
      return;
    }
    
    setIsSummarizing(true);
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Lütfen aşağıdaki forum başlığını ve içeriğini kısa ve öz bir şekilde (maksimum 4 cümle) Türkçe özetle:\n\nBaşlık: ${topic.title}\nİçerik: ${topic.content}`
      });
      
      setSummary(result.text || "Özet oluşturulamadı.");
    } catch (err) {
      console.error('Summarization failed:', err);
      alert('Özet oluşturulurken bir hata oluştu.');
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="animate-spin text-primary" size={64} />
          <p className="font-black text-muted-foreground text-sm uppercase tracking-widest">Tartışma Yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!topic) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <h1 className="text-3xl md:text-5xl font-black mb-6 tracking-tighter">Tartışma Bulunamadı</h1>
          <button onClick={() => router.push('/discussions')} className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-lg">Geri Dön</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {topic && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DiscussionForumPosting",
              "headline": topic.title,
              "articleBody": topic.content,
              "author": {
                "@type": "Person",
                "name": topic.author?.full_name || topic.author?.username || 'Kullanıcı'
              },
              "datePublished": topic.created_at,
              "commentCount": comments.length,
              "comment": comments.map(c => ({
                "@type": "Comment",
                "text": c.content,
                "author": {
                  "@type": "Person",
                  "name": c.author?.full_name || c.author?.username || 'Kullanıcı'
                },
                "dateCreated": c.created_at
              }))
            })
          }}
        />
      )}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest px-2"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </button>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 md:gap-12">
          {/* Main Content */}
          <div className="space-y-12 min-w-0">
            <article className="bg-card p-6 md:p-12 rounded-[2.5rem] border border-border shadow-sm">
              <header className="mb-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                      {topic.category?.name || 'Genel'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Users size={14} className="text-primary" /> {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <Globe size={14} className="text-primary" /> {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  {isStaff && (
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={togglePin} 
                        className={`p-2 rounded-xl transition-all ${topic.is_pinned ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={topic.is_pinned ? "İğnelemeyi Kaldır" : "İğnele"}
                      >
                        <Pin size={18} />
                      </button>
                      <button 
                        onClick={toggleLock} 
                        className={`p-2 rounded-xl transition-all ${topic.is_locked ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={topic.is_locked ? "Kilidi Aç" : "Kilitle"}
                      >
                        <Lock size={18} />
                      </button>
                      <button onClick={deleteTopic} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-all" title="Sil">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-tight break-words">{topic.title}</h1>
              </header>

              <div className="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-muted-foreground">
                <ReactMarkdown>{topic.content}</ReactMarkdown>
              </div>

              <div className="mt-12 pt-8 border-t border-border/50 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleToggleLike}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/20",
                      isLiked 
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                        : "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                    )}
                  >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
                    {likesCount > 0 && <span className="mr-1">{likesCount}</span>}
                    {isLiked ? 'BEĞENDİN' : 'BEĞEN'}
                  </button>
                  <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSummarizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} AI Özetle
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-8 p-8 md:p-10 bg-primary/5 border-2 border-primary/10 rounded-[2rem] relative overflow-hidden ring-4 ring-primary/5"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3 text-primary font-black text-sm uppercase tracking-widest">
                        <Sparkles size={20} /> AI ÖZETİ
                      </div>
                      <button onClick={() => setSummary(null)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Plus size={24} className="rotate-45" />
                      </button>
                    </div>
                    <p className="text-lg md:text-xl font-bold italic text-foreground leading-relaxed">&ldquo;{summary}&rdquo;</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>

            {/* Comments Section */}
            <section className="space-y-10">
              <h2 className="text-2xl md:text-4xl font-black px-4 flex items-center gap-4 tracking-tighter text-foreground">
                <MessageSquare size={32} className="text-primary" /> Yanıtlar 
                <span className="text-primary/30">{comments.length}</span>
              </h2>

              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card p-6 md:p-10 rounded-[2rem] border border-border flex gap-4 md:gap-8 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground transition-colors">
                          <User size={24} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <span className="text-primary flex items-center gap-1.5">
                              {comment.author?.full_name || comment.author?.username || 'Kullanıcı'}
                              {(comment.author?.role === 'admin' || comment.author?.role === 'moderator') && (
                                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center gap-1 leading-none">
                                  <Shield size={8} /> {comment.author.role}
                                </span>
                              )}
                            </span>
                            <span>•</span>
                            <span>{new Date(comment.created_at!).toLocaleDateString('tr-TR')}</span>
                          </div>
                          {isStaff && (
                            <button onClick={() => deleteComment(comment.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                          )}
                        </div>
                        <div className="text-base md:text-lg font-medium leading-relaxed break-words text-foreground/90">
                          <ReactMarkdown>{comment.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border px-8">
                    <MessageSquare size={64} className="mx-auto text-muted-foreground/10 mb-6" />
                    <p className="text-xl font-black text-muted-foreground/30 uppercase tracking-widest">Henüz yanıt yok.</p>
                  </div>
                )}
              </div>

              {user ? (
                topic.is_locked && !isStaff ? (
                  <div className="p-10 bg-orange-500/5 border-2 border-dashed border-orange-500/30 rounded-[2.5rem] text-center mt-12">
                    <Lock size={48} className="mx-auto text-orange-500/20 mb-6" />
                    <p className="text-xl font-black text-orange-500 uppercase tracking-widest mb-2 px-4">Bu Tartışma Kilitlendi</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8 px-4">Artık yeni yanıt kabul edilmemektedir.</p>
                  </div>
                ) : (
                  <form 
                    onSubmit={handlePostComment}
                    className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden mt-12"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary/20" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">{topic.is_locked ? 'ADMİN PANELİ: KİLİTLİ BAŞLIĞA YANIT YAZ' : 'YENİ YANIT GÖNDER'}</p>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Bir şeyler yazın..."
                      className="w-full min-h-[180px] p-8 rounded-[1.5rem] bg-muted/30 border border-border focus:border-primary focus:bg-background outline-none transition-all text-lg font-medium resize-none mb-6"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sending}
                        className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                      >
                        {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />} {sending ? 'Gönderiliyor...' : 'Gönder'}
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="p-10 bg-muted/10 border-2 border-dashed border-border rounded-[2.5rem] text-center mt-12">
                  <Lock size={48} className="mx-auto text-muted-foreground/20 mb-6" />
                  <p className="text-xl font-black text-muted-foreground uppercase tracking-widest mb-8 px-4">Yorum yapmak için giriş yapmalısınız.</p>
                  <Link 
                    href="/auth"
                    className="inline-block px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-lg shadow-lg"
                  >
                    Giriş Yap
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <section className="bg-card p-8 rounded-[2rem] border border-border shadow-sm">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-8">Kategori Detayları</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Grup</p>
                    <p className="text-lg font-black truncate text-foreground">{topic.category?.name || 'Genel'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Durum</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1.5"><Shield size={14} /> AKTİF</span>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Görünürlük</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5"><Globe size={14} /> HERKESE AÇIK</span>
                </div>
              </div>
            </section>

            <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">AI ASİSTAN</h3>
                <p className="text-lg font-bold mb-8 leading-tight tracking-tight">Kısa bir özet mi lazım? AI teknolojimiz emrinizde.</p>
                <button 
                   onClick={handleSummarize}
                   disabled={isSummarizing}
                   className="w-full py-4 bg-white text-primary rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all shadow-lg"
                >
                  {isSummarizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} ŞİMDİ ÖZETLE
                </button>
              </div>
            </div>

            <section className="bg-card p-8 rounded-[2rem] border border-border">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 px-2">Benzer Başlıklar</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group p-4 rounded-xl hover:bg-muted/50 transition-all">
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 tracking-tight">Erişilebilirlik hakkında genel sorular ve cevaplar...</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      KEŞFET <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
