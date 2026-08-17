'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topic, Comment } from '@/types/database';
import { 
  ArrowLeft, Send, MessageSquare, Sparkles, Loader2, Heart, Lock, Trash2, 
  Pin, Bookmark, Check, Settings, Eye, Calendar, Search, X, CheckCircle2, ChevronRight, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/providers/auth-provider';
import { useRole } from '@/hooks/use-role';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { BionicMarkdown } from '@/components/ui/bionic-markdown';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { UserAvatar } from '@/components/ui/user-avatar';
import { toast } from 'sonner';

const TextToSpeechControls = dynamic(
  () => import('@/components/ui/text-to-speech-controls').then(mod => mod.TextToSpeechControls),
  { ssr: false }
);
const VoiceInput = dynamic(
  () => import('@/components/ui/voice-input').then(mod => mod.VoiceInput),
  { ssr: false }
);

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
    } catch {
      // toast is handled in parent
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-5 rounded-2xl bg-card/80 backdrop-blur-md border transition-all ${
          comment.is_solution 
            ? 'border-emerald-500/40 bg-emerald-950/20 shadow-xs' 
            : 'border-border/80'
        } ${depth > 0 ? 'ml-3 sm:ml-6 md:ml-8 border-l-2 border-l-sky-500/40' : ''}`}
      >
        {comment.is_solution && (
          <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <CheckCircle2 size={12} /> Çözüm Olarak Onaylandı
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

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <Link href={`/profile/${comment.author?.id}`} className="font-semibold text-foreground hover:text-sky-400 transition-colors">
                  {comment.author?.full_name || comment.author?.username || 'Kullanıcı'}
                </Link>
                {(comment.author?.role === 'admin' || comment.author?.role === 'moderator') && (
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-bold">
                    {comment.author.role === 'admin' ? 'Yönetici' : 'Moderatör'}
                  </span>
                )}
                {comment.author?.id === topicAuthorId && (
                  <span className="px-1.5 py-0.2 rounded bg-muted text-foreground text-[9px] font-bold border border-border">
                    Yazar
                  </span>
                )}
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[11px] text-muted-foreground font-medium">{new Date(comment.created_at!).toLocaleDateString('tr-TR')}</span>
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
                  className="w-full min-h-[90px] p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:border-sky-500 outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Kaydet
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm font-normal leading-relaxed break-words text-foreground/90">
                <BionicMarkdown content={comment.content} />
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 text-xs">
              {!isEditing && (
                <>
                  {currentUserId && (
                    <button 
                      onClick={() => onReply(comment.id)}
                      className="text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Plus size={13} /> Yanıtla
                    </button>
                  )}
                  {(isStaff || currentUserId === comment.author_id) && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Settings size={13} /> Düzenle
                    </button>
                  )}
                  {currentUserId === topicAuthorId && !comment.is_solution && (
                    <button 
                      onClick={() => onMarkSolution(comment.id)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <CheckCircle2 size={13} /> Çözüm Olarak İşaretle
                    </button>
                  )}
                  {(isStaff || currentUserId === comment.author_id) && (
                    <button 
                      onClick={() => onDelete(comment.id)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
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
        <div className="space-y-3">
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

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

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
      const { data } = await supabase
        .from('reactions')
        .select('id')
        .eq('topic_id', topic.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
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
      toast.error('Beğenmek için giriş yapmalısınız.');
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
        
        if (error) {
          // If already liked (duplicate key violation), handle gracefully
          if (error.code === '23505' || error.message?.includes('duplicate key')) {
            setIsLiked(true);
            return;
          }
          throw error;
        }
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err: any) {
      toast.error('İşlem başarısız: ' + err.message);
    }
  };

  const deleteTopic = async () => {
    if (!confirm('Bu tartışmayı silmek istediğinize emin misiniz?') || !topic?.id) return;
    const { error } = await supabase.from('topics').delete().eq('id', topic.id);
    if (error) toast.error('Silme işlemi başarısız: ' + error.message);
    else router.push('/discussions');
  };

  const togglePin = async () => {
    if (!topic?.id) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_pinned: !topic.is_pinned })
      .eq('id', topic.id);
    if (error) toast.error('Hata: ' + error.message);
    else setTopic({ ...topic, is_pinned: !topic.is_pinned });
  };

  const toggleLock = async () => {
    if (!topic?.id) return;
    const { error } = await supabase
      .from('topics')
      .update({ is_locked: !topic.is_locked })
      .eq('id', topic.id);
    if (error) toast.error('Hata: ' + error.message);
    else setTopic({ ...topic, is_locked: !topic.is_locked });
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) toast.error('Silme işlemi başarısız: ' + error.message);
    else setComments(comments.filter(c => c.id !== commentId));
  };

  const handleMarkSolution = async (commentId: string) => {
    if (!topic?.id || topic.author_id !== user?.id) return;

    try {
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
      toast.success('Çözüm olarak onaylandı!');
    } catch (err: any) {
      toast.error('Hata: ' + err.message);
    }
  };

  const checkIfBookmarked = useCallback(async (topicUuid?: string) => {
    const targetId = topicUuid || topic?.id;
    if (!user || !targetId) return;
    try {
      const { data } = await supabase
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
        const { error: bmErr } = await supabase
          .from('bookmarks')
          .insert([{ user_id: user.id, topic_id: topic.id }]);
        if (bmErr && bmErr.code !== '23505' && !bmErr.message?.includes('duplicate key')) {
          throw bmErr;
        }
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
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      
      const selectFields = `
        id, title, content, author_id, category_id, is_pinned, is_locked, is_solved, views_count, created_at, updated_at, slug,
        author:profiles(id, username, avatar_url, full_name, role, level, xp, is_verified),
        category:categories(id, name, slug, color, icon)
      `;

      if (isUUID) {
        const { data, error } = await supabase
          .from('topics')
          .select(selectFields)
          .eq('id', id)
          .maybeSingle();
        
        if (!error && data) {
          return handleTopicData(data);
        }
      }
      
      const { data: slugData, error: slugError } = await supabase
        .from('topics')
        .select(selectFields)
        .eq('slug', id)
        .maybeSingle();

      if (slugError || !slugData) {
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
      return;
    }

    try {
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

      if (topic && topic.author_id !== user.id) {
        try {
          await supabase
            .from('notifications')
            .insert([{
              recipient_id: topic.author_id,
              sender_id: user.id,
              type: 'comment',
              title: 'Yeni Yorum',
              body: `${user.email?.split('@')[0]} başlığınıza yanıt verdi.`,
              content: `${user.email?.split('@')[0]} başlığınıza yanıt verdi.`,
              data: { link: `/discussions/${id}` }
            }]);
        } catch (notifErr) {
          console.warn('Could not send comment notification:', notifErr);
        }
      }

      setComments([...comments, data]);
      setNewComment('');
      setReplyToId(null);
      toast.success('Yanıtınız başarıyla yayınlandı.');
    } catch (err: any) {
      toast.error('Yorum gönderilemedi: ' + err.message);
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
      toast.error('Özet oluşturulurken bir hata oluştu: ' + err.message);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-sky-400" size={36} />
          <p className="text-xs font-semibold text-slate-400">Tartışma yükleniyor...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!topic) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="bg-[#111726]/80 p-8 rounded-2xl border border-white/[0.08] max-w-md w-full space-y-4">
            <div className="size-12 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center mx-auto border border-sky-500/20">
              <Search size={22} />
            </div>
            <h1 className="text-lg font-bold text-slate-100">Tartışma Bulunamadı</h1>
            <p className="text-slate-400 text-xs leading-relaxed">
              Aradığınız konu silinmiş veya taşınmış olabilir.
            </p>
            <div className="flex gap-2.5 justify-center pt-2">
              <button 
                onClick={() => router.push('/discussions')} 
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Tartışmalara Dön
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Erişim yolu" className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-sky-400 transition-colors">Ana Sayfa</Link>
          <ChevronRight size={13} className="text-muted-foreground/40" />
          <Link href="/discussions" className="hover:text-sky-400 transition-colors">Tartışmalar</Link>
          <ChevronRight size={13} className="text-muted-foreground/40" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6 min-w-0">
            <article className="bg-card/80 border border-border/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-xs">
              
              <header className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold text-[10px] rounded-md">
                      #{topic.id.substring(0, 6)}
                    </span>
                    <div className="px-2.5 py-0.5 rounded-md bg-muted text-foreground text-[10px] font-bold border border-border">
                      {topic.category?.name || 'Genel Danışma'}
                    </div>
                    {topic.is_solved && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Çözüldü
                      </span>
                    )}
                    <button
                      onClick={toggleBookmark}
                      disabled={isBookmarking}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer ${
                        isBookmarked 
                          ? 'bg-sky-500 border-sky-500 text-white shadow-xs' 
                          : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {isBookmarking ? <Loader2 size={10} className="animate-spin" /> : <Bookmark size={10} fill={isBookmarked ? "currentColor" : "none"} />}
                      {isBookmarked ? 'Kaydedildi' : 'Kaydet'}
                    </button>
                  </div>

                  {isStaff && (
                    <div className="flex items-center gap-1">
                      {(isStaff || user?.id === topic.author_id) && !isEditingTopic && (
                        <button 
                          onClick={startEditingTopic} 
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Settings size={14} />
                        </button>
                      )}
                      <button 
                        onClick={togglePin} 
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${topic.is_pinned ? 'text-sky-400 bg-sky-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={topic.is_pinned ? "İğnelemeyi Kaldır" : "İğnele"}
                      >
                        <Pin size={14} />
                      </button>
                      <button 
                        onClick={toggleLock} 
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${topic.is_locked ? 'text-amber-400 bg-amber-500/10' : 'text-muted-foreground hover:bg-muted'}`}
                        title={topic.is_locked ? "Kilidi Aç" : "Kilitle"}
                      >
                        <Lock size={14} />
                      </button>
                      <button onClick={deleteTopic} className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer" title="Sil">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-snug break-words">
                  {topic.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
                  <Link href={`/profile/${topic.author?.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <UserAvatar 
                      src={topic.author?.avatar_url}
                      username={topic.author?.username}
                      name={topic.author?.full_name}
                      size="sm"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-foreground hover:text-sky-400 transition-colors">
                        {topic.author?.full_name || topic.author?.username || 'Kullanıcı'}
                      </span>
                      <span className="text-[10px] text-sky-400 font-bold">
                        {topic.author?.role === 'admin' ? 'Yönetici' : topic.author?.role === 'moderator' ? 'Moderatör' : 'Topluluk Üyesi'}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar size={13} className="text-sky-400" />
                      <span>{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={13} className="text-sky-400" />
                      <span>{topic.views_count || 0} Görüntülenme</span>
                    </div>
                  </div>
                </div>
              </header>

              {isEditingTopic ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">Başlık</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">İçerik</label>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full min-h-[160px] p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:border-sky-500 outline-none resize-y"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdateTopic}
                      disabled={isUpdatingTopic}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUpdatingTopic ? <Loader2 className="animate-spin" size={13} /> : <Check size={13} />}
                      Kaydet
                    </button>
                    <button 
                      onClick={() => setIsEditingTopic(false)}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold text-xs cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <TextToSpeechControls text={topic.content} title={topic.title} className="mb-4" />

                  <div className="prose dark:prose-invert max-w-none font-normal text-foreground text-xs sm:text-sm leading-relaxed break-words">
                    <BionicMarkdown content={topic.content} />
                  </div>
                </>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToggleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs font-bold cursor-pointer ${
                      isLiked 
                        ? 'bg-rose-500 text-white shadow-xs' 
                        : 'bg-muted/40 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 border border-border'
                    }`}
                  >
                    <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                    {likesCount > 0 && <span>{likesCount}</span>}
                    <span>{isLiked ? 'Beğenildi' : 'Beğen'}</span>
                  </button>
                  
                  <button 
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500 hover:text-white rounded-xl transition-all text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {isSummarizing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>AI Özeti</span>
                  </button>
                </div>
              </div>

              {/* AI Summary Box */}
              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-sky-950/20 border border-sky-500/30 rounded-xl space-y-2 relative overflow-hidden backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs uppercase tracking-wider">
                        <Sparkles size={14} /> Yapay Zeka Özeti
                      </div>
                      <button onClick={() => setSummary(null)} className="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                        <X size={15} />
                      </button>
                    </div>
                    <p className="text-xs text-foreground/90 italic leading-relaxed">&ldquo;{summary}&rdquo;</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>

            {/* Comments Stream */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MessageSquare size={18} className="text-sky-400" />
                  <span>Yanıtlar</span>
                  <span className="text-xs font-bold px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {comments.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {comments.length > 0 ? (
                  comments.filter(c => !supportsParentId || !c.parent_id).map((comment) => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      allComments={comments}
                      topicAuthorId={topic.author_id}
                      isStaff={isStaff}
                      onReply={(cmtId) => {
                        setReplyToId(cmtId);
                        document.querySelector('textarea')?.focus();
                      }}
                      onDelete={deleteComment}
                      onMarkSolution={handleMarkSolution}
                      currentUserId={user?.id}
                      onUpdate={handleUpdateComment}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border px-6 space-y-2">
                    <MessageSquare size={32} className="mx-auto text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground font-medium">Bu tartışmaya henüz yanıt verilmemiş. İlk yanıtı siz ekleyin.</p>
                  </div>
                )}
              </div>

              {/* Reply Form */}
              {user ? (
                topic.is_locked && !isStaff ? (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                    <Lock size={24} className="mx-auto text-amber-400 mb-2" />
                    <p className="text-xs font-bold text-amber-400">Bu Tartışma Kilitlendi</p>
                    <p className="text-[11px] text-muted-foreground">Yönetim tarafından yeni yanıtlara kapatılmıştır.</p>
                  </div>
                ) : (
                  <form 
                    onSubmit={handlePostComment}
                    className="bg-card/80 border border-border/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs relative backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <label htmlFor="reply-textarea" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {replyToId 
                          ? `${comments.find(c => c.id === replyToId)?.author?.username} adlı kullanıcıya yanıt` 
                          : (topic.is_locked ? 'Yönetici Yanıtı' : 'Yanıtınız')}
                      </label>
                      {replyToId && (
                        <button 
                          type="button" 
                          onClick={() => setReplyToId(null)}
                          className="text-[11px] font-bold text-rose-400 hover:underline cursor-pointer"
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
                      className="w-full min-h-[100px] p-3.5 rounded-xl border border-border bg-background text-foreground text-xs focus:border-sky-500 outline-none resize-y placeholder:text-muted-foreground/60"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={sending}
                        className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                      >
                        {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        <span>{sending ? 'Gönderiliyor...' : (replyToId ? 'Yanıtla' : 'Yanıt Gönder')}</span>
                      </button>
                    </div>
                  </form>
                )
              ) : (
                <div className="p-6 bg-card/60 border border-border/80 rounded-2xl text-center space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">Tartışmaya yanıt yazmak için giriş yapmanız gerekmektedir.</p>
                  <Link 
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-xs transition-colors uppercase tracking-wider"
                  >
                    Giriş Yap
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-8">
            
            {/* Author Profile Card */}
            <section className="bg-card border border-border/80 rounded-2xl p-5 backdrop-blur-md space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/60">
                Yazar Bilgisi
              </h3>
              <div className="flex flex-col items-center text-center space-y-3">
                <UserAvatar 
                  src={topic.author?.avatar_url}
                  username={topic.author?.username}
                  name={topic.author?.full_name}
                  size="lg"
                />
                <div>
                  <Link href={`/profile/${topic.author?.id}`} className="text-sm font-bold text-foreground hover:text-sky-400 transition-colors block">
                    @{topic.author?.username || 'isimsiz'}
                  </Link>
                  <p className="text-[10px] font-bold text-sky-400 mt-0.5">
                    {topic.author?.role === 'admin' ? 'Site Yöneticisi' : topic.author?.role === 'moderator' ? 'Moderatör' : 'Topluluk Üyesi'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 w-full pt-2 border-t border-border/60">
                  <div className="text-center p-2 bg-muted/40 rounded-xl border border-border/60">
                    <div className="text-sm font-bold text-foreground">{topic.author?.level || 1}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">Seviye</div>
                  </div>
                  <div className="text-center p-2 bg-muted/40 rounded-xl border border-border/60">
                    <div className="text-sm font-bold text-sky-400">{topic.author?.xp || 0}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase">XP Puanı</div>
                  </div>
                </div>
                <Link 
                  href={`/profile/${topic.author?.id}`}
                  className="w-full py-2 flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border transition-colors text-xs font-bold uppercase tracking-wider"
                >
                  Profili Görüntüle
                </Link>
              </div>
            </section>

            {/* Topic Stats Card */}
            <section className="bg-card border border-border/80 rounded-2xl p-5 backdrop-blur-md space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/60">
                Başlık İstatistikleri
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5"><MessageSquare size={13} className="text-sky-400" /> Yanıtlar</span>
                  <span className="font-bold text-foreground">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Eye size={13} className="text-sky-400" /> Görüntülenme</span>
                  <span className="font-bold text-foreground">{topic.views_count || 0}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Heart size={13} className="text-rose-400" /> Beğeni</span>
                  <span className="font-bold text-foreground">{likesCount}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar size={13} className="text-sky-400" /> Tarih</span>
                  <span className="font-semibold text-foreground">{new Date(topic.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            </section>

            {/* Similar Topics */}
            <section className="bg-card border border-border/80 rounded-2xl p-5 backdrop-blur-md space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border/60">
                Benzer Başlıklar
              </h3>
              <div className="space-y-2">
                {similarTopics.length > 0 ? (
                  similarTopics.map(t => (
                    <Link key={t.id} href={`/discussions/${t.id}`} className="block p-2.5 rounded-xl hover:bg-muted/40 transition-colors border border-transparent hover:border-border">
                      <p className="text-xs font-medium text-foreground hover:text-sky-400 transition-colors line-clamp-2 leading-relaxed">
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
