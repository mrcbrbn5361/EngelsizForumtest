'use client';
import Image from 'next/image';
import { toast } from 'sonner';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topic, Comment } from '@/types/database';
import { ArrowLeft, Send, MessageSquare, Sparkles, Loader2, Heart, Shield, Globe, Users, User, ChevronRight, Plus, Lock, Trash2, Pin, Bookmark, Check, Settings, Eye, Calendar, Search } from 'lucide-react';
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
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "vibe-card p-4 sm:p-6 md:p-8 flex gap-3 sm:gap-6 md:gap-8 hover:border-primary/30 transition-all group relative",
          comment.is_solution && "border-2 border-emerald-500 shadow-lg shadow-emerald-500/10",
          depth > 0 && "ml-3 sm:ml-6 md:ml-12 border-l-2 border-primary/20"
        )}
      >
        {comment.is_solution && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={10} /> EN İYİ ÇÖZÜM
          </div>
        )}

        <div className="flex-shrink-0">
          <Link href={`/profile/${comment.author?.id}`} className="block relative z-20">
            <div className={cn(
              "rounded-[1.5rem] bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground transition-all overflow-hidden border-2 border-transparent group-hover:border-primary/20 relative",
              depth > 0 ? "w-10 h-10 md:w-14 md:h-14" : "w-14 h-14 md:w-20 md:h-20"
            )}>
              <img 
                src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.username || 'user'}`} 
                alt="Profil" 
                className="object-cover h-full w-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex-wrap">
              <span className="text-primary flex items-center gap-2 flex-wrap">
                <Link href={`/profile/${comment.author?.id}`} className="hover:underline font-black relative z-20">
                  {comment.author?.full_name?.toUpperCase() || comment.author?.username?.toUpperCase() || 'KULLANICI'}
                </Link>
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
              {comment.updated_at !== comment.created_at && (
                <span className="text-muted-foreground italic">(GÜNCELLENDİ)</span>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="vibe-input min-h-[120px] p-4 text-base"
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} KAYDET
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-xl font-black text-[10px] uppercase tracking-widest"
                >
                  İPTAL
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm md:text-base font-medium leading-relaxed break-words text-foreground/90">
              <BionicMarkdown content={comment.content} />
            </div>
          )}

          <div className="flex items-center gap-4 pt-2">
            {!isEditing && (
              <>
                {currentUserId && (
                  <button 
                    onClick={() => onReply(comment.id)}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Yanıtla
                  </button>
                )}
                {(isStaff || currentUserId === comment.author_id) && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:underline flex items-center gap-1.5"
                  >
                    <Settings size={14} /> Düzenle
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
              </>
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
        id, title, content, author_id, category_id, is_pinned, is_locked, is_solved, views_count, likes_count, comments_count, created_at, updated_at, slug,
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
          id, content, topic_id, author_id, parent_id, likes_count, is_solution, created_at, updated_at,
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
        .select('*, author:profiles!comments_author_id_fkey(*)')
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
        await supabase
          .from('notifications')
          .insert([{
            user_id: topic.author_id,
            type: 'comment',
            title: 'Yeni Yorum',
            body: `${user.email?.split('@')[0]} başlığınıza yorum yaptı.`,
            data: { link: `/discussions/${id}` }
          }]);
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
        <div className="flex-1 flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="bg-muted/30 p-12 rounded-[4rem] border-4 border-border shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">Tartışma Bulunamadı</h1>
            <p className="text-muted-foreground text-lg font-medium mb-10 max-w-lg mx-auto">
              Aradığınız tartışma silinmiş olabilir veya yanlış bir bağlantı kullanıyor olabilirsiniz. Lütfen bağlantıyı kontrol edin veya tartışmalar listesine geri dönün.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={() => router.push('/discussions')} 
                className="px-10 py-4 bg-primary text-primary-foreground rounded-[2rem] font-black text-xl hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary/20"
              >
                Tartışmalara Dön
              </button>
              <button 
                onClick={() => router.push('/')} 
                className="px-10 py-4 bg-background border-4 border-border text-foreground rounded-[2rem] font-black text-xl hover:bg-muted transition-colors"
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
      <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Forum Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-primary transition-colors">ANA SAYFA</Link>
          <ChevronRight size={14} />
          <Link href="/communities" className="hover:text-primary transition-colors">TOPLULUKLAR & FORUM</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-black truncate max-w-xs">{topic.title}</span>
        </div>

        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-3 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-[0.2em] px-2"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> GERİ DÖN
        </button>

        <div className="grid grid-cols-1 2xl:grid-cols-[1fr_320px] gap-6 2xl:gap-8">
          {/* Main Content */}
          <div className="space-y-16 min-w-0">
            <article className="vibe-card p-6 sm:p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
              <header className="mb-12 space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary text-primary-foreground font-black text-[10px] rounded-lg tracking-widest">
                        KONU #1
                      </span>
                      <div className="px-5 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        {topic.category?.name?.toUpperCase() || 'GENEL'}
                      </div>
                      <button
                        onClick={toggleBookmark}
                        disabled={isBookmarking}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                          isBookmarked 
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-indigo-100" 
                            : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        )}
                      >
                        {isBookmarking ? <Loader2 size={12} className="animate-spin" /> : <Bookmark size={12} fill={isBookmarked ? "currentColor" : "none"} />}
                        {isBookmarked ? 'KAYDEDİLDİ' : 'KAYDET'}
                      </button>
                    </div>
                    <Link href={`/profile/${topic.author?.id}`} className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border relative">
                        <img 
                          src={topic.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${topic.author?.username || 'user'}`} 
                          alt="Profil" 
                          className="object-cover h-full w-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="hover:underline">{topic.author?.full_name || topic.author?.username || 'KULLANICI'}</span>
                        <span className="text-[8px] font-bold text-primary tracking-widest opacity-80 mt-0.5 text-left">
                          {topic.author?.role === 'admin' ? 'YÖNETİCİ' : topic.author?.role === 'moderator' ? 'MODERATÖR' : 'TOPLULUK ÜYESİ'}
                        </span>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      <Globe size={14} className="text-primary" /> {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  {isStaff && (
                    <div className="flex items-center gap-2">
                       {(isStaff || user?.id === topic.author_id) && !isEditingTopic && (
                         <button 
                          onClick={startEditingTopic} 
                          className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all"
                          title="Düzenle"
                        >
                          <Settings size={18} />
                        </button>
                       )}
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

              {isEditingTopic ? (
                <div className="space-y-6 mb-12">
                  <div className="space-y-2">
                    <label className="vibe-label ml-0">BAŞLIK</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="vibe-input h-14 text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="vibe-label ml-0">İÇERİK (MARKDOWN DESTEKLENİR)</label>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="vibe-input min-h-[300px] p-6 text-lg"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleUpdateTopic}
                      disabled={isUpdatingTopic}
                      className="vibe-button-primary h-14 px-8"
                    >
                      {isUpdatingTopic ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check size={18} className="mr-2" />}
                      KAYDET
                    </button>
                    <button 
                      onClick={() => setIsEditingTopic(false)}
                      className="px-8 h-14 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest"
                    >
                      İPTAL
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <TextToSpeechControls text={topic.content} title={topic.title} className="mb-10" />

                  <div className="vibe-markdown-body prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-muted-foreground">
                    <BionicMarkdown content={topic.content} />
                  </div>
                </>
              )}

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
                  comments.filter(c => !supportsParentId || !c.parent_id).map((comment, index) => (
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
          <aside className="space-y-10 lg:sticky lg:top-8">
            {/* Author Profile Card */}
            <section className="vibe-card p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <h3 className="vibe-label ml-0 mb-10">YAZAR PROFİLİ</h3>
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-card shadow-2xl overflow-hidden bg-muted group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src={topic.author?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${topic.author?.username}`} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {topic.author?.is_verified && (
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg border-2 border-card">
                      <Shield size={16} />
                    </div>
                  )}
                </div>
                <div>
                  <Link href={`/profile/${topic.author?.id}`} className="text-2xl font-black text-foreground hover:text-primary transition-colors block mb-1">
                    @{topic.author?.username || 'isimsiz'}
                  </Link>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {topic.author?.role === 'admin' ? 'SİTE YÖNETİCİSİ' : topic.author?.role === 'moderator' ? 'MODERATÖR' : 'TOPLULUK ÜYESİ'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-lg font-black text-foreground">{topic.author?.level || 1}</div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SEVİYE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-primary">{topic.author?.xp || 0}</div>
                    <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">TOPLAM XP</div>
                  </div>
                </div>
                <Link 
                  href={`/profile/${topic.author?.id}`}
                  className="w-full h-12 flex items-center justify-center rounded-xl bg-muted hover:bg-primary hover:text-primary-foreground transition-all text-[10px] font-black uppercase tracking-widest"
                >
                  PROFİLİ GÖR
                </Link>
              </div>
            </section>

            {/* Topic Stats Card */}
            <section className="vibe-card p-10">
              <h3 className="vibe-label ml-0 mb-10">KONU İSTATİSTİKLERİ</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare size={18} />
                    </div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">YANITLAR</span>
                  </div>
                  <span className="text-lg font-black text-foreground">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Eye size={18} />
                    </div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">GÖRÜNTÜLENME</span>
                  </div>
                  <span className="text-lg font-black text-foreground">{topic.views_count || 0}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Heart size={18} />
                    </div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">BEĞENİLER</span>
                  </div>
                  <span className="text-lg font-black text-foreground">{likesCount}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar size={18} />
                    </div>
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">OLUŞTURULDU</span>
                  </div>
                  <span className="text-[10px] font-black text-foreground">{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </section>

            {/* AI Assistant Banner */}
            <div className="bg-primary p-12 rounded-[2.5rem] text-primary-foreground shadow-2xl relative overflow-hidden group">
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
                {similarTopics.length > 0 ? (
                  similarTopics.map(t => (
                    <Link key={t.id} href={`/discussions/${t.id}`} className="block group p-6 rounded-2xl hover:bg-muted/50 transition-all border border-transparent hover:border-border">
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 tracking-tight">
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        KEŞFET <ChevronRight size={16} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4">Benzer başlık bulunamadı.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}