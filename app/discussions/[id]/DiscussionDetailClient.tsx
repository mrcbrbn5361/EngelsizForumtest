'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ThumbsUp, Quote, Flag, MessageSquare, ExternalLink, ShieldCheck, 
  CheckCircle2, Pin, Trash2, Edit2, Plus, ChevronRight, Home, Award, 
  Sparkles, Clock, Send, Loader2, Star, CheckSquare, Heart
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserRoleBadge } from '@/components/ui/user-badge';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string | null;
  role: 'admin' | 'moderator' | 'user';
  level: number;
  xp: number;
  full_name: string | null;
  bio: string | null;
}

interface CommentData {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  is_solution: boolean;
  created_at: string;
  likes_count?: number;
  author?: ProfileData;
}

interface TopicData {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_solved?: boolean;
  created_at: string;
  author?: ProfileData;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface DiscussionDetailClientProps {
  initialTopic: TopicData;
  initialComments: CommentData[];
}

export default function DiscussionDetailClient({ initialTopic, initialComments }: DiscussionDetailClientProps) {
  const { user, profile } = useAuth();
  const [topic, setTopic] = useState<TopicData>(initialTopic);
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedTopic, setLikedTopic] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [commentLikesCounts, setCommentLikesCounts] = useState<Record<string, number>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  // Load user likes status and additional comments likes meta
  useEffect(() => {
    if (!user) return;
    const userId = user.id;

    // Check if user liked the main topic
    async function checkTopicLike() {
      const { data, error } = await supabase
        .from('reactions')
        .select('*')
        .eq('user_id', userId)
        .eq('topic_id', topic.id)
        .maybeSingle();

      if (!error && data) {
        setLikedTopic(true);
      }
    }

    checkTopicLike();

    // Increment view count securely once on mount
    async function incrementViews() {
      try {
        const { error } = await supabase.rpc('increment_topic_views', { topic_row_id: topic.id });
        if (error) {
          // Fallback update if RPC fails
          await supabase
            .from('topics')
            .update({ views_count: (topic.views_count || 0) + 1 })
            .eq('id', topic.id);
        }
      } catch (e) {
        // Fallback update if RPC does not exist
        await supabase
          .from('topics')
          .update({ views_count: (topic.views_count || 0) + 1 })
          .eq('id', topic.id);
      }
      
      setTopic(prev => ({ ...prev, views_count: (prev.views_count || 0) + 1 }));
    }

    incrementViews();
  }, [user, topic.id]);

