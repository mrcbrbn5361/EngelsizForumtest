'use client';
import Image from 'next/image';
import { toast } from 'sonner';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, MessageSquare, Sparkles, Loader2, Heart, Shield, Globe, Users, User, ChevronRight, Plus, Lock, Trash2, Pin, Bookmark, Check, Settings, Eye, Calendar, Search, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';

// Empty fallbacks for clean database-only mode
const FALLBACK_TOPICS_DETAILED: { [key: string]: { topic: any; comments: any[] } } = {};

function CommentItem({ 
  comment, 
  allComments, 
  topicAuthorId, 
  isStaff, 
  onReply, 
  onDelete, 
  onMarkSolution,
  currentUserId,
  depth = 0,
  onUpdate
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
  onUpdate: (id: string, content: string) => Promise<void>;
}) {
  const replies = allComments.filter(c => c.parent_id === comment.id);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      // toast is handled in parent
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 sm:p-5 rounded-2xl bg-card border border-border/80 transition-all group relative",
          comment.is_solution && "border-emerald-500/50 bg-emerald-500/[0.03] shadow-sm",
          depth > 0 && "ml-3 sm:ml-6 md:ml-8 border-l-2 border-l-sky-500/40"
        )}
      >
        {comment.is_solution && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} /> ÇÖZÜM OLARAK İŞARETLENDİ
          </div>
        )}

        <div className="flex gap-3 sm:gap-4">
          <div className="shrink-0">
            <Link href={`/profile/${comment.author?.id}`} className="block relative z-20">
              <UserAvatar 
                src={comment.author?.avatar_url}
                username={comment.author?.username}
                name={comment.author?.full_name}
                size={depth > 0 ? "sm" : "md"}
              />
            </Link>
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground flex-wrap">
                <Link href={`/profile/${comment.author?.id}`} className="hover:underline font-bold text-foreground relative z-20">
                  {comment.author?.full_name || comment.author?.username || 'Kullanıcı'}
                </Link>
                {(comment.author?.role === 'admin' || comment.author?.role === 'moderator') && (
                  <span className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-bold">
                    {comment.author.role.toUpperCase()}
                  </span>
                )}
                {comment.author?.id === topicAuthorId && (
                  <span className="px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[9px] font-bold border border-border">
                    YAZAR
                  </span>
                )}
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[10px] font-normal">{new Date(comment.created_at!).toLocaleDateString('tr-TR')}</span>
                {comment.updated_at !== comment.created_at && (
                  <span className="text-[10px] text-muted-foreground/60 italic">(düzenlendi)</span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background p-3 text-sm outline-none focus:border-sky-500 transition-colors min-h-[100px]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Kaydet
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3.5 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg font-bold text-xs cursor-pointer"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm font-normal leading-relaxed break-words text-foreground/90">
                <BionicMarkdown content={comment.content} />
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 text-[11px] font-bold">
              {!isEditing && (
                <>
                  {currentUserId && (
                    <button 
                      onClick={() => onReply(comment.id)}
                      className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Yanıtla
                    </button>
                  )}
                  {(isStaff || currentUserId === comment.author_id) && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings size={13} /> Düzenle
                    </button>
                  )}
                  {currentUserId === topicAuthorId && !comment.is_solution && (
                    <button 
                      onClick={() => onMarkSolution(comment.id)}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={13} /> Çözüm Olarak İşaretle
                    </button>
                  )}
                  {(isStaff || currentUserId === comment.author_id) && (
                    <button 
                      onClick={() => onDelete(comment.id)}
                      className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={13} /> Sil
                    </button>
                  )}
                </>
              )}
            </div>
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
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
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
  const [supportsParentId, setSupportsParentId] = useState<boolean>(true);
  const [similarTopics, setSimilarTopics] = useState<Topic[]>([]);

  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isUpdatingTopic, setIsUpdatingTopic] = useState(false);

  const startEditingTopic = () => {
    if (!topic) return;
    setEditTitle(topic.title);
    setEditContent(topic.content);
    setIsEditingTopic(true);
  };

  const handleUpdateTopic = async () => {
    if (!user || !topic || !editTitle.trim() || !editContent.trim()) return;
    setIsUpdatingTopic(true);
    try {
      const { error } = await supabase
        .from('topics')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      setTopic({
        ...topic,
        title: editTitle.trim(),
        content: editContent.trim()
      });
      setIsEditingTopic(false);
      toast.success('Tartışma güncellendi.');
    } catch (err: any) {
      toast.error('Güncelleme başarısız: ' + err.message);
    } finally {
      setIsUpdatingTopic(false);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!user || !content.trim()) return;
    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;
      setComments(comments.map(c => c.id === commentId ? { ...c, content, updated_at: new Date().toISOString() } : c));
      toast.success('Yorum güncellendi.');
    } catch (err: any) {
      toast.error('Güncelleme başarısız: ' + err.message);
      throw err;
    }
  };

  const fetchLikeStatus = useCallback(async () => {
    if (!user || !topic?.id) return;
    try {
      const { data, error } = await supabase
        .from('reactions')
        .select('id')
        .eq('topic_id', topic.id)
        .eq('user_id', user.id)
        .maybeSingle(); // maybeSingle results in null if not found, instead of error
      
      if (data) setIsLiked(true);
      else setIsLiked(false);
    } catch (err) {
      console.error('Error fetching like status:', err);
    }
  }, [topic?.id, user]);

  useEffect(() => {
    if (topic) {
      setLikesCount(topic.likes_count || 0);
      fetchLikeStatus();
    }
  }, [topic, fetchLikeStatus]);

  const handleToggleLike = async () => {
    if (!user || !topic?.id) {
      toast('Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('topic_id', topic.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from('reactions')
          .insert({
            topic_id: topic.id,
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
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?') || !topic?.id) return;
    const { error } = await supabase.from('topics').delete().eq('id', topic.id);
    if (error) toast('Silme işlemi başarısız: ' + error.message);
    else router.push('/discussions');
  };

  const togglePin = async () => {
    if (!topic?.id) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_pinned: !topic.is_pinned })
      .eq('id', topic.id);
    if (error) toast('Hata: ' + error.message);
    else setTopic({ ...topic, is_pinned: !topic.is_pinned });
  };

  const toggleLock = async () => {
    if (!topic?.id) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_locked: !topic.is_locked })
      .eq('id', topic.id);
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
    if (!topic?.id || topic.author_id !== user?.id) return;

    try {
      // Unmark any previous solution
      await supabase
        .from('comments')
        .update({ is_solution: false })
        .eq('topic_id', topic.id);

      const { error } = await supabase
        .from('comments')
        .update({ is_solution: true })
        .eq('id', commentId);

      if (error) throw error;

      await supabase
        .from('topics')
        .update({ is_solved: true })
        .eq('id', topic.id);

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

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const checkIfBookmarked = useCallback(async (topicUuid?: string) => {
    const targetId = topicUuid || topic?.id;
    if (!user || !targetId) return;
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('topic_id', targetId)
        .maybeSingle();
      
      if (data) setIsBookmarked(true);
      else setIsBookmarked(false);
    } catch (err) {
      console.error('Error checking bookmark:', err);
    }
  }, [user, topic?.id]);

  const toggleBookmark = async () => {
    if (!user || !topic?.id) {
      toast.error('Lütfen önce giriş yapın.');
      return;
    }
    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('topic_id', topic.id);
        setIsBookmarked(false);
        toast.success('Yer işareti kaldırıldı.');
      } else {
        await supabase
          .from('bookmarks')
          .insert([{ user_id: user.id, topic_id: topic.id }]);
        setIsBookmarked(true);
        toast.success('Tartışma kaydedildi.');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      toast.error('İşlem başarısız oldu.');
    } finally {
      setIsBookmarking(false);
    }
  };

  const fetchSimilarTopics = useCallback(async (categoryId: string, excludeId: string) => {
    if (!isSupabaseConfigured || !categoryId || !excludeId) return;
    try {
      const { data } = await supabase
        .from('topics')
        .select('*, author:profiles(username)')
        .eq('category_id', categoryId)
        .neq('id', excludeId)
        .limit(3);
      if (data) setSimilarTopics(data);
    } catch (err) {
      console.error('Error fetching similar topics:', err);
    }
  }, []);

  const handleTopicData = useCallback((topicData: any) => {
    setTopic(topicData);
    if (topicData.category_id) {
      fetchSimilarTopics(topicData.category_id, topicData.id);
    }
    
    const actualId = topicData.id;
    supabase.rpc('increment_views', { topic_id: actualId }).then(({ error: viewError }) => {
      if (viewError) {
        supabase
          .from('topics')
          .update({ views_count: (topicData.views_count || 0) + 1 })
          .eq('id', actualId)
          .then(() => {});
      }
    });
    return topicData;
  }, [fetchSimilarTopics]);

  const fetchTopic = useCallback(async () => {
    if (!isSupabaseConfigured || !id) {
      setTopic(null);
      setLoading(false);
      return null;
    }

    try {
      // UUID olup olmadığını kontrol et
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      const selectFields = `
        id, title, content, author_id, category_id, is_pinned, is_locked, is_solved, views_count, created_at, updated_at, slug,
        author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified),
        category:categories(id, name, slug, color, icon)
      `;

      if (isUUID) {
        // Önce id ile ara
        const { data, error } = await supabase
          .from('topics')
          .select(selectFields)
          .eq('id', id)
          .maybeSingle();
        
        if (!error && data) {
          return handleTopicData(data);
        }
      }
      
      // UUID değilse veya ID ile bulunamadıysa slug ile dene
      const { data: slugData, error: slugError } = await supabase
        .from('topics')
        .select(selectFields)
        .eq('slug', id)
        .maybeSingle();

      if (slugError || !slugData) {
        if (slugError) console.error('Tartışma bulunamadı veya hata:', slugError.message);
        setTopic(null);
        return null;
      }
      return handleTopicData(slugData);
    } catch (err) {
      console.error('Tartışma getirme sistem hatası:', err);
      setTopic(null);
      return null;
    }
  }, [id, handleTopicData]);

  const fetchComments = useCallback(async (topicUuid?: string) => {
    const targetId = topicUuid || id;
    if (!isSupabaseConfigured || !targetId) {
      setComments([]);
      setLoading(false);
      return;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId);
    if (!isUUID && !topicUuid) {
      // If we don't have a UUID yet and the URL param is a slug, wait for fetchTopic
      return;
    }

    try {
      // Probe if 'parent_id' column exists in comments table
      const { error: probeError } = await supabase
        .from('comments')
        .select('parent_id')
        .limit(1);

      const hasParentId = !probeError || (probeError.code !== 'PGRST100' && probeError.code !== '42703');
      setSupportsParentId(hasParentId);

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, content, topic_id, author_id, parent_id, is_solution, created_at, updated_at,
          author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified)
        `)
        .eq('topic_id', targetId)
        .order('created_at', { ascending: true });
      
      if (error) {
        setComments([]);
      } else {
        setComments((data as any || []).filter((c: any) => c.author));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (id && isMounted) {
        setLoading(true);
        const fetchedTopic = await fetchTopic();
        if (fetchedTopic && isMounted) {
          await fetchComments(fetchedTopic.id);
          await checkIfBookmarked(fetchedTopic.id);
        } else {
          setLoading(false);
        }
      }
    };
    init();
    return () => { isMounted = false; };
  }, [id, fetchTopic, fetchComments, checkIfBookmarked]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic?.id || !newComment.trim() || sending) return;

    setSending(true);
    try {
      const insertData: any = {
        topic_id: topic.id,
        author_id: user.id,
        content: newComment.trim(),
      };
      
      if (supportsParentId && replyToId) {
        insertData.parent_id = replyToId;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert(insertData)
        .select('*, author:profiles(*)')
        .single();

      if (error) throw error;

      // Increase User XP (+10 for comment) and check Level
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp, level')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          const newXp = (profile.xp || 0) + 10;
          const newLevel = Math.floor(newXp / 200) + 1;
          
          await supabase
            .from('profiles')
            .update({ 
              xp: newXp,
              level: newLevel 
            })
            .eq('id', user.id);
        }
      }

      // Create Notification for Topic Author (if not self)
      if (topic && topic.author_id !== user.id) {
        try {
          await supabase
            .from('notifications')
            .insert([{
              recipient_id: topic.author_id,
              sender_id: user.id,
              type: 'comment',
              title: 'Yeni Yorum',
              body: `${user.email?.split('@')[0]} başlığınıza yorum yaptı.`,
              content: `${user.email?.split('@')[0]} başlığınıza yorum yaptı.`,
              data: { link: `/discussions/${id}` }
            }]);
        } catch (notifErr) {
          console.warn('Could not send comment notification:', notifErr);
        }
      }

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
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-md max-w-lg w-full">
            <div className="w-16 h-16 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-sky-500/20">
              <Search className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight text-foreground">Tartışma Bulunamadı</h1>
            <p className="text-muted-foreground text-sm font-medium mb-8 max-w-md mx-auto leading-relaxed">
              Aradığınız tartışma silinmiş olabilir veya yanlış bir bağlantı kullanıyor olabilirsiniz. Lütfen bağlantıyı kontrol edin veya tartışmalar listesine geri dönün.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => router.push('/discussions')} 
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm transition-all shadow-sm"
              >
                Tartışmalara Dön
              </button>
              <button 
                onClick={() => router.push('/')} 
                className="px-6 py-3 bg-muted hover:bg-muted/80 border border-border text-foreground rounded-xl font-bold text-sm transition-colors"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
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
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Forum Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-sky-400 transition-colors">ANA SAYFA</Link>
          <ChevronRight size={12} className="text-muted-foreground/50" />
          <Link href="/discussions" className="hover:text-sky-400 transition-colors">TARTIŞMALAR</Link>
          <ChevronRight size={12} className="text-muted-foreground/50" />
          <span className="text-foreground font-black truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
        </div>

        <button 
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-sky-400 transition-all group uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> GERİ DÖN
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Content (Span 8) */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            <article className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-xs">
              <header className="mb-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold text-[10px] rounded-lg tracking-wider">
                      KONU #{topic.id.substring(0, 6)}
                    </span>
                    <div className="px-3 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                      {topic.category?.name?.toUpperCase() || 'GENEL'}
                    </div>
                    <button
                      onClick={toggleBookmark}
                      disabled={isBookmarking}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                        isBookmarked 
                          ? "bg-sky-500 border-sky-500 text-white shadow-xs" 
                          : "bg-muted/40 border-border text-muted-foreground hover:border-sky-500/40 hover:text-foreground"
                      )}
                    >
                      {isBookmarking ? <Loader2 size={11} className="animate-spin" /> : <Bookmark size={11} fill={isBookmarked ? "currentColor" : "none"} />}
                      {isBookmarked ? 'KAYDEDİLDİ' : 'KAYDET'}
                    </button>
                  </div>

                  {isStaff && (
                    <div className="flex items-center gap-1.5">
                       {(isStaff || user?.id === topic.author_id) && !isEditingTopic && (
                         <button 
                          onClick={startEditingTopic} 
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                          title="Düzenle"
                        >
                          <Settings size={16} />
                        </button>
                       )}
                       <button 
                        onClick={togglePin} 
                        className={`p-2 rounded-xl transition-all ${topic.is_pinned ? 'text-sky-400 bg-sky-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={topic.is_pinned ? "İğnelemeyi Kaldır" : "İğnele"}
                      >
                        <Pin size={16} />
                      </button>
                      <button 
                        onClick={toggleLock} 
                        className={`p-2 rounded-xl transition-all ${topic.is_locked ? 'text-amber-400 bg-amber-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={topic.is_locked ? "Kilidi Aç" : "Kilitle"}
                      >
                        <Lock size={16} />
                      </button>
                      <button onClick={deleteTopic} className="text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-xl transition-all" title="Sil">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-snug break-words">
                  {topic.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  <Link href={`/profile/${topic.author?.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <UserAvatar 
                      src={topic.author?.avatar_url}
                      username={topic.author?.username}
                      name={topic.author?.full_name}
                      size="sm"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-foreground hover:underline">
                        {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
                      </span>
                      <span className="text-[10px] text-sky-400 font-semibold">
                        {topic.author?.role === 'admin' ? 'YÖNETİCİ' : topic.author?.role === 'moderator' ? 'MODERATÖR' : 'TOPLULUK ÜYESİ'}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-sky-400" />
                      <span>{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={13} className="text-sky-400" />
                      <span>{topic.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </header>

              {isEditingTopic ? (
                <div className="space-y-4 mb-8">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">BAŞLIK</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-base font-bold outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">İÇERİK</label>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background p-4 text-sm outline-none focus:border-sky-500 transition-colors min-h-[220px]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleUpdateTopic}
                      disabled={isUpdatingTopic}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isUpdatingTopic ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                      KAYDET
                    </button>
                    <button 
                      onClick={() => setIsEditingTopic(false)}
                      className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      İPTAL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <TextToSpeechControls text={topic.content} title={topic.title} className="mb-6" />

                  <div className="prose prose-slate dark:prose-invert max-w-none font-normal text-foreground/90 leading-relaxed break-words">
                    <BionicMarkdown content={topic.content} />
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleToggleLike}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-wider outline-none cursor-pointer",
                      isLiked 
                        ? "bg-rose-500 text-white shadow-xs" 
                        : "bg-muted/60 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400"
                    )}
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    {likesCount > 0 && <span>{likesCount}</span>}
                    <span>{isLiked ? 'BEĞENDİN' : 'BEĞEN'}</span>
                  </button>
                  <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white rounded-xl transition-all font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isSummarizing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    <span>AI Özetle</span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="mt-6 p-6 bg-sky-500/[0.04] border border-sky-500/20 rounded-2xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                        <Sparkles size={16} /> YAPAY ZEKA ÖZETİ
                      </div>
                      <button onClick={() => setSummary(null)} className="text-muted-foreground hover:text-foreground">
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-base font-medium italic text-foreground leading-relaxed">&ldquo;{summary}&rdquo;</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>

            {/* Comments Section */}
            <section className="space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                <MessageSquare size={24} className="text-sky-400" />
                <span>Yanıtlar</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {comments.length}
                </span>
              </h2>

              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.filter(c => !supportsParentId || !c.parent_id).map((comment) => (
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
                      onUpdate={handleUpdateComment}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border px-6">
                    <MessageSquare size={48} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Henüz yanıt yok. İlk yanıtı siz verin.</p>
                  </div>
                )}
              </div>

              {user ? (
                topic.is_locked && !isStaff ? (
                  <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center">
                    <Lock size={36} className="mx-auto text-amber-500/40 mb-3" />
                    <p className="text-base font-bold text-amber-500 uppercase tracking-wider mb-1">Bu Tartışma Kilitlendi</p>
                    <p className="text-xs text-muted-foreground">Artık yeni yanıt kabul edilmemektedir.</p>
                  </div>
                ) : (
                  <form 
                    onSubmit={handlePostComment}
                    className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs relative"
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="reply-textarea" className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {replyToId 
                          ? `${comments.find(c => c.id === replyToId)?.author?.username} adlı kullanıcıya yanıt` 
                          : (topic.is_locked ? 'ADMİN PANELİ: KİLİTLİ BAŞLIĞA YANIT' : 'YANITINIZ')}
                      </label>
                      {replyToId && (
                        <button 
                          type="button" 
                          onClick={() => setReplyToId(null)}
                          className="text-[11px] font-bold text-rose-400 hover:underline uppercase"
                        >
                          İptal Et
                        </button>
                      )}
                    </div>
                    <VoiceInput onTranscript={(text) => setNewComment(prev => prev ? `${prev} ${text}` : text)} label="Yanıtı Sesle Yaz" />
                    <textarea
                      id="reply-textarea"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={replyToId ? "Yanıtınızı buraya yazın..." : "Topluluğa faydalı bir yanıt yazın..."}
                      className="w-full rounded-2xl border border-border/80 bg-background p-4 text-sm font-medium outline-none focus:border-sky-500 transition-colors min-h-[140px] resize-y"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sending}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        <span>{sending ? 'GÖNDERİLİYOR...' : (replyToId ? 'YANITLA' : 'GÖNDER')}</span>
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="p-8 bg-card border border-border rounded-2xl text-center">
                  <Lock size={36} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Yanıt yazmak için giriş yapmalısınız.</p>
                  <Link 
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                  >
                    Giriş Yap
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar (Span 4) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* Author Profile Card */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-5 pb-3 border-b border-border/50">
                YAZAR BİLGİSİ
              </h3>
              <div className="flex flex-col items-center text-center space-y-4">
                <UserAvatar 
                  src={topic.author?.avatar_url}
                  username={topic.author?.username}
                  name={topic.author?.full_name}
                  size="lg"
                />
                <div>
                  <Link href={`/profile/${topic.author?.id}`} className="text-lg font-bold text-foreground hover:text-sky-400 transition-colors block">
                    @{topic.author?.username || 'isimsiz'}
                  </Link>
                  <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mt-0.5">
                    {topic.author?.role === 'admin' ? 'SİTE YÖNETİCİSİ' : topic.author?.role === 'moderator' ? 'MODERATÖR' : 'TOPLULUK ÜYESİ'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full pt-3 border-t border-border/50">
                  <div className="text-center p-2 bg-muted/40 rounded-xl">
                    <div className="text-base font-black text-foreground">{topic.author?.level || 1}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">SEVİYE</div>
                  </div>
                  <div className="text-center p-2 bg-muted/40 rounded-xl">
                    <div className="text-base font-black text-sky-400">{topic.author?.xp || 0}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">XP</div>
                  </div>
                </div>
                <Link 
                  href={`/profile/${topic.author?.id}`}
                  className="w-full py-2.5 flex items-center justify-center rounded-xl bg-muted hover:bg-sky-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                  Profili Görüntüle
                </Link>
              </div>
            </section>

            {/* Topic Stats Card */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4 pb-3 border-b border-border/50">
                BAŞLIK BİLGİLERİ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MessageSquare size={15} className="text-sky-400" />
                    <span>Yanıtlar</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye size={15} className="text-sky-400" />
                    <span>Görüntülenme</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{topic.views_count || 0}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Heart size={15} className="text-rose-400" />
                    <span>Beğeni</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{likesCount}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar size={15} className="text-sky-400" />
                    <span>Tarih</span>
                  </div>
                  <span className="text-xs font-medium text-foreground">{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </section>

            {/* Similar Topics */}
            <section className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-4 pb-3 border-b border-border/50">
                BENZER BAŞLIKLAR
              </h3>
              <div className="space-y-3">
                {similarTopics.length > 0 ? (
                  similarTopics.map(t => (
                    <Link key={t.id} href={`/discussions/${t.id}`} className="block p-3 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border">
                      <p className="text-xs font-bold text-foreground hover:text-sky-400 transition-colors line-clamp-2 leading-snug">
                        {t.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Benzer başlık bulunamadı.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}