'use client';
import Image from 'next/image';
import { toast } from 'sonner';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, MessageSquare, Sparkles, Loader2, Heart, Shield, Globe, Users, User, ChevronRight, Plus, Lock, Trash2, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { BionicMarkdown } from '@/components/ui/bionic-markdown';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: true });
const TextToSpeechControls = dynamic(
  () => import('@/components/ui/text-to-speech-controls').then(mod => mod.TextToSpeechControls),
  { ssr: false }
);
const VoiceInput = dynamic(
  () => import('@/components/ui/voice-input').then(mod => mod.VoiceInput),
  { ssr: false }
);
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { cn } from '@/lib/utils';

function CommentItem({ 
  comment, 
  allComments, 
  topicAuthorId, 
  isStaff, 
  onReply, 
  onDelete, 
  onMarkSolution,
  currentUserId,
  depth = 0
}: { 
  comment: Comment; 
  allComments: Comment[]; 
  topicAuthorId: string; 
  isStaff: boolean; 
  onReply: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkSolution: (id: string) => void;
  currentUserId?: string;
  depth?: number;
}) {
  const replies = allComments.filter(c => c.parent_id === comment.id);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "vibe-card p-6 md:p-8 flex gap-4 md:gap-8 hover:border-primary/30 transition-all group relative",
          comment.is_solution && "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10",
          depth > 0 && "ml-8 md:ml-16"
        )}
      >
        {comment.is_solution && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={10} /> EN İYİ ÇÖZÜM
          </div>
        )}

        <div className="flex-shrink-0">
          <div className={cn(
            "rounded-[1.5rem] bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground transition-all overflow-hidden border-2 border-transparent group-hover:border-primary/20 relative",
            depth > 0 ? "w-10 h-10 md:w-14 md:h-14" : "w-14 h-14 md:w-20 md:h-20"
          )}>
            {comment.author?.avatar_url ? (
              <img 
                src={comment.author.avatar_url} 
                alt="Profil" 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User size={depth > 0 ? 18 : 32} />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex-wrap">
              <span className="text-primary flex items-center gap-2">
                {comment.author?.full_name?.toUpperCase() || comment.author?.username?.toUpperCase() || 'KULLANICI'}
                {(comment.author?.role === 'admin' || comment.author?.role === 'moderator') && (
                  <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center gap-1 leading-none">
                    <Shield size={8} /> {comment.author.role.toUpperCase()}
                  </span>
                )}
                {comment.author?.id === topicAuthorId && (
                  <span className="px-2 py-0.5 rounded-full bg-muted text-foreground text-[8px] flex items-center gap-1 leading-none border border-border">
                    YAZAR
                  </span>
                )}
              </span>
              <span>•</span>
              <span>{new Date(comment.created_at!).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          <div className="text-sm md:text-base font-medium leading-relaxed break-words text-foreground/90">
            <BionicMarkdown content={comment.content} />
          </div>

          <div className="flex items-center gap-4 pt-2">
            {currentUserId && (
              <button 
                onClick={() => onReply(comment.id)}
                className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5"
              >
                <Plus size={14} /> Yanıtla
              </button>
            )}
            {currentUserId === topicAuthorId && !comment.is_solution && (
              <button 
                onClick={() => onMarkSolution(comment.id)}
                className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline flex items-center gap-1.5"
              >
                <Sparkles size={14} /> Çözüm Olarak İşaretle
              </button>
            )}
            {(isStaff || currentUserId === comment.author_id) && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Sil
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              allComments={allComments}
              topicAuthorId={topicAuthorId}
              isStaff={isStaff}
              onReply={onReply}
              onDelete={onDelete}
              onMarkSolution={onMarkSolution}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [replyToId, setReplyToId] = useState<string | null>(null);

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
      toast('Beğenmek için giriş yapmalısınız.');
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
      toast('İşlem başarısız: ' + err.message);
    }
  };

  const deleteTopic = async () => {
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('topics').delete().eq('id', id);
    if (error) toast('Silme işlemi başarısız: ' + error.message);
    else router.push('/discussions');
  };

  const togglePin = async () => {
    if (!topic) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_pinned: !topic.is_pinned })
      .eq('id', id);
    if (error) toast('Hata: ' + error.message);
    else setTopic({ ...topic, is_pinned: !topic.is_pinned });
  };

  const toggleLock = async () => {
    if (!topic) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_locked: !topic.is_locked })
      .eq('id', id);
    if (error) toast('Hata: ' + error.message);
    else setTopic({ ...topic, is_locked: !topic.is_locked });
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) toast('Silme işlemi başarısız: ' + error.message);
    else setComments(comments.filter(c => c.id !== commentId));
  };

  const handleMarkSolution = async (commentId: string) => {
    if (!topic || topic.author_id !== user?.id) return;

    try {
      // Unmark any previous solution
      await supabase
        .from('comments')
        .update({ is_solution: false })
        .eq('topic_id', id);

      const { error } = await supabase
        .from('comments')
        .update({ is_solution: true })
        .eq('id', commentId);

      if (error) throw error;

      await supabase
        .from('topics')
        .update({ is_solved: true })
        .eq('id', id);

      setComments(comments.map(c => ({
        ...c,
        is_solution: c.id === commentId
      })));
      setTopic({ ...topic, is_solved: true });
      toast('Çözüm olarak işaretlendi!');
    } catch (err: any) {
      toast('Hata: ' + err.message);
    }
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
          content: newComment.trim(),
          parent_id: replyToId
        })
        .select('*, author:profiles(*)')
        .single();

      if (error) throw error;
      setComments([...comments, data]);
      setNewComment('');
      setReplyToId(null);
    } catch (err: any) {
      toast('Yorum gönderilemedi: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleSummarize = async () => {
    if (!topic) return;
    
    setIsSummarizing(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: topic.title, 
          content: topic.content,
          type: 'topic_summary'
        }),
      });
      
      const data = await response.json();
      
      if (data.text) {
        setSummary(data.text);
      } else {
        throw new Error(data.error || 'Özet oluşturulamadı.');
      }
    } catch (err: any) {
      console.error('Summarization failed:', err);
      toast('Özet oluşturulurken bir hata oluştu: ' + err.message);
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
              "@graph": [
                {
                  "@type": "WebPage",
                  "@id": `https://engelsizforum.com/discussions/${id}#webpage`,
                  "url": `https://engelsizforum.com/discussions/${id}`,
                  "name": topic.title,
                  "description": topic.content?.substring(0, 150) || "EngelsizForum Tartışması",
                  "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Ana Sayfa",
                        "item": "https://engelsizforum.com"
                      },
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Tartışmalar",
                        "item": "https://engelsizforum.com/discussions"
                      },
                      {
                        "@type": "ListItem",
                        "position": 3,
                        "name": topic.title,
                        "item": `https://engelsizforum.com/discussions/${id}`
                      }
                    ]
                  }
                },
                {
                  "@type": "DiscussionForumPosting",
                  "@id": `https://engelsizforum.com/discussions/${id}#posting`,
                  "mainEntityOfPage": `https://engelsizforum.com/discussions/${id}#webpage`,
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
                }
              ]
            })
          }}
        />
      )}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-3 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-[0.2em] px-2"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> GERİ DÖN
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 md:gap-12">
          {/* Main Content */}
          <div className="space-y-16 min-w-0">
            <article className="vibe-card p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
              <header className="mb-12 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                      {topic.category?.name?.toUpperCase() || 'GENEL'}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-[0.2em]">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border relative">
                        {topic.author?.avatar_url ? (
                          <img 
                            src={topic.author.avatar_url} 
                            alt="Profil" 
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      {topic.author?.full_name?.toUpperCase() || topic.author?.username?.toUpperCase() || 'KULLANICI'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
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
                <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-tight break-words uppercase">{topic.title}</h1>
              </header>

              <TextToSpeechControls text={topic.content} title={topic.title} className="mb-10" />

              <div className="vibe-markdown-body prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-muted-foreground">
                <BionicMarkdown content={topic.content} />
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
            <section className="space-y-12">
              <h2 className="vibe-section-title px-4 flex items-center gap-6">
                <MessageSquare size={48} className="text-primary" /> Yanıtlar 
                <span className="text-primary/20">{comments.length}</span>
              </h2>

              <div className="space-y-8">
                {comments.length > 0 ? (
                  comments.filter(c => !c.parent_id).map((comment, index) => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      allComments={comments}
                      topicAuthorId={topic.author_id}
                      isStaff={isStaff}
                      onReply={(id) => {
                        setReplyToId(id);
                        document.querySelector('textarea')?.focus();
                      }}
                      onDelete={deleteComment}
                      onMarkSolution={handleMarkSolution}
                      currentUserId={user?.id}
                    />
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
                    className="vibe-card p-8 md:p-16 space-y-10 border-primary/20 shadow-2xl relative overflow-hidden mt-16"
                  >
                    <div className="absolute top-0 left-0 w-full h-3 bg-primary/20" />
                    <p className="vibe-label ml-0">
                      {replyToId 
                        ? `${comments.find(c => c.id === replyToId)?.author?.username} adlı kullanıcıya yanıt ver` 
                        : (topic.is_locked ? 'ADMİN PANELİ: KİLİTLİ BAŞLIĞA YANIT YAZ' : 'YENİ YANIT GÖNDER')}
                    </p>
                    {replyToId && (
                      <button 
                        type="button" 
                        onClick={() => setReplyToId(null)}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                      >
                        İPTAL ET
                      </button>
                    )}
                    <VoiceInput onTranscript={(text) => setNewComment(prev => prev ? `${prev} ${text}` : text)} label="Yanıtı Sesle Yaz" />
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyToId ? "Yanıtınızı buraya yazın..." : "Bir şeyler yazın..."}
                      className="vibe-input min-h-[220px] p-8 text-xl"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sending}
                        className="vibe-button-primary h-20 px-12 text-xl"
                      >
                        {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={28} />} {sending ? 'GÖNDERİLİYOR...' : (replyToId ? 'YANITLA' : 'GÖNDER')}
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
          <aside className="space-y-10">
            <section className="vibe-card p-8 md:p-10">
              <h3 className="vibe-label ml-0 mb-10">KATEGORİ DETAYLARI</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MessageSquare size={32} />
                  </div>
                  <div className="min-w-0">
                    <p className="vibe-label ml-0 mb-1">GRUP</p>
                    <p className="text-xl md:text-2xl font-black truncate text-foreground">{topic.category?.name?.toUpperCase() || 'GENEL'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 pt-4 border-t border-border">
                  <span className="vibe-label ml-0">DURUM</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] flex items-center gap-2"><Shield size={16} /> AKTİF</span>
                </div>
                <div className="flex items-center justify-between px-4">
                  <span className="vibe-label ml-0">GÖRÜNÜRLÜK</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Globe size={16} /> HERKESE AÇIK</span>
                </div>
              </div>
            </section>

            <div className="bg-primary p-10 rounded-[2.5rem] text-primary-foreground shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="vibe-label ml-0 mb-6 text-white/70">AI ASİSTAN</h3>
                <p className="text-xl md:text-2xl font-black mb-10 leading-tight tracking-tight">Kısa bir özet mi lazım? AI teknolojimiz emrinizde.</p>
                <button 
                   onClick={handleSummarize}
                   disabled={isSummarizing}
                   className="w-full h-16 bg-white text-primary rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/90 active:scale-95 transition-all shadow-xl"
                >
                  {isSummarizing ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />} ŞİMDİ ÖZETLE
                </button>
              </div>
            </div>

            <section className="vibe-card p-10">
              <h3 className="vibe-label ml-0 mb-8">BENZER BAŞLIKLAR</h3>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="group p-6 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border">
                    <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 tracking-tight">Erişilebilirlik hakkında genel sorular ve cevaplar...</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      KEŞFET <ChevronRight size={16} />
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