  // Handle Like Topic
  const handleLikeTopic = async () => {
    if (!user) {
      alert('Beğenmek için lütfen giriş yapın.');
      return;
    }

    try {
      if (likedTopic) {
        // Unlike
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('topic_id', topic.id);

        if (error) throw error;

        // Decrement in database
        await supabase
          .from('topics')
          .update({ likes_count: Math.max(0, (topic.likes_count || 0) - 1) })
          .eq('id', topic.id);

        setTopic(prev => ({ ...prev, likes_count: Math.max(0, (prev.likes_count || 0) - 1) }));
        setLikedTopic(false);
      } else {
        // Like
        const { error } = await supabase
          .from('reactions')
          .insert([{
            user_id: user.id,
            topic_id: topic.id,
            reaction_type: 'like'
          }]);

        if (error) throw error;

        // Increment in database
        await supabase
          .from('topics')
          .update({ likes_count: (topic.likes_count || 0) + 1 })
          .eq('id', topic.id);

        setTopic(prev => ({ ...prev, likes_count: (prev.likes_count || 0) + 1 }));
        setLikedTopic(true);

        // Send push notification to topic author
        if (topic.author_id !== user.id) {
          await supabase.from('notifications').insert([{
            recipient_id: topic.author_id,
            sender_id: user.id,
            type: 'like',
            title: 'Konunuz beğenildi!',
            body: `${profile?.full_name || profile?.username || 'Bir üye'} "${topic.title}" konunuzu beğendi.`,
            is_read: false,
            created_at: new Date().toISOString()
          }]);
        }
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Handle Quick Reply submit
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Cevap yazmak için lütfen giriş yapın.');
      return;
    }
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const newCommentRow = {
        topic_id: topic.id,
        author_id: user.id,
        content: replyContent.trim(),
        is_solution: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([newCommentRow])
        .select(`
          *,
          author:profiles(id, username, avatar_url, role, level, xp)
        `)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setComments(prev => [...prev, data as CommentData]);
        setReplyContent('');

        // Increment comments count on topic
        await supabase
          .from('topics')
          .update({ comments_count: (topic.comments_count || 0) + 1 })
          .eq('id', topic.id);

        setTopic(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));

        // Award XP to replier securely
        if (profile) {
          const addedXp = 15;
          const currentXp = (profile.xp || 0) + addedXp;
          const currentLevel = profile.level || 1;
          const threshold = currentLevel * 100;
          let newXp = currentXp;
          let newLevel = currentLevel;

          if (currentXp >= threshold) {
            newLevel += 1;
            newXp = currentXp - threshold;
          }

          await supabase
            .from('profiles')
            .update({ xp: newXp, level: newLevel })
            .eq('id', user.id);
        }

        // Notify topic author
        if (topic.author_id !== user.id) {
          await supabase.from('notifications').insert([{
            recipient_id: topic.author_id,
            sender_id: user.id,
            type: 'comment',
            title: 'Yeni cevap yazıldı!',
            body: `${profile?.full_name || profile?.username || 'Bir üye'} "${topic.title}" konunuza cevap yazdı.`,
            is_read: false,
            created_at: new Date().toISOString()
          }]);
        }
      }
    } catch (err) {
      console.error('Failed to submit reply:', err);
      alert('Cevabınız iletilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quote post content
  const handleQuote = (authorName: string, quoteText: string) => {
    const formattedQuote = `[QUOTE="${authorName}"]${quoteText}[/QUOTE]\n`;
    setReplyContent(prev => prev + formattedQuote);
    if (replyInputRef.current) {
      replyInputRef.current.focus();
      replyInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Mark Comment as Solution
  const handleToggleSolution = async (commentId: string, currentStatus: boolean) => {
    // Only author or admin/moderator can mark solution
    const canManage = user?.id === topic.author_id || profile?.role === 'admin' || profile?.role === 'moderator';
    if (!canManage) return;

    try {
      // Toggle solution in comments table
      const { error: commentError } = await supabase
        .from('comments')
        .update({ is_solution: !currentStatus })
        .eq('id', commentId);

      if (commentError) throw commentError;

      // Update topic solved flag
      const anyOtherSolved = comments.some(c => c.id !== commentId && c.is_solution);
      const isTopicSolved = !currentStatus || anyOtherSolved;

      const { error: topicError } = await supabase
        .from('topics')
        .update({ is_solved: isTopicSolved })
        .eq('id', topic.id);

      if (topicError) throw topicError;

      // Update local state
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_solution: !currentStatus } : c));
      setTopic(prev => ({ ...prev, is_solved: isTopicSolved }));
    } catch (err) {
      console.error('Toggle solution error:', err);
    }
  };

  // Render Role with color mapping
  const mapRole = (role: string): 'YÖNETİCİ' | 'MODERATÖR' | 'UZMAN' | 'ÜYE' => {
    if (role === 'admin') return 'YÖNETİCİ';
    if (role === 'moderator') return 'MODERATÖR';
    if (role === 'uzman') return 'UZMAN';
    return 'ÜYE';
  };

  const roleColors = {
    'YÖNETİCİ': 'bg-red-500/10 text-red-400 border border-red-500/20 font-black',
    'MODERATÖR': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black',
    'UZMAN': 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-black',
    'ÜYE': 'bg-slate-800 text-slate-300 border border-white/[0.08]'
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-[#0b0f19] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 border border-white/[0.08] rounded-sm mb-4">
        <Link href="/" className="hover:text-sky-400 flex items-center gap-1">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-sky-400">Forumlar</Link>
        {topic.category && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/discussions?kategori=${topic.category.slug}`} className="hover:text-sky-400">{topic.category.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
      </div>

      {/* Thread Header */}
      <div className="mb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 mb-1 leading-snug break-words flex items-center flex-wrap gap-2">
          {topic.is_pinned && (
            <span className="bg-sky-500/15 text-sky-400 border border-sky-500/30 text-[10px] px-2 py-0.5 rounded-sm uppercase font-black tracking-wider flex items-center gap-1">
              <Pin size={10} className="fill-current" /> Sabit
            </span>
          )}
          {topic.is_solved && (
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-sm uppercase font-black tracking-wider flex items-center gap-1">
              <CheckCircle2 size={10} /> ÇÖZÜLDÜ
            </span>
          )}
          <span className="text-slate-100">{topic.title}</span>
        </h1>
        <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-slate-400 flex-wrap">
          <span>Konuyu başlatan: <span className="text-sky-400 font-semibold">@{topic.author?.username || 'Anonim'}</span></span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
          <span>•</span>
          <span className="font-mono text-slate-500">Okunma: {topic.views_count || 1}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Feed Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Main OP Post */}
          <article className="xf-post rounded-sm overflow-hidden flex flex-col md:flex-row border border-white/[0.08]">
            {/* Mobile Author Info */}
            <div className="md:hidden bg-[#0b0f19] border-b border-white/[0.08] p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  src={topic.author?.avatar_url}
                  username={topic.author?.username}
                  name={topic.author?.full_name}
                  size="sm"
                />
                <div className="flex flex-col">
                  <Link href={`/profile/${topic.author?.username || topic.author_id}`} className="font-bold text-sky-400 hover:underline text-xs">
                    {topic.author?.full_name || topic.author?.username || 'Anonim'}
                  </Link>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold w-fit ${roleColors[mapRole(topic.author?.role || 'user')]}`}>
                    {mapRole(topic.author?.role || 'user')}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400">#1</div>
            </div>

            {/* Desktop Author Column */}
            <div className="xf-post-author hidden md:flex flex-col items-center bg-[#0b0f19]/80 shrink-0 w-44 p-4 border-r border-white/[0.04]">
              <Link href={`/profile/${topic.author?.username || topic.author_id}`} className="font-extrabold text-sky-400 hover:text-sky-300 text-sm hover:underline mb-2 truncate max-w-full">
                @{topic.author?.username || 'Anonim'}
              </Link>
              <UserAvatar 
                src={topic.author?.avatar_url}
                username={topic.author?.username}
                name={topic.author?.full_name}
                size="lg"
                className="mb-3"
              />
              <div className={`text-[10px] px-2.5 py-1 rounded-sm font-black uppercase tracking-wider w-full text-center mb-3 ${roleColors[mapRole(topic.author?.role || 'user')]}`}>
                {mapRole(topic.author?.role || 'user')}
              </div>
              <div className="w-full flex flex-col gap-1.5 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>Seviye:</span>
                  <span className="font-bold text-sky-400">{topic.author?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Puan:</span>
                  <span className="font-mono font-bold text-slate-200">{topic.author?.xp || 10} XP</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="xf-post-content flex-1 p-4 sm:p-5 flex flex-col bg-[#111726]/40">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-white/[0.05] text-[11px] text-slate-400">
                <time>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</time>
                <span className="font-mono text-slate-500 font-bold">#1</span>
              </div>

              <div className="xf-post-body leading-relaxed text-slate-200 text-xs sm:text-sm whitespace-pre-wrap flex-1 min-h-[100px]">
                {topic.content}
              </div>

              <div className="mt-6 pt-4 flex items-center justify-between border-t border-white/[0.04]">
                <button 
                  onClick={handleLikeTopic}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm transition-all ${
                    likedTopic 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'text-slate-400 hover:text-rose-400 hover:bg-white/[0.02]'
                  }`}
                >
                  <Heart size={14} className={likedTopic ? 'fill-current scale-110' : ''} />
                  Beğen {topic.likes_count > 0 && `(${topic.likes_count})`}
                </button>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleQuote(topic.author?.username || 'Anonim', topic.content)}
                    className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:bg-sky-400/10 px-2.5 py-1.5 rounded-sm transition-colors"
                  >
                    <Quote size={13} />
                    Alıntı Yap
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Solution & Comments Section */}
          <div className="space-y-3">
            {comments.map((comment, index) => {
              const isCommentAuthorOp = comment.author_id === topic.author_id;
              const isOpOrAdmin = user?.id === topic.author_id || profile?.role === 'admin' || profile?.role === 'moderator';

              return (
                <article 
                  key={comment.id}
                  id={`comment-${comment.id}`}
                  className={`xf-post rounded-sm overflow-hidden flex flex-col md:flex-row border transition-all ${
                    comment.is_solution 
                      ? 'border-emerald-500/50 bg-emerald-500/5 shadow-md' 
                      : 'border-white/[0.08]'
                  }`}
                >
                  {/* Mobile View Author Bar */}
                  <div className="md:hidden bg-[#0b0f19] border-b border-white/[0.08] p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={comment.author?.avatar_url}
                        username={comment.author?.username}
                        name={comment.author?.full_name}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${comment.author?.username || comment.author_id}`} className="font-bold text-sky-400 hover:underline text-xs">
                            {comment.author?.full_name || comment.author?.username || 'Anonim'}
                          </Link>
                          {isCommentAuthorOp && (
                            <span className="text-[8px] bg-sky-500/10 text-sky-400 px-1 rounded-sm font-bold uppercase">OP</span>
                          )}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold w-fit ${roleColors[mapRole(comment.author?.role || 'user')]}`}>
                          {mapRole(comment.author?.role || 'user')}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">#{index + 2}</div>
                  </div>

                  {/* Desktop view Author Column */}
                  <div className="xf-post-author hidden md:flex flex-col items-center bg-[#0b0f19]/80 shrink-0 w-44 p-4 border-r border-white/[0.04]">
                    <div className="flex flex-col items-center max-w-full">
                      <Link href={`/profile/${comment.author?.username || comment.author_id}`} className="font-extrabold text-sky-400 hover:text-sky-300 text-sm hover:underline mb-1 truncate max-w-full">
                        @{comment.author?.username || 'Anonim'}
                      </Link>
                      {isCommentAuthorOp && (
                        <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 rounded-sm font-black uppercase mb-2">Konu Sahibi</span>
                      )}
                    </div>
                    
                    <UserAvatar 
                      src={comment.author?.avatar_url}
                      username={comment.author?.username}
                      name={comment.author?.full_name}
                      size="lg"
                      className="mb-3"
                    />
                    
                    <div className={`text-[10px] px-2.5 py-1 rounded-sm font-black uppercase tracking-wider w-full text-center mb-3 ${roleColors[mapRole(comment.author?.role || 'user')]}`}>
                      {mapRole(comment.author?.role || 'user')}
                    </div>
                    
                    <div className="w-full flex flex-col gap-1.5 text-[11px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Seviye:</span>
                        <span className="font-bold text-sky-400">{comment.author?.level || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Puan:</span>
                        <span className="font-mono font-bold text-slate-200">{comment.author?.xp || 10} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="xf-post-content flex-1 p-4 sm:p-5 flex flex-col bg-[#111726]/40">
                    <div className="flex items-center justify-between pb-2 mb-4 border-b border-white/[0.05] text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <time>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}</time>
                        {comment.is_solution && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-sm">
                            <CheckCircle2 size={10} /> EN İYİ CEVAP / ÇÖZÜM
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-500 font-bold">#{index + 2}</span>
                    </div>

                    <div className="xf-post-body leading-relaxed text-slate-200 text-xs sm:text-sm whitespace-pre-wrap flex-1 min-h-[80px]">
                      {comment.content}
                    </div>

                    <div className="mt-6 pt-4 flex items-center justify-between border-t border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        {isOpOrAdmin && (
                          <button 
                            onClick={() => handleToggleSolution(comment.id, comment.is_solution)}
                            className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-sm transition-all border ${
                              comment.is_solution 
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                                : 'bg-slate-900 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-slate-500'
                            }`}
                          >
                            <CheckSquare size={12} />
                            {comment.is_solution ? 'Çözümü İptal Et' : 'Çözüm Olarak İşaretle'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleQuote(comment.author?.username || 'Anonim', comment.content)}
                          className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:bg-sky-400/10 px-2.5 py-1.5 rounded-sm transition-colors"
                        >
                          <Quote size={13} />
                          Cevapla
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Quick Reply Form */}
          <div className="xf-block border border-white/[0.08] rounded-sm shadow-xs mt-6">
            <div className="xf-block-header bg-[#111726] border-b border-white/[0.08] text-slate-200 font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">Hızlı Cevap Yaz</div>
            <div className="p-4 bg-[#111726]/40">
              {user ? (
                <form onSubmit={handleReplySubmit}>
                  <textarea 
                    ref={replyInputRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full bg-[#111726]/40 border border-white/[0.08] rounded p-3 min-h-[140px] text-xs sm:text-sm focus:outline-none focus:border-sky-500 text-slate-200 placeholder:text-slate-500 mb-3 leading-relaxed"
                    placeholder="Yardımcı veya açıklayıcı bir cevap yazın..."
                    disabled={submitting}
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={submitting || !replyContent.trim()}
                      className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 px-6 h-10 rounded-sm text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          Mesajı Gönder
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-400 text-xs sm:text-sm mb-3">Bu konuya cevap yazabilmek için üye girişi yapmanız gerekmektedir.</p>
                  <Link href="/login" className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-5 py-2.5 rounded-sm text-xs font-bold uppercase transition-colors inline-block">
                    Giriş Yap / Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Breadcrumbs */}
          <div className="bg-[#0b0f19] px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-400 border border-white/[0.08] rounded-sm mt-4">
            <Link href="/" className="hover:text-sky-400 flex items-center gap-1">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/" className="hover:text-sky-400">Forumlar</Link>
            {topic.category && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/discussions?kategori=${topic.category.slug}`} className="hover:text-sky-400">{topic.category.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
          </div>

        </div>

        {/* Sidebar Component */}
        <ClassicSidebar />
      </div>
    </div>
  );
}
