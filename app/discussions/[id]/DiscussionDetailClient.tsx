'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ThumbsUp, Quote, Flag, MessageSquare, ExternalLink, ShieldCheck, 
  CheckCircle2, Pin, Trash2, Edit2, Plus, ChevronRight, Home, Award, 
  Sparkles, Clock, Send, Loader2, Star, CheckSquare, Heart,
  Volume2, VolumeX, Mic, MicOff, Radio, Square
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { UserAvatar } from '@/components/ui/user-avatar';
import { UserRoleBadge } from '@/components/ui/user-badge';
import ClassicSidebar from '@/components/forum/classic-sidebar';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { VoiceInput } from '@/components/accessibility/voice-input';
import { base64ToBlobUrl } from '@/lib/utils';

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
  
  const [topicSummary, setTopicSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<any>(null);

  // Stop any playing TTS audio
  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setCurrentlyPlayingId(null);
  };

  // Clean audio and timers on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Summarize Topic with Yeterly AI
  const handleSummarizeTopic = async () => {
    if (topicSummary) {
      setTopicSummary(null);
      return;
    }
    
    setLoadingSummary(true);
    toast.info('Yeterly AI ile özet oluşturuluyor...');
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: topic.title,
          content: topic.content
        })
      });
      const data = await response.json();
      if (data.summary || data.text) {
        setTopicSummary(data.summary || data.text);
        toast.success('Özet başarıyla oluşturuldu.');
      } else {
        toast.error('Özet oluşturulamadı.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Bağlantı hatası.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // TTS Reader with Yeterly / browser Speech API fallback
  const handleTTS = async (id: string, text: string) => {
    if (currentlyPlayingId === id) {
      stopAudio();
      return;
    }

    stopAudio();
    setCurrentlyPlayingId(id);
    toast.info('Ses dosyası yükleniyor...');

    try {
      const response = await fetch('/api/yeterly/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await response.json();

      if (data.success && data.audio_base64) {
        const audioSrc = base64ToBlobUrl(data.audio_base64);
        const audio = new Audio(audioSrc);
        audioElementRef.current = audio;
        audio.play();
        audio.onended = () => {
          setCurrentlyPlayingId(null);
        };
      } else {
        // Fallback to browser Speech Synthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.onend = () => setCurrentlyPlayingId(null);
        utterance.onerror = () => {
          setCurrentlyPlayingId(null);
          toast.error('Seslendirme başarısız.');
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.onend = () => setCurrentlyPlayingId(null);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Recording (Voice Message) functions
  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        toast.error('Tarayıcınız ses kaydını desteklemiyor.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64DataUrl = reader.result as string;
          const audioTag = `[AUDIO]${base64DataUrl}[/AUDIO]\n`;
          setReplyContent(prev => prev + audioTag);
          toast.success('Ses kaydı mesaja başarıyla eklendi!');
        };
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      toast.info('Ses kaydı başladı...');

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error(e);
      toast.error('Mikrofon erişimi engellendi veya bulunamadı.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };
  
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
        await supabase
          .from('topics')
          .update({ views_count: (topic.views_count || 0) + 1 })
          .eq('id', topic.id);
      } catch (e) {
        console.error("Error incrementing views:", e);
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
          try {
            await supabase.from('notifications').insert([{
              user_id: topic.author_id,
              recipient_id: topic.author_id,
              sender_id: user.id,
              type: 'like',
              content: `${profile?.full_name || profile?.username || 'Bir üye'} "${topic.title}" konunuzu beğendi.`,
              is_read: false,
              created_at: new Date().toISOString()
            }]);
          } catch (notifErr) {
            console.warn("Notification insert warning:", notifErr);
          }
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
    const currentReplyText = replyContent.trim();
    if (!currentReplyText) return;

    setSubmitting(true);
    try {
      const newCommentRow = {
        topic_id: topic.id,
        author_id: user.id,
        content: currentReplyText,
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
          try {
            await supabase.from('notifications').insert([{
              user_id: topic.author_id,
              recipient_id: topic.author_id,
              sender_id: user.id,
              type: 'comment',
              content: `${profile?.full_name || profile?.username || 'Bir üye'} "${topic.title}" konunuza cevap yazdı.`,
              is_read: false,
              created_at: new Date().toISOString()
            }]);
          } catch (notifErr) {
            console.warn("Notification insert warning:", notifErr);
          }
        }

        // Check if @EngelsizAI is mentioned
        if (/@engelsizai/i.test(currentReplyText)) {
          toast.success("EngelsizAI etiketlendi! Konu analiz ediliyor ve yanıt hazırlanıyor...");
          try {
            const aiRes = await fetch('/api/ai/mention', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                topicId: topic.id,
                topicTitle: topic.title,
                topicContent: topic.content,
                userPrompt: currentReplyText,
                userId: user.id
              })
            });
            const aiData = await aiRes.json();
            if (aiData.success && aiData.comment) {
              setComments(prev => [...prev, aiData.comment as CommentData]);
              setTopic(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
              toast.success("EngelsizAI konuyu yanıtladı!");
            }
          } catch (aiCallErr) {
            console.error("Failed to fetch EngelsizAI mention response:", aiCallErr);
          }
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
    'YÖNETİCİ': 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    'MODERATÖR': 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
    'UZMAN': 'bg-sky-50 text-[#185886] border border-sky-200 font-bold',
    'ÜYE': 'bg-slate-100 text-slate-600 border border-slate-200 font-semibold'
  };

  // Unified markdown, BBCode [QUOTE], and math equation parser
  const renderPostContent = (text: string): React.ReactNode => {
    if (!text) return null;

    // Regex for BBCode quotes [QUOTE="Username"]content[/QUOTE]
    const quoteRegex = /\[QUOTE="([^"]*)"\]([\s\S]*?)\[\/QUOTE\]/g;

    const formatTextChunk = (chunk: string) => {
      return chunk.split('\n').map((line, lineIdx) => {
        // Audio Message Player
        if (line.includes('[AUDIO]') && line.includes('[/AUDIO]')) {
          const audioMatch = /\[AUDIO\](data:[^\]]+)\[\/AUDIO\]/.exec(line);
          if (audioMatch) {
            const audioUrl = audioMatch[1];
            return (
              <div key={lineIdx} className="my-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3 max-w-sm">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Volume2 size={16} className="text-[#185886]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sesli Mesaj</p>
                  <audio controls src={audioUrl} className="w-full h-8 outline-none" />
                </div>
              </div>
            );
          }
        }

        // Markdown Headers
        if (line.startsWith('### ')) {
          return (
            <h3 key={lineIdx} className="text-sm font-extrabold text-[#185886] mt-3 mb-1.5 uppercase tracking-wide">
              {line.substring(4)}
            </h3>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={lineIdx} className="text-base font-extrabold text-[#185886] mt-4 mb-2 uppercase tracking-wide border-b border-slate-200 pb-1">
              {line.substring(3)}
            </h2>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={lineIdx} className="text-lg font-extrabold text-[#185886] mt-5 mb-2 uppercase tracking-wide border-b border-slate-200 pb-1">
              {line.substring(2)}
            </h1>
          );
        }

        // Beautiful Math Formulas rendering
        if (line.includes('\\text') || line.includes('\\frac') || line.includes('\\times') || line.includes('\\\\')) {
          const displayMath = line
            .replace(/\\\\/g, '\\')
            .replace(/\\text{([^}]+)}/g, '$1')
            .replace(/\\times/g, ' × ')
            .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1 / $2)');

          return (
            <div key={lineIdx} className="my-3 p-3.5 bg-slate-50 border border-slate-200 rounded-sm font-mono text-center text-xs sm:text-sm text-[#185886] font-bold select-all tracking-wide">
              {displayMath}
            </div>
          );
        }

        // Inline bold parsing **bold**
        let elements: React.ReactNode[] = [];
        let lastIdx = 0;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIdx) {
            elements.push(line.substring(lastIdx, match.index));
          }
          elements.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
          lastIdx = boldRegex.lastIndex;
        }

        if (lastIdx < line.length) {
          elements.push(line.substring(lastIdx));
        }

        return (
          <p key={lineIdx} className="min-h-[1.25rem] leading-relaxed text-slate-700">
            {elements.length > 0 ? elements : line}
          </p>
        );
      });
    };

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = quoteRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <React.Fragment key={`text-${lastIndex}`}>
            {formatTextChunk(text.substring(lastIndex, match.index))}
          </React.Fragment>
        );
      }

      const author = match[1];
      const quoteBody = match[2];

      parts.push(
        <div key={`quote-${match.index}`} className="bg-slate-50 border border-slate-200 border-l-[3px] border-l-[#185886] p-3.5 my-3 rounded-sm text-xs text-slate-600 select-text">
          <div className="font-bold text-[#185886] mb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
            <Quote size={11} className="text-[#185886]" /> {author} dedi ki:
          </div>
          <div className="italic text-slate-600 leading-relaxed pl-1">
            {renderPostContent(quoteBody)}
          </div>
        </div>
      );

      lastIndex = quoteRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {formatTextChunk(text.substring(lastIndex))}
        </React.Fragment>
      );
    }

    return <div className="space-y-1.5 select-text">{parts}</div>;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumbs */}
      <div className="bg-slate-50 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mb-4 shadow-2xs">
        <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
          <Home size={12} />
          Ana Sayfa
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
        {topic.category && (
          <>
            <span className="opacity-50">/</span>
            <Link href={`/discussions?kategori=${topic.category.slug}`} className="hover:text-[#185886] hover:underline font-semibold">{topic.category.name}</Link>
          </>
        )}
        <span className="opacity-50">/</span>
        <span className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
      </div>

      {/* Thread Header */}
      <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-snug break-words flex items-center flex-wrap gap-2">
            {topic.is_pinned && (
              <span className="bg-[#eef2f7] text-[#185886] border border-[#cbd5e1] text-[10px] px-2 py-0.5 rounded-sm uppercase font-black tracking-wider flex items-center gap-1">
                <Pin size={10} className="fill-current" /> Sabit
              </span>
            )}
            {topic.is_solved && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-sm uppercase font-black tracking-wider flex items-center gap-1">
                <CheckCircle2 size={10} /> ÇÖZÜLDÜ
              </span>
            )}
            <span className="text-slate-900 font-extrabold">{topic.title}</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] sm:text-[12px] text-slate-500 flex-wrap">
            <span>Konuyu başlatan: <span className="text-[#185886] hover:underline font-bold">@{topic.author?.username || 'Anonim'}</span></span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</span>
            <span>•</span>
            <span className="font-mono text-slate-500 font-bold">Okunma: {topic.views_count || 1}</span>
          </div>
        </div>

        {/* AI Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarizeTopic}
            disabled={loadingSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#185886] text-[11px] font-bold uppercase transition-all shadow-2xs"
            title="Tartışmayı Yeterly AI ile özetle"
          >
            {loadingSummary ? (
              <Loader2 size={12} className="animate-spin text-[#185886]" />
            ) : (
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
            )}
            {topicSummary ? 'Özeti Gizle' : 'Tartışmayı AI ile Özetle'}
          </button>
        </div>
      </div>

      {/* Yeterly AI Summary View */}
      {topicSummary && (
        <div className="bg-sky-50/50 border-l-[4px] border-l-[#185886] border border-sky-100 rounded-sm p-4 text-xs sm:text-sm text-slate-700 mb-2 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-[#185886] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              Yeterly AI Özet
            </span>
            <button
              onClick={() => handleTTS('summary', topicSummary)}
              className={`p-1 rounded hover:bg-sky-100 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                currentlyPlayingId === 'summary' ? 'text-rose-600' : 'text-[#185886]'
              }`}
              title={currentlyPlayingId === 'summary' ? 'Seslendirmeyi durdur' : 'Özeti sesli dinle'}
            >
              {currentlyPlayingId === 'summary' ? <VolumeX size={13} /> : <Volume2 size={13} />}
              {currentlyPlayingId === 'summary' ? 'Sesi Durdur' : 'Özeti Dinle'}
            </button>
          </div>
          <div className="leading-relaxed font-medium">{topicSummary}</div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main Feed Column */}
        <div className="flex-1 min-w-0 space-y-4">
          
          {/* Main OP Post */}
          <article className="xf-post bg-white rounded-sm overflow-hidden flex flex-col md:flex-row border border-slate-200 shadow-sm">
            {/* Mobile Author Info */}
            <div className="md:hidden bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserAvatar 
                  src={topic.author?.avatar_url}
                  username={topic.author?.username}
                  name={topic.author?.full_name}
                  size="sm"
                />
                <div className="flex flex-col">
                  <Link href={`/profile/${topic.author?.username || topic.author_id}`} className="font-bold text-[#185886] hover:underline text-xs">
                    {topic.author?.full_name || topic.author?.username || 'Anonim'}
                  </Link>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold w-fit ${roleColors[mapRole(topic.author?.role || 'user')]}`}>
                    {mapRole(topic.author?.role || 'user')}
                  </span>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-500 font-bold">#1</div>
            </div>

            {/* Desktop Author Column */}
            <div className="xf-post-author hidden md:flex flex-col items-center bg-slate-50 shrink-0 w-44 p-4 border-r border-slate-200">
              <Link href={`/profile/${topic.author?.username || topic.author_id}`} className="font-extrabold text-[#185886] hover:underline text-sm mb-2 truncate max-w-full">
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
              <div className="w-full flex flex-col gap-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between border-b border-slate-200/50 pb-1">
                  <span>Seviye:</span>
                  <span className="font-bold text-[#185886]">{topic.author?.level || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Puan:</span>
                  <span className="font-mono font-bold text-slate-700">{topic.author?.xp || 10} XP</span>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="xf-post-content flex-1 p-4 sm:p-5 flex flex-col bg-white">
              <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
                <time>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: tr })}</time>
                <span className="font-mono text-slate-500 font-bold">#1</span>
              </div>

              <div className="xf-post-body leading-relaxed text-slate-800 text-xs sm:text-sm flex-1 min-h-[100px]">
                {renderPostContent(topic.content)}
              </div>

              <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
                <button 
                  onClick={handleLikeTopic}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm transition-all border ${
                    likedTopic 
                      ? 'bg-rose-50 text-rose-600 border-rose-200' 
                      : 'text-slate-500 hover:text-[#185886] border-transparent hover:bg-slate-50'
                  }`}
                >
                  <Heart size={14} className={likedTopic ? 'fill-current scale-110' : ''} />
                  Beğen {topic.likes_count > 0 && `(${topic.likes_count})`}
                </button>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleTTS(topic.id, topic.content)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                      currentlyPlayingId === topic.id 
                        ? 'text-rose-600 font-extrabold bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-sm' 
                        : 'text-[#185886] hover:bg-slate-50 px-2.5 py-1.5 rounded-sm'
                    }`}
                  >
                    {currentlyPlayingId === topic.id ? <VolumeX size={13} className="animate-pulse" /> : <Volume2 size={13} />}
                    {currentlyPlayingId === topic.id ? 'Sesi Durdur' : 'Sesli Dinle'}
                  </button>

                  <button 
                    onClick={() => handleQuote(topic.author?.username || 'Anonim', topic.content)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#185886] hover:bg-slate-50 px-2.5 py-1.5 rounded-sm transition-colors"
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
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-xs border-2' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Mobile View Author Bar */}
                  <div className="md:hidden bg-slate-50 border-b border-slate-200 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        src={comment.author?.avatar_url}
                        username={comment.author?.username}
                        name={comment.author?.full_name}
                        size="sm"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${comment.author?.username || comment.author_id}`} className="font-bold text-[#185886] hover:underline text-xs">
                            {comment.author?.full_name || comment.author?.username || 'Anonim'}
                          </Link>
                          {isCommentAuthorOp && (
                            <span className="text-[8px] bg-sky-50 text-sky-800 border border-sky-200 px-1 rounded-sm font-bold uppercase">OP</span>
                          )}
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold w-fit ${roleColors[mapRole(comment.author?.role || 'user')]}`}>
                          {mapRole(comment.author?.role || 'user')}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 font-bold">#{index + 2}</div>
                  </div>

                  {/* Desktop view Author Column */}
                  <div className="xf-post-author hidden md:flex flex-col items-center bg-slate-50 shrink-0 w-44 p-4 border-r border-slate-200">
                    <div className="flex flex-col items-center max-w-full">
                      <Link href={`/profile/${comment.author?.username || comment.author_id}`} className="font-extrabold text-[#185886] hover:underline text-sm mb-1 truncate max-w-full">
                        @{comment.author?.username || 'Anonim'}
                      </Link>
                      {isCommentAuthorOp && (
                        <span className="text-[9px] bg-sky-50 text-sky-800 border border-sky-200 px-1.5 rounded-sm font-bold uppercase mb-2">Konu Sahibi</span>
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
                    
                    <div className="w-full flex flex-col gap-1.5 text-[11px] text-slate-500">
                      <div className="flex justify-between border-b border-slate-200/50 pb-1">
                        <span>Seviye:</span>
                        <span className="font-bold text-[#185886]">{comment.author?.level || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Puan:</span>
                        <span className="font-mono font-bold text-slate-700">{comment.author?.xp || 10} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="xf-post-content flex-1 p-4 sm:p-5 flex flex-col bg-white">
                    <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <time>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}</time>
                        {comment.is_solution && (
                          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-extrabold uppercase text-[9px] tracking-wider bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                            <CheckCircle2 size={10} /> EN İYİ CEVAP / ÇÖZÜM
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-slate-500 font-bold">#{index + 2}</span>
                    </div>

                    <div className="xf-post-body leading-relaxed text-slate-700 text-xs sm:text-sm flex-1 min-h-[80px]">
                      {renderPostContent(comment.content)}
                    </div>

                    <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        {isOpOrAdmin && (
                          <button 
                            onClick={() => handleToggleSolution(comment.id, comment.is_solution)}
                            className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-sm transition-all border ${
                              comment.is_solution 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400'
                            }`}
                          >
                            <CheckSquare size={12} />
                            {comment.is_solution ? 'Çözümü İptal Et' : 'Çözüm Olarak İşaretle'}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleTTS(comment.id, comment.content)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                            currentlyPlayingId === comment.id 
                              ? 'text-rose-600 font-extrabold bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-sm' 
                              : 'text-[#185886] hover:bg-slate-50 px-2.5 py-1.5 rounded-sm'
                          }`}
                        >
                          {currentlyPlayingId === comment.id ? <VolumeX size={13} className="animate-pulse" /> : <Volume2 size={13} />}
                          {currentlyPlayingId === comment.id ? 'Sesi Durdur' : 'Sesli Dinle'}
                        </button>

                        <button 
                          onClick={() => handleQuote(comment.author?.username || 'Anonim', comment.content)}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#185886] hover:bg-slate-50 px-2.5 py-1.5 rounded-sm transition-colors"
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
          <div className="xf-block border border-slate-200 bg-white rounded-sm shadow-sm mt-6">
            <div className="xf-block-header bg-[#eef2f7] border-b border-slate-200 text-[#185886] font-extrabold uppercase text-[12px] tracking-wider py-2.5 px-3">Hızlı Cevap Yaz</div>
            <div className="p-4 bg-white">
              {user ? (
                <form onSubmit={handleReplySubmit}>
                  {/* ACCESSIBLE VOICE TOOLS ACTION BAR (WCAG AAA Support) */}
                  <div className="flex flex-wrap items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      <VoiceInput onTranscript={(text) => setReplyContent(prev => (prev + ' ' + text).trim())} label="Sesle Cevap Yaz" />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Sesle Yaz (STT)</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          isRecording 
                            ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#185886] hover:text-[#185886]'
                        }`}
                      >
                        <Radio size={13} className={isRecording ? 'animate-pulse text-rose-600' : 'text-[#185886]'} />
                        {isRecording ? `${Math.floor(recordingTime / 60).toString().padStart(2, '0')}:${(recordingTime % 60).toString().padStart(2, '0')} Durdur ve Ekle` : 'Sesli Mesaj Kaydet'}
                      </button>
                    </div>
                  </div>

                  <textarea 
                    ref={replyInputRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 min-h-[140px] text-xs sm:text-sm focus:outline-none focus:border-[#185886] text-slate-800 placeholder:text-slate-400 mb-3 leading-relaxed"
                    placeholder="Yardımcı veya açıklayıcı bir cevap yazın..."
                    disabled={submitting}
                  />
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={submitting || !replyContent.trim()}
                      className="bg-[#185886] hover:bg-[#104f75] disabled:opacity-50 text-white px-6 h-10 rounded-sm text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
                  <p className="text-slate-500 text-xs sm:text-sm mb-3">Bu konuya cevap yazabilmek için üye girişi yapmanız gerekmektedir.</p>
                  <Link href="/login" className="bg-[#185886] hover:bg-[#104f75] text-white px-5 py-2.5 rounded-sm text-xs font-bold uppercase transition-colors inline-block">
                    Giriş Yap / Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Breadcrumbs */}
          <div className="bg-slate-50 px-4 py-2.5 flex flex-wrap items-center gap-2 text-[12px] text-slate-600 border border-slate-200 rounded-sm mt-4 shadow-2xs">
            <Link href="/" className="hover:text-[#185886] hover:underline flex items-center gap-1 font-semibold">
              <Home size={12} />
              Ana Sayfa
            </Link>
            <span className="opacity-50">/</span>
            <Link href="/" className="hover:text-[#185886] hover:underline font-semibold">Forumlar</Link>
            {topic.category && (
              <>
                <span className="opacity-50">/</span>
                <Link href={`/discussions?kategori=${topic.category.slug}`} className="hover:text-[#185886] hover:underline font-semibold">{topic.category.name}</Link>
              </>
            )}
            <span className="opacity-50">/</span>
            <span className="font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{topic.title}</span>
          </div>

        </div>

        {/* Sidebar Component */}
        <ClassicSidebar />
      </div>
    </div>
  );
}
